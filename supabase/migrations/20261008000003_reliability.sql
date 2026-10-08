-- =====================================================================
-- Migration: 20261008000003_reliability.sql
-- Description: Reliability scoring, fair-closing views, and automated threshold rules (O11 / #19)
-- =====================================================================

-- 1. User Reports Table for Misconduct Tracking
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reported_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT uq_user_report UNIQUE (reporter_id, reported_id, task_id)
);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_reports_insert_policy" ON public.user_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id AND reporter_id <> reported_id);

CREATE POLICY "user_reports_select_policy" ON public.user_reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

-- 2. Trigger on User Reports: Auto-block after 3 distinct reports in 12 months & alert inviter
CREATE OR REPLACE FUNCTION public.handle_user_report_threshold()
RETURNS TRIGGER AS $$
DECLARE
  v_distinct_reporters INT;
  v_inviter_id UUID;
BEGIN
  -- Count distinct reporters against the reported user in the last 12 months
  SELECT COUNT(DISTINCT reporter_id)
  INTO v_distinct_reporters
  FROM public.user_reports
  WHERE reported_id = NEW.reported_id
    AND created_at >= (now() - interval '12 months');

  IF v_distinct_reporters >= 3 THEN
    -- Block the profile
    UPDATE public.profiles
    SET is_blocked = TRUE
    WHERE id = NEW.reported_id;

    -- Look up inviter
    SELECT invited_by INTO v_inviter_id
    FROM public.profiles
    WHERE id = NEW.reported_id;

    -- If there is an inviter, send notification alert via outbox
    IF v_inviter_id IS NOT NULL THEN
      INSERT INTO public.notifications_outbox (
        event_type,
        actor_id,
        payload
      ) VALUES (
        'inviter_referral_blocked',
        NEW.reported_id,
        jsonb_build_object(
          'inviter_id', v_inviter_id,
          'blocked_user_id', NEW.reported_id,
          'reason', 'משתמשת שהוזמנה על ידך נחסמה עקב 3 תלונות שונות'
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_user_report_threshold ON public.user_reports;
CREATE TRIGGER trg_user_report_threshold
AFTER INSERT ON public.user_reports
FOR EACH ROW EXECUTE FUNCTION public.handle_user_report_threshold();

-- 3. View: Seeker Reliability
CREATE OR REPLACE VIEW public.seeker_reliability AS
WITH seeker_tasks AS (
  SELECT
    seeker_id,
    COUNT(*) AS total_tasks,
    COUNT(*) FILTER (WHERE status = 'closed') AS closed_tasks,
    COUNT(*) FILTER (WHERE status = 'closed' AND closed_helper_id IS NOT NULL) AS fair_closed_tasks
  FROM public.tasks
  GROUP BY seeker_id
),
seeker_flags AS (
  SELECT
    rated_id AS seeker_id,
    COUNT(DISTINCT rater_id) FILTER (
      WHERE type = 'fair_closing' AND score = 0 AND created_at >= (now() - interval '12 months')
    ) AS not_closed_flags,
    COALESCE(AVG(score) FILTER (WHERE type = 'match_accuracy'), 100) AS match_accuracy_avg
  FROM public.ratings
  GROUP BY rated_id
),
seeker_reports AS (
  SELECT
    reported_id AS seeker_id,
    COUNT(DISTINCT reporter_id) FILTER (WHERE created_at >= (now() - interval '12 months')) AS report_count
  FROM public.user_reports
  GROUP BY reported_id
)
SELECT
  p.id AS seeker_id,
  COALESCE(st.total_tasks, 0) AS total_tasks,
  COALESCE(st.closed_tasks, 0) AS closed_tasks,
  CASE
    WHEN COALESCE(st.closed_tasks, 0) = 0 THEN 100
    ELSE ROUND((COALESCE(st.fair_closed_tasks, 0)::numeric / st.closed_tasks) * 100)
  END AS fair_close_rate,
  ROUND(COALESCE(sf.match_accuracy_avg, 100)) AS match_accuracy_avg,
  COALESCE(sf.not_closed_flags, 0) AS not_closed_flags,
  (COALESCE(sf.not_closed_flags, 0) >= 3) AS is_restricted,
  (p.is_blocked OR COALESCE(sr.report_count, 0) >= 3) AS is_blocked,
  (COALESCE(st.total_tasks, 0) >= 3) AS show_metrics
FROM public.profiles p
LEFT JOIN seeker_tasks st ON st.seeker_id = p.id
LEFT JOIN seeker_flags sf ON sf.seeker_id = p.id
LEFT JOIN seeker_reports sr ON sr.seeker_id = p.id;

-- 4. View: Helper Reliability
CREATE OR REPLACE VIEW public.helper_reliability AS
WITH helper_stats AS (
  SELECT
    helper_id,
    COUNT(*) AS total_claims,
    COUNT(*) FILTER (WHERE status = 'marked_done') AS completed_claims
  FROM public.task_claims
  GROUP BY helper_id
),
helper_flags AS (
  SELECT
    rated_id AS helper_id,
    COUNT(DISTINCT rater_id) FILTER (
      WHERE type = 'reply_responsiveness' AND score = 0 AND created_at >= (now() - interval '12 months')
    ) AS no_reply_flags,
    COALESCE(AVG(score) FILTER (WHERE type = 'reply_responsiveness'), 100) AS reply_score_avg
  FROM public.ratings
  GROUP BY rated_id
)
SELECT
  p.id AS helper_id,
  COALESCE(hs.completed_claims, 0) AS helped_count,
  CASE
    WHEN COALESCE(hs.total_claims, 0) = 0 THEN 100
    ELSE ROUND((COALESCE(hs.completed_claims, 0)::numeric / hs.total_claims) * 100)
  END AS reply_rate,
  COALESCE(hf.no_reply_flags, 0) AS no_reply_flags,
  (COALESCE(hf.no_reply_flags, 0) >= 3) AS is_deprioritized,
  (COALESCE(hs.completed_claims, 0) >= 3) AS show_metrics
FROM public.profiles p
LEFT JOIN helper_stats hs ON hs.helper_id = p.id
LEFT JOIN helper_flags hf ON hf.helper_id = p.id;

-- 5. Trigger to enforce task creation limits based on seeker reliability
CREATE OR REPLACE FUNCTION public.check_seeker_task_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_is_blocked BOOLEAN;
  v_is_restricted BOOLEAN;
  v_open_tasks INT;
  v_max_allowed INT;
BEGIN
  -- 1. Check if user is blocked
  SELECT is_blocked INTO v_is_blocked
  FROM public.profiles
  WHERE id = NEW.seeker_id;

  IF v_is_blocked THEN
    RAISE EXCEPTION 'חשבונך מושעה. לא ניתן לפתוח משימות חדשות.';
  END IF;

  -- 2. Check if seeker is restricted (>= 3 not_closed flags in last 12 months)
  SELECT is_restricted INTO v_is_restricted
  FROM public.seeker_reliability
  WHERE seeker_id = NEW.seeker_id;

  v_max_allowed := CASE WHEN v_is_restricted THEN 2 ELSE 5 END;

  -- 3. Count current open tasks for this seeker
  SELECT COUNT(*)
  INTO v_open_tasks
  FROM public.tasks
  WHERE seeker_id = NEW.seeker_id
    AND status IN ('open', 'in_progress');

  IF v_open_tasks >= v_max_allowed THEN
    RAISE EXCEPTION 'חריגה ממכסת המשימות הפתוחות (מקסימום %). נא להמתין או לסגור משימות קיימות.', v_max_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_seeker_task_limits ON public.tasks;
CREATE TRIGGER trg_check_seeker_task_limits
BEFORE INSERT ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.check_seeker_task_limits();
