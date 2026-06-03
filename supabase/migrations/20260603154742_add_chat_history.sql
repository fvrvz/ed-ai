BEGIN;

-- 1. Create Chat Sessions table (linked to your custom profiles table)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Chat Messages table (unchanged, tracks dialogue steps)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create high-performance index anchors
-- Accelerates loading the user's sidebar history list
CREATE INDEX IF NOT EXISTS idx_chat_sessions_profile_course 
ON public.chat_sessions (profile_id, course_id, updated_at DESC);

-- Accelerates retrieving the actual conversation lines inside a selected chat
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_order 
ON public.chat_messages (session_id, created_at ASC);

-- 4. Set up auto-sorting trigger to float active chats to the top
CREATE OR REPLACE FUNCTION public.update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_sessions
  SET updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_chat_session_timestamp
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_session_timestamp();

COMMIT;
