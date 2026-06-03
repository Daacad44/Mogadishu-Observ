-- Mogadishu Urban Growth Observatory — Create Super Admin Account
-- Creates observatory@mug.so with password 12345678 and super_admin role
-- Run in Supabase SQL Editor

-- Requires pgcrypto (enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Create the auth user (skips if already exists) ──────────────────────────
DO $$
DECLARE
  new_uid UUID := uuid_generate_v4();
  existing_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_id FROM auth.users WHERE email = 'observatory@mug.so';

  IF existing_id IS NULL THEN
    -- Create the auth user with a bcrypt-hashed password
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_uid,
      'authenticated',
      'authenticated',
      'observatory@mug.so',
      crypt('12345678', gen_salt('bf')),
      NOW(),  -- email pre-confirmed
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Observatory Admin"}',
      false,
      NOW(),
      NOW(),
      '',
      '',
      ''
    );

    -- Create the profile for the new auth user
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (new_uid, 'observatory@mug.so', 'Observatory Admin', 'super_admin')
    ON CONFLICT (id) DO UPDATE
      SET role = 'super_admin',
          full_name = 'Observatory Admin',
          updated_at = NOW();

    RAISE NOTICE 'Created observatory@mug.so (id: %)', new_uid;
  ELSE
    -- User already exists — just ensure profile has super_admin role
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (existing_id, 'observatory@mug.so', 'Observatory Admin', 'super_admin')
    ON CONFLICT (id) DO UPDATE
      SET role = 'super_admin',
          full_name = COALESCE(profiles.full_name, 'Observatory Admin'),
          updated_at = NOW();

    -- Also update the password to match what the user specified
    UPDATE auth.users
    SET encrypted_password = crypt('12345678', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE id = existing_id;

    RAISE NOTICE 'Updated existing observatory@mug.so (id: %)', existing_id;
  END IF;
END $$;

-- ─── Patch trigger to auto-promote this email on any future re-register ───────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role;
BEGIN
  IF NEW.email = 'observatory@mug.so' THEN
    assigned_role := 'super_admin';
  ELSE
    assigned_role := COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'user'
    );
  END IF;

  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role, updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Verify ───────────────────────────────────────────────────────────────────
-- Run after this migration to confirm:
-- SELECT id, email, role FROM profiles WHERE email = 'observatory@mug.so';
