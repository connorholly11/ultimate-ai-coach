-- Seed assessment quest templates

-- Big Five Personality Assessment
INSERT INTO quest_templates (id, title, description, category, difficulty, duration_days, tasks, rewards, order_index, is_assessment)
VALUES (
  'big-five',
  'Discover your Big Five',
  'Understand your personality traits through the scientifically-validated Big Five model',
  'personal',
  'easy',
  1,
  '[
    {"id": 1, "title": "I feel comfortable being the center of attention", "trait": "extraversion", "reversed": false, "required": true},
    {"id": 2, "title": "I prefer to stay in the background", "trait": "extraversion", "reversed": true, "required": true},
    {"id": 3, "title": "I start conversations easily", "trait": "extraversion", "reversed": false, "required": true},
    {"id": 4, "title": "I find it difficult to approach others", "trait": "extraversion", "reversed": true, "required": true},
    {"id": 5, "title": "I sympathize with others'' feelings", "trait": "agreeableness", "reversed": false, "required": true},
    {"id": 6, "title": "I am not interested in other people''s problems", "trait": "agreeableness", "reversed": true, "required": true},
    {"id": 7, "title": "I trust others easily", "trait": "agreeableness", "reversed": false, "required": true},
    {"id": 8, "title": "I suspect hidden motives in others", "trait": "agreeableness", "reversed": true, "required": true},
    {"id": 9, "title": "I am always prepared", "trait": "conscientiousness", "reversed": false, "required": true},
    {"id": 10, "title": "I often forget to put things back in their proper place", "trait": "conscientiousness", "reversed": true, "required": true},
    {"id": 11, "title": "I follow through on my commitments", "trait": "conscientiousness", "reversed": false, "required": true},
    {"id": 12, "title": "I have difficulty sticking to a schedule", "trait": "conscientiousness", "reversed": true, "required": true},
    {"id": 13, "title": "I get stressed out easily", "trait": "neuroticism", "reversed": false, "required": true},
    {"id": 14, "title": "I rarely feel anxious or worried", "trait": "neuroticism", "reversed": true, "required": true},
    {"id": 15, "title": "My mood changes frequently", "trait": "neuroticism", "reversed": false, "required": true},
    {"id": 16, "title": "I am emotionally stable", "trait": "neuroticism", "reversed": true, "required": true},
    {"id": 17, "title": "I have a vivid imagination", "trait": "openness", "reversed": false, "required": true},
    {"id": 18, "title": "I have difficulty understanding abstract ideas", "trait": "openness", "reversed": true, "required": true},
    {"id": 19, "title": "I enjoy trying new things", "trait": "openness", "reversed": false, "required": true},
    {"id": 20, "title": "I prefer routine over variety", "trait": "openness", "reversed": true, "required": true}
  ]'::jsonb,
  '{"points": 200}'::jsonb,
  10,
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  order_index = EXCLUDED.order_index,
  is_assessment = EXCLUDED.is_assessment;

-- Core Values Assessment
INSERT INTO quest_templates (id, title, description, category, difficulty, duration_days, tasks, rewards, order_index, is_assessment)
VALUES (
  'values',
  'Clarify Core Values',
  'Identify and rank your most important values to guide your decisions',
  'personal',
  'easy',
  1,
  '[
    {"id": 1, "title": "Rank your core values", "type": "ranking", "required": true}
  ]'::jsonb,
  '{"points": 150}'::jsonb,
  20,
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  order_index = EXCLUDED.order_index,
  is_assessment = EXCLUDED.is_assessment;

-- Attachment Style Assessment
INSERT INTO quest_templates (id, title, description, category, difficulty, duration_days, tasks, rewards, order_index, is_assessment)
VALUES (
  'attachment',
  'Understand Attachment Style',
  'Explore your relationship patterns and emotional attachment style',
  'personal',
  'easy',
  1,
  '[
    {"id": 1, "title": "In close relationships, I often worry that others don''t care as much about me as I care about them", "dimension": "anxiety", "required": true},
    {"id": 2, "title": "I find it easy to depend on others and have others depend on me", "dimension": "avoidance", "reversed": true, "required": true},
    {"id": 3, "title": "I worry about being alone", "dimension": "anxiety", "required": true},
    {"id": 4, "title": "I prefer not to show others how I feel deep down", "dimension": "avoidance", "required": true},
    {"id": 5, "title": "I often wish that other people''s feelings for me were as strong as my feelings for them", "dimension": "anxiety", "required": true},
    {"id": 6, "title": "I am comfortable sharing my private thoughts and feelings with others", "dimension": "avoidance", "reversed": true, "required": true},
    {"id": 7, "title": "I rarely worry about being abandoned", "dimension": "anxiety", "reversed": true, "required": true},
    {"id": 8, "title": "I find it difficult to trust others completely", "dimension": "avoidance", "required": true}
  ]'::jsonb,
  '{"points": 150}'::jsonb,
  30,
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  order_index = EXCLUDED.order_index,
  is_assessment = EXCLUDED.is_assessment;

-- Update existing quest templates to have proper order_index
UPDATE quest_templates 
SET order_index = 100 
WHERE is_assessment = FALSE AND order_index = 999;