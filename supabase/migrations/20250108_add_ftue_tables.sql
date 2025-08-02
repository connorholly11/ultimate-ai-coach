-- Add new tables for FTUE personality profiles, memories, and conversations

-- Personality profiles table
CREATE TABLE IF NOT EXISTS personality_profiles (
  uid UUID PRIMARY KEY REFERENCES users(uid),
  anon_uid UUID,
  big_five JSONB,
  values TEXT[],
  attachment_style TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memories/breakthrough moments table
CREATE TABLE IF NOT EXISTS memories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid UUID REFERENCES users(uid),
  anon_uid UUID,
  title TEXT NOT NULL,
  insight TEXT NOT NULL,
  type TEXT CHECK (type IN ('realization', 'growth', 'milestone')),
  conversation_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid UUID REFERENCES users(uid),
  anon_uid UUID,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alter quest_templates table to add new columns
ALTER TABLE quest_templates 
ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 999,
ADD COLUMN IF NOT EXISTS is_assessment BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_personality_profiles_anon_uid ON personality_profiles(anon_uid);
CREATE INDEX IF NOT EXISTS idx_memories_uid ON memories(uid);
CREATE INDEX IF NOT EXISTS idx_memories_anon_uid ON memories(anon_uid);
CREATE INDEX IF NOT EXISTS idx_conversations_uid ON conversations(uid);
CREATE INDEX IF NOT EXISTS idx_conversations_anon_uid ON conversations(anon_uid);

-- RLS policies (initially disabled, can be enabled later)
ALTER TABLE personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view own personality profile" ON personality_profiles
  FOR SELECT USING (auth.uid() = uid);

CREATE POLICY "Users can update own personality profile" ON personality_profiles
  FOR UPDATE USING (auth.uid() = uid);

CREATE POLICY "Users can insert own personality profile" ON personality_profiles
  FOR INSERT WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can view own memories" ON memories
  FOR SELECT USING (auth.uid() = uid);

CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = uid);