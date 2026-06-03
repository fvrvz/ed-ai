ALTER TABLE system_settings
  ADD COLUMN IF NOT EXISTS openai_api_key TEXT;

CREATE INDEX IF NOT EXISTS idx_system_settings_openai ON system_settings(client_id, openai_api_key);