-- 1. Create the User Groups Table
CREATE TABLE public.user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create a Junction Table to map Users into Groups
CREATE TABLE public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.user_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_group_user UNIQUE (group_id, user_id)
);

-- 3. Create the Central Course Assignments Table
-- This table handles assigning a course to a single user OR an entire group
CREATE TABLE public.course_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Nullable (if assigned to group)
    group_id UUID REFERENCES public.user_groups(id) ON DELETE CASCADE, -- Nullable (if assigned to individual)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Ensure an assignment is pointing to either a user or a group, not empty
    CONSTRAINT check_assignment_target CHECK (
        (user_id IS NOT NULL AND group_id IS NULL) OR 
        (user_id IS NULL AND group_id IS NOT NULL)
    )
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;

-- 5. Set Security Policies (Admins Manage everything, Members can only Read)

-- USER GROUPS & MEMBERS POLICIES
CREATE POLICY "Users can view groups in their client tenant"
ON public.user_groups FOR SELECT TO authenticated
USING (client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage groups"
ON public.user_groups FOR ALL TO authenticated
USING (client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()) AND public.is_admin());

CREATE POLICY "Users can view group memberships"
ON public.group_members FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage group memberships"
ON public.group_members FOR ALL TO authenticated
USING (public.is_admin());


-- COURSE ASSIGNMENTS POLICIES
CREATE POLICY "Admins can manage all assignments"
ON public.course_assignments FOR ALL TO authenticated
USING (client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()) AND public.is_admin());

-- 🔥 CRITICAL MEMBER RULE: Members can only see rows assigned to them directly OR via their group
CREATE POLICY "Members can see their assigned courses"
ON public.course_assignments FOR SELECT TO authenticated
USING (
    user_id = auth.uid() 
    OR 
    group_id IN (SELECT gm.group_id FROM public.group_members gm WHERE gm.user_id = auth.uid())
);


-- 6. Modify the Courses Table RLS (Update Existing Policy)
-- Drop the wide open "view all client courses" policy for members, replace it with assignment checking
DROP POLICY IF EXISTS "Users can only view their own client's courses" ON public.courses;

CREATE POLICY "Admins can view all tenant courses"
ON public.courses FOR SELECT TO authenticated
USING (client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()) AND public.is_admin());

CREATE POLICY "Members can view only assigned courses"
ON public.courses FOR SELECT TO authenticated
USING (
    id IN (
        SELECT ca.course_id FROM public.course_assignments ca
        WHERE ca.user_id = auth.uid()
        OR ca.group_id IN (SELECT gm.group_id FROM public.group_members gm WHERE gm.user_id = auth.uid())
    )
);

-- 7. Performance Optimizations Indexes
CREATE INDEX IF NOT EXISTS course_assignments_user_idx ON public.course_assignments (user_id);
CREATE INDEX IF NOT EXISTS course_assignments_group_idx ON public.course_assignments (group_id);
CREATE INDEX IF NOT EXISTS group_members_user_idx ON public.group_members (user_id);
