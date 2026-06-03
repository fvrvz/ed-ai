ALTER TABLE system_settings
  DROP COLUMN IF EXISTS openai_api_key,
  ADD COLUMN IF NOT EXISTS huggingface_api_key TEXT;

CREATE INDEX IF NOT EXISTS idx_system_settings_huggingface ON system_settings(client_id, huggingface_api_key);