ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS xai_api_key TEXT NOT NULL DEFAULT '';