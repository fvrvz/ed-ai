-- 1. Create the Courses Table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Modify the Documents Table to enforce a foreign key link to Courses
-- If your documents table already exists from earlier, we add the constraint safely:
ALTER TABLE public.documents 
  ALTER COLUMN course_id SET NOT NULL,
  ADD CONSTRAINT fk_documents_course_id 
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- 3. Turn on Row Level Security (RLS) on Courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 4. Set Tenant-Isolated RLS Policies for Courses
CREATE POLICY "Users can only view their own client's courses" 
ON public.courses 
FOR SELECT 
TO authenticated 
USING (client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can insert courses for their client" 
ON public.courses 
FOR INSERT 
TO authenticated 
WITH CHECK (
  client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
  AND (SELECT public.is_admin())
);

CREATE POLICY "Admins can update courses for their client" 
ON public.courses 
FOR UPDATE 
TO authenticated 
USING (
  client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
  AND (SELECT public.is_admin())
)
WITH CHECK (
  client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
  AND (SELECT public.is_admin())
);

-- 5. Build high-performance B-Tree relational indexing pointers
CREATE INDEX IF NOT EXISTS courses_client_id_idx ON public.courses (client_id);
CREATE INDEX IF NOT EXISTS documents_course_id_idx ON public.documents (course_id);
