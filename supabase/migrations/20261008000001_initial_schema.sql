-- ============================================================================
-- קשר טוב (Kesher Tov) — Initial Migration
-- Tables, RLS, DB Functions, pg_trgm indexes, and private Storage Bucket
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE company_category AS ENUM ('hitech', 'government', 'banking', 'health', 'education', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE helper_relation AS ENUM ('current_employee', 'past_employee', 'close_connection');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'closed', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE claim_status AS ENUM ('claimed', 'marked_done', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE thanks_status AS ENUM ('pending_first_salary', 'ready_to_pay', 'paid', 'waived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rating_type AS ENUM ('match_accuracy', 'reply_responsiveness', 'fair_closing');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. TABLES

-- 3.1 profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  field TEXT,
  years_of_experience INTEGER DEFAULT 0,
  cv_storage_path TEXT,
  payment_preference JSONB DEFAULT '{"type": "waive"}'::jsonb,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.2 invites
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  max_uses INTEGER DEFAULT 5 NOT NULL,
  used_count INTEGER DEFAULT 0 NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.3 companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he TEXT NOT NULL,
  name_en TEXT,
  website_domain TEXT,
  category company_category DEFAULT 'other' NOT NULL,
  parent_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  helper_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.4 company_aliases
CREATE TABLE IF NOT EXISTS public.company_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  alias TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(company_id, alias)
);

-- 3.5 helper_links
CREATE TABLE IF NOT EXISTS public.helper_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  relation helper_relation NOT NULL,
  help_types TEXT[] NOT NULL DEFAULT '{}',
  is_muted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(helper_id, company_id)
);

-- 3.6 tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE RESTRICT NOT NULL,
  help_types TEXT[] NOT NULL DEFAULT '{}',
  job_url TEXT,
  free_text TEXT,
  thanks_amount INTEGER DEFAULT 0 NOT NULL,
  status task_status DEFAULT 'open' NOT NULL,
  closed_helper_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.7 job_matches
CREATE TABLE IF NOT EXISTS public.job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL UNIQUE,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.8 task_claims
CREATE TABLE IF NOT EXISTS public.task_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  helper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status claim_status DEFAULT 'claimed' NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  done_at TIMESTAMPTZ,
  UNIQUE(task_id, helper_id)
);

-- 3.9 thanks
CREATE TABLE IF NOT EXISTS public.thanks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL UNIQUE,
  seeker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  helper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  status thanks_status DEFAULT 'pending_first_salary' NOT NULL,
  paid_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.10 ratings
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  rater_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rated_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type rating_type NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(task_id, rater_id, type)
);

-- 3.11 email_action_tokens
CREATE TABLE IF NOT EXISTS public.email_action_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '14 days') NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.12 notifications_outbox
CREATE TABLE IF NOT EXISTS public.notifications_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  payload JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  processed_at TIMESTAMPTZ
);

