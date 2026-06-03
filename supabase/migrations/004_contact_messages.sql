-- Mogadishu Urban Growth Observatory — Contact Messages
-- Run after 003_seed_data.sql

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can submit a message
DROP POLICY IF EXISTS "Public insert contact messages" ON contact_messages;
CREATE POLICY "Public insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Only admins / super admins can read submissions
DROP POLICY IF EXISTS "Admin read contact messages" ON contact_messages;
CREATE POLICY "Admin read contact messages" ON contact_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Only admins / super admins can update status
DROP POLICY IF EXISTS "Admin update contact messages" ON contact_messages;
CREATE POLICY "Admin update contact messages" ON contact_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
