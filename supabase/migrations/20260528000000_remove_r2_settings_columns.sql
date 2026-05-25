ALTER TABLE public.system_settings
    DROP COLUMN IF EXISTS r2_account_id,
    DROP COLUMN IF EXISTS r2_access_key_id,
    DROP COLUMN IF EXISTS r2_secret_access_key,
    DROP COLUMN IF EXISTS r2_bucket_name;
