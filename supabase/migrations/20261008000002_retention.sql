-- ============================================================================
-- Migration: Data Retention & Privacy Compliance (O15 #31)
-- ============================================================================

-- Function to purge stale personal data and enforce data minimization
CREATE OR REPLACE FUNCTION purge_inactive_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Clear CV storage paths for users with no activity in past 12 months
  UPDATE profiles
  SET cv_storage_path = NULL
  WHERE cv_storage_path IS NOT NULL
    AND id NOT IN (
      SELECT DISTINCT seeker_id FROM tasks WHERE created_at > now() - interval '12 months'
      UNION
      SELECT DISTINCT helper_id FROM task_claims WHERE claimed_at > now() - interval '12 months'
    );

  -- 2. Delete ratings older than 12 months
  DELETE FROM ratings
  WHERE created_at < now() - interval '12 months';

  -- 3. Delete processed notification outbox entries older than 30 days
  DELETE FROM notifications_outbox
  WHERE processed_at IS NOT NULL
    AND created_at < now() - interval '30 days';

  -- 4. Delete expired email action tokens older than 14 days
  DELETE FROM email_action_tokens
  WHERE expires_at < now() - interval '14 days';
END;
$$;

-- Schedule daily execution at 03:00 AM via pg_cron if available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'daily-retention-purge',
      '0 3 * * *',
      'SELECT purge_inactive_data();'
    );
  END IF;
END $$;
