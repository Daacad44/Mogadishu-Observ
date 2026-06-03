-- Add super_admin role and promote observatory@mug.so

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Promote observatory@mug.so to super_admin (run after user registers)
UPDATE profiles
SET role = 'super_admin', updated_at = NOW()
WHERE email = 'observatory@mug.so';

-- Super admin policies: full access including user role management
CREATE POLICY "Super admin full access profiles" ON profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- Allow users to update their own profile (name, avatar — not role)
CREATE POLICY "Users update own profile fields" ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );
