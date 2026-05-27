-- 1. Create the custom status enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_processing_status') THEN
        CREATE TYPE public.document_processing_status AS ENUM ('processing', 'completed', 'failed');
    END IF;
END $$;

-- 2. Add the column with a temporary default of 'completed'
-- This safely auto-fills all historical rows during the migration process
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS embedding_status public.document_processing_status NOT NULL DEFAULT 'completed';

-- 3. Set the ongoing default for ALL FUTURE rows to 'processing'
-- This ensures that any new files uploaded moving forward start as 'processing'
ALTER TABLE public.documents 
ALTER COLUMN embedding_status SET DEFAULT 'processing';
