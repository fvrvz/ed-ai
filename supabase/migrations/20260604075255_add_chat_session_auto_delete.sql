BEGIN;

-- 1. Create or replace the function that enforces the 10-session limit
CREATE OR REPLACE FUNCTION public.enforce_max_chat_sessions_per_course()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete any sessions for this user + course that are older than the top 10 recent ones
  DELETE FROM public.chat_sessions
  WHERE id IN (
    SELECT id 
    FROM public.chat_sessions
    WHERE profile_id = NEW.profile_id 
      AND course_id = NEW.course_id
    ORDER BY updated_at DESC
    OFFSET 10
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Clean up any existing trigger version to avoid duplicates
DROP TRIGGER IF EXISTS tr_enforce_max_chat_sessions ON public.chat_sessions;

-- 3. Bind the trigger to run immediately after a new session is inserted
CREATE TRIGGER tr_enforce_max_chat_sessions
AFTER INSERT ON public.chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_max_chat_sessions_per_course();

COMMIT;
