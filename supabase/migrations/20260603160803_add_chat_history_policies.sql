BEGIN;

-- =======================================================================
-- 1. INITIALIZE SECURITY LAYER ON TABLES
-- =======================================================================
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies to avoid naming conflicts
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users and admins can view chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Allow select session by owner or administrative staff" ON public.chat_sessions;
DROP POLICY IF EXISTS "Allow session insertion by thread owner" ON public.chat_sessions;

DROP POLICY IF EXISTS "Users can view messages in their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages into their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users and admins can view messages in sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow select message by owner or administrative staff" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow message insertion into owned sessions" ON public.chat_messages;


-- =======================================================================
-- 2. CHAT SESSIONS HIERARCHICAL POLICIES
-- =======================================================================

-- SELECT: Allow members to view their own chats, or let administrative functions see everything
CREATE POLICY "Allow select session by owner or administrative staff"
ON public.chat_sessions FOR SELECT
TO authenticated
USING (
  auth.uid() = profile_id 
  OR (SELECT is_admin())
  OR (SELECT is_super_admin())
);

-- INSERT: Only the profile user who owns the session can create it
CREATE POLICY "Allow session insertion by thread owner"
ON public.chat_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);


-- =======================================================================
-- 3. CHAT MESSAGES HIERARCHICAL POLICIES
-- =======================================================================

-- SELECT: Members view their own messages, admins and super admins bypass matching to see everything
CREATE POLICY "Allow select message by owner or administrative staff"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE public.chat_sessions.id = public.chat_messages.session_id
      AND (
        public.chat_sessions.profile_id = auth.uid()
        OR (SELECT is_admin())
        OR (SELECT is_super_admin())
      )
  )
);

-- INSERT: Members can append messages strictly to their own threads
CREATE POLICY "Allow message insertion into owned sessions"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE public.chat_sessions.id = public.chat_messages.session_id
      AND public.chat_sessions.profile_id = auth.uid()
  )
);

COMMIT;
