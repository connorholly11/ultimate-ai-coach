-- Add more quest templates
INSERT INTO quest_templates (title, description, category, difficulty, duration_days, tasks, rewards) VALUES
  -- Productivity Quests
  ('Inbox Zero Hero', 'Achieve and maintain inbox zero for a week', 'productivity', 'medium', 7,
   '[{"id": 1, "title": "Clear all emails to zero", "required": true},
     {"id": 2, "title": "Maintain inbox zero daily", "required": true, "repeat": 7},
     {"id": 3, "title": "Set up email filters", "required": false}]'::jsonb,
   '{"points": 150}'::jsonb),
   
  ('Digital Detox', 'Reduce screen time and build mindful tech habits', 'productivity', 'hard', 7,
   '[{"id": 1, "title": "Track daily screen time", "required": true, "repeat": 7},
     {"id": 2, "title": "Implement 1-hour phone-free period", "required": true, "repeat": 7},
     {"id": 3, "title": "Turn off non-essential notifications", "required": true},
     {"id": 4, "title": "Practice mindful phone usage", "required": false}]'::jsonb,
   '{"points": 200}'::jsonb),

  -- Health Quests  
  ('Hydration Champion', 'Drink 8 glasses of water daily for a week', 'health', 'easy', 7,
   '[{"id": 1, "title": "Drink 8 glasses of water", "required": true, "repeat": 7},
     {"id": 2, "title": "Track water intake", "required": true, "repeat": 7}]'::jsonb,
   '{"points": 100}'::jsonb),
   
  ('Sleep Optimizer', 'Establish a consistent sleep schedule', 'health', 'medium', 10,
   '[{"id": 1, "title": "Go to bed at same time", "required": true, "repeat": 10},
     {"id": 2, "title": "Wake up at same time", "required": true, "repeat": 10},
     {"id": 3, "title": "No screens 30min before bed", "required": false, "repeat": 10},
     {"id": 4, "title": "Track sleep quality", "required": true, "repeat": 10}]'::jsonb,
   '{"points": 175}'::jsonb),
   
  ('Mindfulness Journey', 'Build a daily meditation practice', 'health', 'medium', 14,
   '[{"id": 1, "title": "Meditate for 5 minutes", "required": true, "repeat": 7},
     {"id": 2, "title": "Meditate for 10 minutes", "required": true, "repeat": 7},
     {"id": 3, "title": "Try different meditation styles", "required": false},
     {"id": 4, "title": "Journal about experience", "required": false, "repeat": 3}]'::jsonb,
   '{"points": 200}'::jsonb),

  -- Career Quests
  ('Skill Builder', 'Learn a new professional skill', 'career', 'hard', 21,
   '[{"id": 1, "title": "Choose skill to learn", "required": true},
     {"id": 2, "title": "Complete learning sessions", "required": true, "repeat": 15},
     {"id": 3, "title": "Apply skill in practice project", "required": true},
     {"id": 4, "title": "Share learning with others", "required": false}]'::jsonb,
   '{"points": 300}'::jsonb),
   
  ('Network Expander', 'Grow your professional network', 'career', 'medium', 14,
   '[{"id": 1, "title": "Connect with 2 new professionals", "required": true, "repeat": 5},
     {"id": 2, "title": "Attend networking event", "required": true},
     {"id": 3, "title": "Schedule coffee chats", "required": true, "repeat": 3},
     {"id": 4, "title": "Follow up with connections", "required": true}]'::jsonb,
   '{"points": 200}'::jsonb),

  -- Personal Growth Quests
  ('Gratitude Practice', 'Cultivate daily gratitude', 'personal', 'easy', 7,
   '[{"id": 1, "title": "Write 3 things you are grateful for", "required": true, "repeat": 7},
     {"id": 2, "title": "Express gratitude to someone", "required": false, "repeat": 3}]'::jsonb,
   '{"points": 100}'::jsonb),
   
  ('Creative Explorer', 'Unleash your creative side', 'personal', 'medium', 14,
   '[{"id": 1, "title": "Try a new creative activity", "required": true, "repeat": 3},
     {"id": 2, "title": "Dedicate 30min to creativity daily", "required": true, "repeat": 10},
     {"id": 3, "title": "Share creation with someone", "required": false},
     {"id": 4, "title": "Join creative community", "required": false}]'::jsonb,
   '{"points": 175}'::jsonb),

  -- Habit Quests
  ('Reading Ritual', 'Build a consistent reading habit', 'habits', 'easy', 14,
   '[{"id": 1, "title": "Read for 15 minutes", "required": true, "repeat": 14},
     {"id": 2, "title": "Finish one book", "required": true},
     {"id": 3, "title": "Take notes on key insights", "required": false}]'::jsonb,
   '{"points": 150}'::jsonb),
   
  ('Exercise Starter', 'Begin a regular exercise routine', 'habits', 'medium', 14,
   '[{"id": 1, "title": "Exercise for 20 minutes", "required": true, "repeat": 10},
     {"id": 2, "title": "Try 3 different types of exercise", "required": true},
     {"id": 3, "title": "Track progress", "required": false, "repeat": 10}]'::jsonb,
   '{"points": 175}'::jsonb),
   
  ('Journal Journey', 'Develop a journaling practice', 'habits', 'easy', 10,
   '[{"id": 1, "title": "Write journal entry", "required": true, "repeat": 10},
     {"id": 2, "title": "Reflect on weekly progress", "required": true, "repeat": 2},
     {"id": 3, "title": "Try different journaling prompts", "required": false}]'::jsonb,
   '{"points": 125}'::jsonb);