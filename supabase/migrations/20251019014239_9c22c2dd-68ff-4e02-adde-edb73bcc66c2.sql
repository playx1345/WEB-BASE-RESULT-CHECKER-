-- Ensure pgcrypto extension is enabled (required for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify the extension is loaded
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
  ) THEN
    RAISE EXCEPTION 'pgcrypto extension failed to load';
  END IF;
END $$;