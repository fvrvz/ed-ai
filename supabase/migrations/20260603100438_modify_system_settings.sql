-- Remove xAI/Grok columns and add Groq-specific columns
ALTER TABLE system_settings
  DROP COLUMN IF EXISTS grok_api_key,
  DROP COLUMN IF EXISTS grok_model_name,
  DROP COLUMN IF EXISTS xai_api_key,
  ADD COLUMN groq_api_key TEXT,
  ADD COLUMN groq_model_name TEXT DEFAULT 'llama-3.3-70b-versatile';

-- Ensure the columns are indexed for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_system_settings_groq ON system_settings(client_id, groq_api_key);
