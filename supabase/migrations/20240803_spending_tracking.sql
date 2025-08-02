-- Spending tracking table for monitoring API usage costs
CREATE TABLE IF NOT EXISTS spending_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anon_uid TEXT,
  message_count INTEGER NOT NULL DEFAULT 1,
  estimated_cost DECIMAL(10, 4) NOT NULL,
  model TEXT NOT NULL DEFAULT 'claude-3-5-sonnet',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for efficient date-based queries
CREATE INDEX idx_spending_logs_created_at ON spending_logs(created_at);
CREATE INDEX idx_spending_logs_uid ON spending_logs(uid);
CREATE INDEX idx_spending_logs_anon_uid ON spending_logs(anon_uid);

-- Function to track spending after each assistant message
CREATE OR REPLACE FUNCTION track_spending()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track assistant messages (these cost money)
  IF NEW.role = 'assistant' THEN
    INSERT INTO spending_logs (
      uid,
      anon_uid,
      message_count,
      estimated_cost,
      model,
      metadata
    ) VALUES (
      NEW.uid,
      NEW.anon_uid,
      1,
      0.003, -- $0.003 per message (adjust based on actual model pricing)
      'claude-3-5-sonnet',
      jsonb_build_object(
        'message_id', NEW.id,
        'episode_id', NEW.episode_id,
        'char_count', NEW.char_count
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically track spending
CREATE TRIGGER track_message_spending
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION track_spending();

-- View for daily spending summary
CREATE OR REPLACE VIEW daily_spending AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as message_count,
  SUM(estimated_cost) as total_cost,
  COUNT(DISTINCT COALESCE(uid::text, anon_uid)) as unique_users
FROM spending_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View for monthly spending summary
CREATE OR REPLACE VIEW monthly_spending AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as message_count,
  SUM(estimated_cost) as total_cost,
  COUNT(DISTINCT COALESCE(uid::text, anon_uid)) as unique_users
FROM spending_logs
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Function to get current month spending (for API to check limits)
CREATE OR REPLACE FUNCTION get_current_month_spending()
RETURNS TABLE(
  message_count BIGINT,
  total_cost DECIMAL,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as message_count,
    SUM(estimated_cost) as total_cost,
    COUNT(DISTINCT COALESCE(uid::text, anon_uid)) as unique_users
  FROM spending_logs
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Function to get current day spending
CREATE OR REPLACE FUNCTION get_current_day_spending()
RETURNS TABLE(
  message_count BIGINT,
  total_cost DECIMAL,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as message_count,
    SUM(estimated_cost) as total_cost,
    COUNT(DISTINCT COALESCE(uid::text, anon_uid)) as unique_users
  FROM spending_logs
  WHERE created_at >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE spending_logs ENABLE ROW LEVEL SECURITY;

-- Admin can see all spending logs (replace with your admin email)
CREATE POLICY "Admin can view all spending logs" ON spending_logs
  FOR ALL TO authenticated
  USING (auth.email() = 'your-admin-email@example.com');

-- Service role can insert spending logs
CREATE POLICY "Service role can insert spending logs" ON spending_logs
  FOR INSERT TO service_role
  WITH CHECK (true);