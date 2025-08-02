-- Ultimate AI Coach Database Schema
-- Run this in your Supabase SQL editor

-- 1. Users table (anonymous and email users)
CREATE TABLE IF NOT EXISTS users (
  uid           UUID PRIMARY KEY,
  referrer_uid  UUID,
  email         TEXT UNIQUE,
  upgraded_at   TIMESTAMPTZ,
  metadata      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Messages table with episode support
CREATE TABLE IF NOT EXISTS messages (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid          UUID REFERENCES users(uid),
  episode_id   UUID DEFAULT 'default',
  turn_index   INT,
  role         TEXT CHECK (role IN ('user','assistant')),
  content      TEXT,
  char_count   INT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index for episode queries
CREATE INDEX IF NOT EXISTS idx_messages_episode ON messages(episode_id);
CREATE INDEX IF NOT EXISTS idx_messages_uid_episode ON messages(uid, episode_id);

-- 4. Daily turns view for rate limiting
CREATE OR REPLACE VIEW daily_turns AS
SELECT uid, COUNT(*) AS today
FROM messages
WHERE created_at >= date_trunc('day', NOW())
GROUP BY uid;

-- 5. Enable RLS (optional, uncomment when ready)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies (optional, uncomment when ready)
-- CREATE POLICY user_select_own ON users
--   FOR SELECT USING (auth.uid() = uid);
  
-- CREATE POLICY user_select_messages ON messages
--   FOR SELECT USING (auth.uid() = uid);

-- Phase B tables (for future implementation)
-- CREATE TABLE IF NOT EXISTS episode_summaries (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   uid UUID REFERENCES users(uid),
--   episode_id UUID,
--   summary TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   token_count INT,
--   UNIQUE(episode_id)
-- );