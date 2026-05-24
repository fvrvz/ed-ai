-- Speeds up the relational filtering phase inside the match_course_chunks function
CREATE INDEX IF NOT EXISTS documents_course_id_idx ON public.documents (course_id);