-- 4. INDEXES (including pg_trgm GIN)
CREATE INDEX IF NOT EXISTS idx_companies_name_he_trgm ON public.companies USING gin (name_he gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_companies_name_en_trgm ON public.companies USING gin (name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_company_aliases_alias_trgm ON public.company_aliases USING gin (alias gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_tasks_seeker_id ON public.tasks(seeker_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

CREATE INDEX IF NOT EXISTS idx_task_claims_task_id ON public.task_claims(task_id);
CREATE INDEX IF NOT EXISTS idx_task_claims_helper_id ON public.task_claims(helper_id);

CREATE INDEX IF NOT EXISTS idx_helper_links_company_id ON public.helper_links(company_id);
CREATE INDEX IF NOT EXISTS idx_helper_links_helper_id ON public.helper_links(helper_id);

CREATE INDEX IF NOT EXISTS idx_notifications_outbox_unprocessed ON public.notifications_outbox(created_at) WHERE processed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_email_action_tokens_user ON public.email_action_tokens(user_id) WHERE used_at IS NULL;

-- 5. HELPER TRIGGERS
-- Maintain helper_count on companies
CREATE OR REPLACE FUNCTION public.sync_company_helper_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.companies SET helper_count = helper_count + 1 WHERE id = NEW.company_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.companies SET helper_count = GREATEST(helper_count - 1, 0) WHERE id = OLD.company_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_helper_count ON public.helper_links;
CREATE TRIGGER trg_sync_helper_count
AFTER INSERT OR DELETE ON public.helper_links
FOR EACH ROW EXECUTE FUNCTION public.sync_company_helper_count();

-- 6. BUSINESS FUNCTIONS (SECURITY DEFINER)

-- 6.1 claim_task: row lock, max 3, no self-claim, open status only
CREATE OR REPLACE FUNCTION public.claim_task(p_task_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_task RECORD;
  v_claim_count INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'משתמשת לא מחוברת');
  END IF;

  -- Row lock on task
  SELECT id, seeker_id, company_id, status
  INTO v_task
  FROM public.tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'המשימה לא נמצאה');
  END IF;

  -- Rule: No self claim
  IF v_task.seeker_id = v_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'לא ניתן לקחת משימה של עצמך');
  END IF;

  -- Rule: Status must be open or in_progress
  IF v_task.status NOT IN ('open', 'in_progress') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'המשימה כבר נסגרה או בוטלה');
  END IF;

  -- Check existing claims
  SELECT COUNT(*) INTO v_claim_count
  FROM public.task_claims
  WHERE task_id = p_task_id;

  -- Rule: Max 3 claims per task
  IF v_claim_count >= 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'משימה זו כבר נלקחה על ידי 3 עוזרות (המקסימום המותר)');
  END IF;

  -- Insert claim (unique constraint prevents double claim)
  BEGIN
    INSERT INTO public.task_claims (task_id, helper_id, status)
    VALUES (p_task_id, v_user_id, 'claimed');
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'כבר לקחת משימה זו בעבר');
  END;

  -- Update task status to in_progress if still open
  IF v_task.status = 'open' THEN
    UPDATE public.tasks SET status = 'in_progress', updated_at = now() WHERE id = p_task_id;
  END IF;

  -- Insert event to outbox
  INSERT INTO public.notifications_outbox (event_type, task_id, actor_id, payload)
  VALUES ('task_claimed', p_task_id, v_user_id, jsonb_build_object('helper_id', v_user_id, 'claim_index', v_claim_count + 1));

  RETURN jsonb_build_object('ok', true, 'data', jsonb_build_object('task_id', p_task_id, 'status', 'claimed'));
END;
$$;

-- 6.2 close_task: only seeker, helper must be claimer, sets closed status, locks further claims, creates thanks row
CREATE OR REPLACE FUNCTION public.close_task(p_task_id UUID, p_helper_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_task RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'משתמשת לא מחוברת');
  END IF;

  -- Row lock on task
  SELECT id, seeker_id, thanks_amount, status
  INTO v_task
  FROM public.tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'המשימה לא נמצאה');
  END IF;

  -- Rule: Only the seeker can close
  IF v_task.seeker_id != v_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'רק פותחת המשימה יכולה לסגור אותה');
  END IF;

  -- If helper specified, verify she is a claimer
  IF p_helper_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.task_claims
      WHERE task_id = p_task_id AND helper_id = p_helper_id
    ) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'העוזרת שנבחרה לא לקחה משימה זו');
    END IF;
  END IF;

  -- Close task
  UPDATE public.tasks
  SET status = 'closed',
      closed_helper_id = p_helper_id,
      closed_at = now(),
      updated_at = now()
  WHERE id = p_task_id;

  -- Create at most one thanks row if a helper is chosen
  IF p_helper_id IS NOT NULL THEN
    INSERT INTO public.thanks (task_id, seeker_id, helper_id, amount, status)
    VALUES (p_task_id, v_user_id, p_helper_id, v_task.thanks_amount, 'pending_first_salary')
    ON CONFLICT (task_id) DO NOTHING;
  END IF;

  -- Insert event to outbox
  INSERT INTO public.notifications_outbox (event_type, task_id, actor_id, payload)
  VALUES ('task_closed', p_task_id, v_user_id, jsonb_build_object('closed_helper_id', p_helper_id));

  RETURN jsonb_build_object('ok', true, 'data', jsonb_build_object('task_id', p_task_id, 'status', 'closed'));
END;
$$;

