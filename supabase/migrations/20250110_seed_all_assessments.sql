-- Comprehensive seed data for all assessment quests

-- First ensure we have the assessment category
INSERT INTO quest_templates (title, description, category, difficulty, duration_days, tasks, rewards, order_index, is_assessment)
VALUES 
  -- Big Five Assessment
  (
    'Discover Your Big Five',
    '30 quick reflections to map your core personality traits',
    'personal',
    'easy',
    1,
    '[
      {"id": 1,  "title": "Generates a lot of enthusiasm", "required": true},
      {"id": 2,  "title": "Rarely feels excited", "required": true},
      {"id": 3,  "title": "Is talkative", "required": true},
      {"id": 4,  "title": "Prefers to be alone", "required": true},
      {"id": 5,  "title": "Has an assertive personality", "required": true},
      {"id": 6,  "title": "Finds it hard to influence people", "required": true},
      {"id": 7,  "title": "Values artistic experiences", "required": true},
      {"id": 8,  "title": "Sees little importance in art", "required": true},
      {"id": 9,  "title": "Is curious about many different things", "required": true},
      {"id": 10, "title": "Avoids difficult reading material", "required": true},
      {"id": 11, "title": "Has a rich vocabulary", "required": true},
      {"id": 12, "title": "Has difficulty imagining things", "required": true},
      {"id": 13, "title": "Tends to find fault with others", "required": true},
      {"id": 14, "title": "Feels little sympathy for others", "required": true},
      {"id": 15, "title": "Is helpful and unselfish with others", "required": true},
      {"id": 16, "title": "Starts arguments", "required": true},
      {"id": 17, "title": "Is respectful toward others", "required": true},
      {"id": 18, "title": "Is sometimes rude", "required": true},
      {"id": 19, "title": "Can be relied upon", "required": true},
      {"id": 20, "title": "Leaves a mess in room", "required": true},
      {"id": 21, "title": "Does things efficiently", "required": true},
      {"id": 22, "title": "Shirk duties", "required": true},
      {"id": 23, "title": "Is persistent", "required": true},
      {"id": 24, "title": "Gives up easily", "required": true},
      {"id": 25, "title": "Is depressed, blue", "required": true},
      {"id": 26, "title": "Stays optimistic after setbacks", "required": true},
      {"id": 27, "title": "Worries a lot", "required": true},
      {"id": 28, "title": "Feels relaxed most of the time", "required": true},
      {"id": 29, "title": "Gets stressed easily", "required": true},
      {"id": 30, "title": "Handles stress well", "required": true}
    ]'::jsonb,
    '{"points": 100}'::jsonb,
    10,
    TRUE
  ),
  
  -- Values Assessment (PVQ-21)
  (
    'Clarify Your Core Values',
    'Identify what matters most to you in life',
    'personal',
    'easy',
    1,
    '[
      {"id": 1,  "title": "I think up new ideas and be creative", "required": true},
      {"id": 2,  "title": "I seek adventures and have an exciting life", "required": true},
      {"id": 3,  "title": "I enjoy life''s pleasures", "required": true},
      {"id": 4,  "title": "I show my abilities and be admired", "required": true},
      {"id": 5,  "title": "I am influential, have authority", "required": true},
      {"id": 6,  "title": "the country is safe from threats", "required": true},
      {"id": 7,  "title": "I behave properly", "required": true},
      {"id": 8,  "title": "I follow family''s customs", "required": true},
      {"id": 9,  "title": "I help people close to me", "required": true},
      {"id": 10, "title": "I protect nature", "required": true},
      {"id": 11, "title": "I make my own decisions", "required": true},
      {"id": 12, "title": "I lead an exciting life", "required": true},
      {"id": 13, "title": "I indulge myself", "required": true},
      {"id": 14, "title": "I succeed in what I do", "required": true},
      {"id": 15, "title": "I am wealthy", "required": true},
      {"id": 16, "title": "I have a stable lifestyle", "required": true},
      {"id": 17, "title": "I live obediently", "required": true},
      {"id": 18, "title": "I maintain traditions", "required": true},
      {"id": 19, "title": "I am loyal to friends", "required": true},
      {"id": 20, "title": "I listen to people who are different", "required": true},
      {"id": 21, "title": "I treat everyone equally", "required": true}
    ]'::jsonb,
    '{"points": 100}'::jsonb,
    20,
    TRUE
  ),
  
  -- Attachment Style Assessment (ECR-S)
  (
    'Understand Your Attachment Style',
    'Explore your relationship patterns and emotional attachment style',
    'personal',
    'easy',
    1,
    '[
      {"id": 1,  "title": "I worry a lot about my relationships", "required": true},
      {"id": 2,  "title": "I prefer not to show others how I feel", "required": true},
      {"id": 3,  "title": "I''m afraid that I will lose my partner", "required": true},
      {"id": 4,  "title": "I find it difficult to allow myself to depend on others", "required": true},
      {"id": 5,  "title": "I worry my partner won''t care about me as much as I care", "required": true},
      {"id": 6,  "title": "I am comfortable depending on others", "required": true},
      {"id": 7,  "title": "I often worry my partner doesn''t really love me", "required": true},
      {"id": 8,  "title": "I prefer not to depend on others", "required": true},
      {"id": 9,  "title": "I sometimes worry that I''m not good enough", "required": true},
      {"id": 10, "title": "I find it easy to be close", "required": true},
      {"id": 11, "title": "I worry about being abandoned", "required": true},
      {"id": 12, "title": "I usually discuss my problems with others", "required": true}
    ]'::jsonb,
    '{"points": 100}'::jsonb,
    30,
    TRUE
  ),
  
  -- Regulatory Focus Assessment (GRFM)
  (
    'Discover Your Motivation Lens',
    'Understand whether you''re driven by growth or security',
    'personal',
    'easy',
    1,
    '[
      {"id": 1,  "title": "I frequently imagine how I will achieve my hopes", "required": true},
      {"id": 2,  "title": "I often think about how I will achieve success", "required": true},
      {"id": 3,  "title": "I see myself pursuing my ideal self", "required": true},
      {"id": 4,  "title": "I focus on positive events that I want to happen", "required": true},
      {"id": 5,  "title": "I am eager to get rewards when they are offered", "required": true},
      {"id": 6,  "title": "I usually focus on the good things I can do", "required": true},
      {"id": 7,  "title": "I often think about what I can gain", "required": true},
      {"id": 8,  "title": "I work hard to achieve outstanding outcomes", "required": true},
      {"id": 9,  "title": "I am motivated by opportunities to grow", "required": true},
      {"id": 10, "title": "When I see possible loss, I focus on preventing it", "required": true},
      {"id": 11, "title": "I concentrate on avoiding failures", "required": true},
      {"id": 12, "title": "I worry about making mistakes", "required": true},
      {"id": 13, "title": "I am careful to avoid losses", "required": true},
      {"id": 14, "title": "Criticism motivates me to avoid errors", "required": true},
      {"id": 15, "title": "I consider negative outcomes before acting", "required": true},
      {"id": 16, "title": "I prepare backup plans to prevent failure", "required": true},
      {"id": 17, "title": "I am driven to fulfill duties and obligations", "required": true},
      {"id": 18, "title": "I am alert to potential threats", "required": true}
    ]'::jsonb,
    '{"points": 100}'::jsonb,
    40,
    TRUE
  ),
  
  -- Self-Efficacy Assessment (GSE-10)
  (
    'Gauge Your Inner Confidence',
    'Assess your belief in your ability to handle challenges',
    'personal',
    'easy',
    1,
    '[
      {"id": 1,  "title": "I can always manage to solve difficult problems", "required": true},
      {"id": 2,  "title": "If someone opposes me, I can find the means to get what I want", "required": true},
      {"id": 3,  "title": "It is easy for me to stick to my aims", "required": true},
      {"id": 4,  "title": "I am confident I could deal efficiently with unexpected events", "required": true},
      {"id": 5,  "title": "Thanks to my resourcefulness, I can handle unforeseen situations", "required": true},
      {"id": 6,  "title": "I can solve most problems if I invest the necessary effort", "required": true},
      {"id": 7,  "title": "I can remain calm when facing difficulties, because I can rely on my coping abilities", "required": true},
      {"id": 8,  "title": "When I am confronted with a problem, I can usually find several solutions", "required": true},
      {"id": 9,  "title": "If I am in trouble, I can usually think of a solution", "required": true},
      {"id": 10, "title": "I can handle whatever comes my way", "required": true}
    ]'::jsonb,
    '{"points": 100}'::jsonb,
    50,
    TRUE
  )
ON CONFLICT (title) DO UPDATE SET
  description = EXCLUDED.description,
  tasks = EXCLUDED.tasks,
  order_index = EXCLUDED.order_index,
  is_assessment = EXCLUDED.is_assessment;

-- Update personality_profiles table to support all assessment data
ALTER TABLE personality_profiles 
ADD COLUMN IF NOT EXISTS values_dimensions JSONB,
ADD COLUMN IF NOT EXISTS values_meta JSONB,
ADD COLUMN IF NOT EXISTS attachment_dimensions JSONB,
ADD COLUMN IF NOT EXISTS regulatory_focus JSONB,
ADD COLUMN IF NOT EXISTS self_efficacy JSONB;