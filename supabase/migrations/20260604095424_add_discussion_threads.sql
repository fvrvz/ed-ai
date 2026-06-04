BEGIN;

-- =======================================================================
-- 1. DESTRUCTIVE SCHEMA RESET (CLEAN PLAYGROUND SETUP)
-- =======================================================================
DROP TABLE IF EXISTS public.discussion_messages CASCADE;
DROP TABLE IF EXISTS public.discussions CASCADE;

-- =======================================================================
-- 2. CORE TABLE STRUCTURES
-- =======================================================================

-- Create Discussions (Thread Parent) Table
CREATE TABLE public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  -- ON DELETE SET NULL ensures thread persists even if creator account is deleted
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, 
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'opened' CHECK (status IN ('opened', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Discussion Messages Table
CREATE TABLE public.discussion_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  -- ON DELETE SET NULL preserves conversational chat bubbles if user is deleted
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, 
  role TEXT NOT NULL CHECK (role IN ('member', 'admin', 'edai', 'super_admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =======================================================================
-- 3. SPEED OPTIMIZED ANCHORS (INDEXES)
-- =======================================================================
CREATE INDEX IF NOT EXISTS idx_discussions_client_course 
ON public.discussions (client_id, course_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_discussion_messages_stream 
ON public.discussion_messages (discussion_id, created_at ASC);

-- Automatic sidebar sorter trigger
CREATE OR REPLACE FUNCTION public.update_discussion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.discussions SET updated_at = NOW() WHERE id = NEW.discussion_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_discussion_timestamp
AFTER INSERT ON public.discussion_messages
FOR EACH ROW EXECUTE FUNCTION public.update_discussion_timestamp();


-- =======================================================================
-- 4. BUSINESS LOGIC POLICIES (RLS CORES)
-- =======================================================================
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_messages ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------
-- A. DISCUSSIONS SECURITY FIREWALL
-- -----------------------------------------------------------------------

-- SELECT: Super Admins view all, Admins see client scope, Members see course assignments
CREATE POLICY "Discussions select isolation layer"
ON public.discussions FOR SELECT
TO authenticated
USING (
  (SELECT is_super_admin())
  OR ((SELECT is_admin()) AND client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.course_assignments ca
    WHERE ca.user_id = auth.uid() AND ca.course_id = public.discussions.course_id
  )
);

-- INSERT: Restrict topic creations based on user clearance hierarchies
CREATE POLICY "Discussions insert isolation layer"
ON public.discussions FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT is_super_admin())
  OR ((SELECT is_admin()) AND client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()))
  OR (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.course_assignments ca
      WHERE ca.user_id = auth.uid() AND ca.course_id = course_id
    )
  )
);

-- UPDATE: Thread closing privileges (Super admins, client admins, or original thread creator)
CREATE POLICY "Discussions update visibility layer"
ON public.discussions FOR UPDATE
TO authenticated
USING (
  (SELECT is_super_admin())
  OR ((SELECT is_admin()) AND client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()))
  OR (auth.uid() = user_id)
)
WITH CHECK (
  status IN ('opened', 'closed')
);


-- -----------------------------------------------------------------------
-- B. DISCUSSION MESSAGES SECURITY FIREWALL
-- -----------------------------------------------------------------------

-- SELECT: Mirror access constraints downward from parent thread access rights
CREATE POLICY "Discussion messages select isolation layer"
ON public.discussion_messages FOR SELECT
TO authenticated
USING (
  (SELECT is_super_admin())
  OR EXISTS (
    SELECT 1 FROM public.discussions d
    WHERE d.id = public.discussion_messages.discussion_id
      AND (
        ((SELECT is_admin()) AND d.client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()))
        OR EXISTS (
          SELECT 1 FROM public.course_assignments ca
          WHERE ca.user_id = auth.uid() AND ca.course_id = d.course_id
        )
      )
  )
);

-- INSERT: Prevent users from impersonating other active identities during postings
CREATE POLICY "Discussion messages insert isolation layer"
ON public.discussion_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND (
    (SELECT is_super_admin())
    OR EXISTS (
      SELECT 1 FROM public.discussions d
      WHERE d.id = discussion_id
        AND (
          ((SELECT is_admin()) AND d.client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()))
          OR EXISTS (
            SELECT 1 FROM public.course_assignments ca
            WHERE ca.user_id = auth.uid() AND ca.course_id = d.course_id
          )
        )
    )
  )
);

-- UPDATE: Absolute modification block protection
CREATE POLICY "Discussion messages update isolation layer"
ON public.discussion_messages FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMIT;