-- 6.3 search_companies: pg_trgm similarity, ranking, typo tolerant
CREATE OR REPLACE FUNCTION public.search_companies(p_query TEXT, p_limit INT DEFAULT 8)
RETURNS TABLE (
  id UUID,
  name_he TEXT,
  name_en TEXT,
  website_domain TEXT,
  category company_category,
  helper_count INT,
  similarity REAL
)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT ON (c.id)
    c.id,
    c.name_he,
    c.name_en,
    c.website_domain,
    c.category,
    c.helper_count,
    GREATEST(
      similarity(c.name_he, p_query),
      COALESCE(similarity(c.name_en, p_query), 0),
      COALESCE(similarity(ca.alias, p_query), 0)
    ) AS similarity
  FROM public.companies c
  LEFT JOIN public.company_aliases ca ON ca.company_id = c.id
  WHERE
    c.name_he % p_query
    OR (c.name_en IS NOT NULL AND c.name_en % p_query)
    OR (ca.alias IS NOT NULL AND ca.alias % p_query)
    OR c.name_he ILIKE '%' || p_query || '%'
    OR (c.name_en IS NOT NULL AND c.name_en ILIKE '%' || p_query || '%')
    OR (ca.alias IS NOT NULL AND ca.alias ILIKE '%' || p_query || '%')
  ORDER BY c.id, similarity DESC
  LIMIT p_limit;
$$;

-- 6.4 redeem_invite: atomic invite redemption creating profile
CREATE OR REPLACE FUNCTION public.redeem_invite(p_code TEXT, p_full_name TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_invite RECORD;
  v_name TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'משתמשת לא מחוברת');
  END IF;

  -- Lock invite
  SELECT id, inviter_id, max_uses, used_count, expires_at
  INTO v_invite
  FROM public.invites
  WHERE code = TRIM(p_code)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'קוד ההזמנה אינו קיים');
  END IF;

  IF v_invite.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'פג תוקפו של קוד ההזמנה');
  END IF;

  IF v_invite.used_count >= v_invite.max_uses THEN
    RETURN jsonb_build_object('ok', false, 'error', 'קוד ההזמנה הגיע למכסת השימושים המרבית');
  END IF;

  v_name := COALESCE(NULLIF(TRIM(p_full_name), ''), 'משתמשת חדשה');

  -- Create or update profile
  INSERT INTO public.profiles (id, full_name, invited_by)
  VALUES (v_user_id, v_name, v_invite.inviter_id)
  ON CONFLICT (id) DO UPDATE
  SET invited_by = COALESCE(public.profiles.invited_by, EXCLUDED.invited_by);

  -- Increment invite used count
  UPDATE public.invites
  SET used_count = used_count + 1
  WHERE id = v_invite.id;

  RETURN jsonb_build_object('ok', true, 'data', jsonb_build_object('profile_id', v_user_id, 'invited_by', v_invite.inviter_id));
END;
$$;

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helper_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_action_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_outbox ENABLE ROW LEVEL SECURITY;

-- 7.1 profiles policies
-- A user sees her own profile
-- A seeker sees the profile of helpers who claimed her tasks
-- A helper sees the profile of seekers whose tasks she claimed (ONLY after claim!)
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  auth.uid() = id
  OR id IN (
    -- Claimed helpers seen by seeker
    SELECT tc.helper_id FROM public.task_claims tc
    JOIN public.tasks t ON t.id = tc.task_id
    WHERE t.seeker_id = auth.uid()
  )
  OR id IN (
    -- Seekers seen by helper who claimed her task
    SELECT t.seeker_id FROM public.tasks t
    JOIN public.task_claims tc ON tc.task_id = t.id
    WHERE tc.helper_id = auth.uid()
  )
);

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- 7.2 invites policies
CREATE POLICY "invites_select_policy" ON public.invites
FOR SELECT USING (
  auth.uid() = inviter_id
  OR expires_at > now() -- allows checking invite validity
);

CREATE POLICY "invites_insert_policy" ON public.invites
FOR INSERT WITH CHECK (
  auth.uid() = inviter_id
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_blocked = true)
);

-- 7.3 companies & aliases policies (readable by all authenticated)
CREATE POLICY "companies_select_policy" ON public.companies
FOR SELECT USING (true);

CREATE POLICY "companies_insert_policy" ON public.companies
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "company_aliases_select_policy" ON public.company_aliases
FOR SELECT USING (true);

