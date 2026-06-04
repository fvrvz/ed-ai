BEGIN;

-- =======================================================================
-- 1. SCHEMA UPDATES ( chat_sessions )
-- =======================================================================

-- Add client_id column to chat_sessions linking to your clients table
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;

-- Backfill data: Inherit the client_id mapping via the linked courses relationship 
-- (This ensures any trial rows or tests remain valid during the migration step)
UPDATE public.chat_sessions cs
SET client_id = c.client_id
FROM public.courses c
WHERE cs.course_id = c.id;

-- Make client_id column NOT NULL now that backfilling is complete
ALTER TABLE public.chat_sessions 
ALTER COLUMN client_id SET NOT NULL;


-- =======================================================================
-- 2. RESET POLICIES TO PREVENT NAMING OVERLAPS
-- =======================================================================
DROP POLICY IF EXISTS "Allow select session by owner or administrative staff" ON public.chat_sessions;
DROP POLICY IF EXISTS "Allow session insertion by thread owner" ON public.chat_sessions;
DROP POLICY IF EXISTS "Allow select message by owner or administrative staff" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow message insertion into owned sessions" ON public.chat_messages;


-- =======================================================================
-- 3. UPGRADED CHAT SESSIONS HIERARCHICAL POLICIES
-- =======================================================================

-- SELECT: Members view their own chats, Admins see chats inside their client scope, Super Admins see all
CREATE POLICY "Allow select session by owner or administrative staff"
ON public.chat_sessions FOR SELECT
TO authenticated
USING (
  (SELECT is_super_admin())
  OR ((SELECT is_admin()) AND client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()))
  OR (auth.uid() = profile_id) 
);

-- INSERT: Enforce ownership checks and ensure users map correct client context identifiers
CREATE POLICY "Allow session insertion by thread owner"
ON public.chat_sessions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = profile_id
  AND (
    (SELECT is_super_admin())
    OR client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
  )
);


-- =======================================================================
-- 4. UPGRADED CHAT MESSAGES HIERARCHICAL POLICIES
-- =======================================================================

-- SELECT: Members read own messages, Admins read client-scoped logs, Super Admins bypass checks
CREATE POLICY "Allow select message by owner or administrative staff"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions cs
    WHERE cs.id = public.chat_messages.session_id
      AND (
        (SELECT is_super_admin())
        OR ((SELECT is_admin()) AND cs.client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()))
        OR (cs.profile_id = auth.uid())
      )
  )
);

-- INSERT: Members append data strings strictly into their own conversation channels
CREATE POLICY "Allow message insertion into owned sessions"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_sessions cs
    WHERE cs.id = public.chat_messages.session_id
      AND cs.profile_id = auth.uid()
  )
);

COMMIT;
