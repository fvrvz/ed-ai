-- 1. Ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the Parent Documents Table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    course_id UUID, -- Optional: Link to a specific course if needed
    name TEXT NOT NULL, -- e.g., "manual.pdf"
    storage_url TEXT NOT NULL, -- The Cloudflare R2 file URL path
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the Document Chunks Table for Vectors
CREATE TABLE public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- The raw text segment
    embedding VECTOR(1536) NOT NULL, -- 1536 matches standard OpenAI / Grok embedding sizes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- 5. Set Security Policies (Tenant Isolation)
-- Ensure users can only see documents belonging to their specific client organization
CREATE POLICY "Users can view their client documents" 
ON public.documents 
FOR SELECT 
TO authenticated 
USING (client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view their client chunks" 
ON public.document_chunks 
FOR SELECT 
TO authenticated 
USING (client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid()));

-- 6. Create Vector Indexing for Fast Semantic Search
-- We use Cosine Distance (vector_cosine_ops) as it is standard for RAG applications [1]
CREATE INDEX document_chunks_embedding_hnsw_idx 
ON public.document_chunks 
USING hnsw (embedding vector_cosine_ops);
