-- =====================================================================
-- Migration: 20261008000004_wave_dispatch.sql
-- Description: Wave dispatch (שליחה בגלים) scheduling & auto-cancellation (O16 / #33)
-- =====================================================================

-- 1. Add wave and scheduling columns to notifications_outbox
ALTER TABLE public.notifications_outbox
  ADD COLUMN IF NOT EXISTS wave_number INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ DEFAULT now() NOT NULL;

-- Index for queue consumers to efficiently fetch ready notifications
CREATE INDEX IF NOT EXISTS idx_notifications_outbox_scheduled
  ON public.notifications_outbox (scheduled_for)
  WHERE processed_at IS NULL;

-- 2. Function to cancel future wave notifications when a task reaches max claims or closes
CREATE OR REPLACE FUNCTION public.cancel_future_task_waves(p_task_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark future unprocessed wave notifications for this task as cancelled/processed
  UPDATE public.notifications_outbox
  SET processed_at = now()
  WHERE task_id = p_task_id
    AND processed_at IS NULL
    AND scheduled_for > now();
END;
$$;

-- 3. Trigger on task_claims: cancel future waves if claims reach 3
CREATE OR REPLACE FUNCTION public.check_claims_and_cancel_waves()
RETURNS TRIGGER AS $$
DECLARE
  v_claim_count INT;
BEGIN
  SELECT COUNT(*)
  INTO v_claim_count
  FROM public.task_claims
  WHERE task_id = NEW.task_id
    AND status IN ('claimed', 'marked_done');

  IF v_claim_count >= 3 THEN
    PERFORM public.cancel_future_task_waves(NEW.task_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cancel_waves_on_claims ON public.task_claims;
CREATE TRIGGER trg_cancel_waves_on_claims
AFTER INSERT OR UPDATE ON public.task_claims
FOR EACH ROW EXECUTE FUNCTION public.check_claims_and_cancel_waves();

-- 4. Trigger on tasks: cancel future waves when task is closed or cancelled
CREATE OR REPLACE FUNCTION public.check_task_status_and_cancel_waves()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('closed', 'cancelled', 'expired') THEN
    PERFORM public.cancel_future_task_waves(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cancel_waves_on_task_close ON public.tasks;
CREATE TRIGGER trg_cancel_waves_on_task_close
AFTER UPDATE OF status ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.check_task_status_and_cancel_waves();