-- 7.4 helper_links policies (helper sees and manages only her own)
CREATE POLICY "helper_links_select_policy" ON public.helper_links
FOR SELECT USING (auth.uid() = helper_id);

CREATE POLICY "helper_links_insert_policy" ON public.helper_links
FOR INSERT WITH CHECK (auth.uid() = helper_id);

CREATE POLICY "helper_links_update_policy" ON public.helper_links
FOR UPDATE USING (auth.uid() = helper_id);

CREATE POLICY "helper_links_delete_policy" ON public.helper_links
FOR DELETE USING (auth.uid() = helper_id);

-- 7.5 tasks policies
-- Seeker sees her own tasks
-- Helper sees tasks she claimed OR open tasks for companies she has an active link with
CREATE POLICY "tasks_select_policy" ON public.tasks
FOR SELECT USING (
  auth.uid() = seeker_id
  OR id IN (SELECT task_id FROM public.task_claims WHERE helper_id = auth.uid())
  OR (
    status IN ('open', 'in_progress')
    AND company_id IN (
      SELECT company_id FROM public.helper_links
      WHERE helper_id = auth.uid() AND is_muted = false
    )
  )
);

CREATE POLICY "tasks_insert_policy" ON public.tasks
FOR INSERT WITH CHECK (
  auth.uid() = seeker_id
  AND (
    SELECT COUNT(*) FROM public.tasks
    WHERE seeker_id = auth.uid() AND status IN ('open', 'in_progress')
  ) < 5
);

CREATE POLICY "tasks_update_policy" ON public.tasks
FOR UPDATE USING (auth.uid() = seeker_id);

-- 7.6 job_matches policies
CREATE POLICY "job_matches_select_policy" ON public.job_matches
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id)
);

CREATE POLICY "job_matches_insert_policy" ON public.job_matches
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.seeker_id = auth.uid())
);

-- 7.7 task_claims policies
-- Seeker sees all claims on her tasks.
-- Helper sees ONLY HER OWN claims (never sees other helpers).
CREATE POLICY "task_claims_select_policy" ON public.task_claims
FOR SELECT USING (
  auth.uid() = helper_id
  OR EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.seeker_id = auth.uid())
);

CREATE POLICY "task_claims_update_policy" ON public.task_claims
FOR UPDATE USING (auth.uid() = helper_id);

-- 7.8 thanks policies
CREATE POLICY "thanks_select_policy" ON public.thanks
FOR SELECT USING (
  auth.uid() IN (seeker_id, helper_id)
);

CREATE POLICY "thanks_update_policy" ON public.thanks
FOR UPDATE USING (
  auth.uid() IN (seeker_id, helper_id)
);

-- 7.9 ratings policies
CREATE POLICY "ratings_select_policy" ON public.ratings
FOR SELECT USING (
  auth.uid() IN (rater_id, rated_id)
  OR EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_id AND t.seeker_id = auth.uid()
  )
);

CREATE POLICY "ratings_insert_policy" ON public.ratings
FOR INSERT WITH CHECK (
  auth.uid() = rater_id
  AND (
    -- Rater must be participant (seeker or claimer)
    EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.seeker_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.task_claims tc WHERE tc.task_id = task_id AND tc.helper_id = auth.uid())
  )
);

-- 7.10 email_action_tokens policies
CREATE POLICY "tokens_select_own" ON public.email_action_tokens
FOR SELECT USING (auth.uid() = user_id);

-- 7.11 notifications_outbox policies
-- Only service role by default (no public access)

-- 8. STORAGE BUCKET FOR CVs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cvs', 'cvs', false, 5242880, ARRAY['application/pdf']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- Storage policies for cvs bucket:
-- Owner can upload and manage their CV
CREATE POLICY "cvs_owner_access" ON storage.objects
FOR ALL USING (
  bucket_id = 'cvs'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Helper can read CV of seeker if she claimed the task
CREATE POLICY "cvs_claimed_helper_read" ON storage.objects
FOR SELECT USING (
  bucket_id = 'cvs'
  AND EXISTS (
    SELECT 1 FROM public.task_claims tc
    JOIN public.tasks t ON t.id = tc.task_id
    WHERE tc.helper_id = auth.uid()
    AND t.seeker_id::text = (storage.foldername(name))[1]
  )
);
