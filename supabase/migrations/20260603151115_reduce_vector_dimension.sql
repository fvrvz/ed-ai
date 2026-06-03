-- Reduce document chunk embedding dimension from 1536 to 768
BEGIN;

ALTER TABLE public.document_chunks
  ALTER COLUMN embedding TYPE vector(768)
  USING (
    ('[' || array_to_string(
      (regexp_split_to_array(regexp_replace(trim(both '[]' FROM embedding::text), '\s+', '', 'g'), ',')::float8[])[1:768],
      ','
    ) || ']')::vector
  );

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
