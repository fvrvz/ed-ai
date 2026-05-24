-- 1. Create the Clients Table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE, -- E.g., 'acme-corp' for clean identification
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the System Settings (Secrets Vault) Table
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    grok_api_key TEXT NOT NULL,
    grok_model_name TEXT NOT NULL DEFAULT 'grok-2-1212',
    r2_account_id TEXT NOT NULL,
    r2_access_key_id TEXT NOT NULL,
    r2_secret_access_key TEXT NOT NULL,
    r2_bucket_name TEXT NOT NULL,
    supabase_service_role_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_client_settings UNIQUE (client_id)
);

-- 3. Turn on Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 4. Set Security Policies
-- Everyone (Authenticated) can view their client information, but admins handle adjustments
CREATE POLICY "Users can view their client details" 
ON public.clients 
FOR SELECT 
TO authenticated 
USING (true);

-- Explicitly block ALL direct frontend access to raw API keys and storage credentials
CREATE POLICY "Block all direct client access to secrets" 
ON public.system_settings 
FOR ALL 
TO authenticated 
USING (false) 
WITH CHECK (false);
