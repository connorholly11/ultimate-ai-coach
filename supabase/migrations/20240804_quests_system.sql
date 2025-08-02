-- Quest templates table (predefined quests)
CREATE TABLE IF NOT EXISTS quest_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('productivity', 'health', 'career', 'personal', 'habits')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration_days INTEGER NOT NULL DEFAULT 7,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  rewards JSONB DEFAULT '{"points": 100}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User quests (active quests for users)
CREATE TABLE IF NOT EXISTS user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anon_uid TEXT,
  quest_template_id UUID REFERENCES quest_templates(id),
  custom_quest JSONB, -- For user-created quests
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  progress JSONB DEFAULT '{}'::jsonb, -- Track task completion
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure user has either quest_template_id or custom_quest
  CONSTRAINT quest_source CHECK (
    (quest_template_id IS NOT NULL AND custom_quest IS NULL) OR
    (quest_template_id IS NULL AND custom_quest IS NOT NULL)
  )
);

-- Quest achievements (for tracking completed quests)
CREATE TABLE IF NOT EXISTS quest_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anon_uid TEXT,
  quest_id UUID REFERENCES user_quests(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  time_taken_days INTEGER,
  points_earned INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_user_quests_uid ON user_quests(uid);
CREATE INDEX idx_user_quests_anon_uid ON user_quests(anon_uid);
CREATE INDEX idx_user_quests_status ON user_quests(status);
CREATE INDEX idx_quest_achievements_uid ON quest_achievements(uid);
CREATE INDEX idx_quest_achievements_anon_uid ON quest_achievements(anon_uid);

-- Insert some default quest templates
INSERT INTO quest_templates (title, description, category, difficulty, duration_days, tasks) VALUES
  ('Morning Routine Master', 'Build a consistent morning routine for 7 days', 'habits', 'easy', 7, 
   '[{"id": 1, "title": "Wake up at consistent time", "required": true}, 
     {"id": 2, "title": "Do 10 minutes of exercise", "required": true},
     {"id": 3, "title": "Practice gratitude journaling", "required": false}]'::jsonb),
     
  ('Focus Sprint', 'Complete 5 deep work sessions without distractions', 'productivity', 'medium', 5,
   '[{"id": 1, "title": "Complete a 90-minute focus session", "required": true, "repeat": 5}]'::jsonb),
   
  ('Career Advancement', 'Take concrete steps toward your career goals', 'career', 'hard', 14,
   '[{"id": 1, "title": "Update resume and LinkedIn", "required": true},
     {"id": 2, "title": "Network with 3 professionals", "required": true},
     {"id": 3, "title": "Apply to 5 positions", "required": true},
     {"id": 4, "title": "Complete one skill course", "required": false}]'::jsonb);

-- RLS policies
ALTER TABLE quest_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_achievements ENABLE ROW LEVEL SECURITY;

-- Quest templates are readable by all
CREATE POLICY "Quest templates are viewable by all" ON quest_templates
  FOR SELECT TO anon, authenticated
  USING (true);

-- Users can manage their own quests
CREATE POLICY "Users can view own quests" ON user_quests
  FOR SELECT TO authenticated
  USING (auth.uid() = uid);

CREATE POLICY "Users can create own quests" ON user_quests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can update own quests" ON user_quests
  FOR UPDATE TO authenticated
  USING (auth.uid() = uid);

-- Service role can do anything (for anonymous users)
CREATE POLICY "Service role full access to user_quests" ON user_quests
  FOR ALL TO service_role
  USING (true);

-- Similar policies for achievements
CREATE POLICY "Users can view own achievements" ON quest_achievements
  FOR SELECT TO authenticated
  USING (auth.uid() = uid);

CREATE POLICY "Service role full access to achievements" ON quest_achievements
  FOR ALL TO service_role
  USING (true);