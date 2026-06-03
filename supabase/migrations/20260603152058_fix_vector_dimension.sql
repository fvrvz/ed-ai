BEGIN;

-- 1. Drop the old column completely (automatically drops any empty indexes)
ALTER TABLE public.document_chunks 
DROP COLUMN IF EXISTS embedding;

-- 2. Add the clean 768-dimension column
ALTER TABLE public.document_chunks 
ADD COLUMN embedding vector(768);

-- 3. Create a fresh HNSW index for optimal 768-dim search speed
CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx 
ON public.document_chunks USING hnsw (embedding vector_cosine_ops);

-- 4. Deploy the updated matching function
CREATE OR REPLACE FUNCTION public.match_course_chunks (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT,
  target_course_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  JOIN public.documents d ON dc.document_id = d.id
  WHERE d.course_id = target_course_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMIT;
