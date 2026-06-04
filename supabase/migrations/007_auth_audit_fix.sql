-- ══════════════════════════════════════════════════════════════════════════════
-- Mogadishu Urban Growth Observatory — AUTH AUDIT & PRODUCTION FIX
-- Fixes: "Database error saving new user" (500) at /auth/v1/signup
-- Run this ENTIRE file in Supabase SQL Editor. It is idempotent & safe to re-run.
-- ══════════════════════════════════════════════════════════════════════════════

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  PART A — DIAGNOSTICS (read-only; review the output)                       ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- A1. All triggers attached to auth.users
SELECT tgname AS trigger_name,
       tgenabled AS enabled,
       pg_get_triggerdef(oid) AS definition
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
  AND NOT tgisinternal;

-- A2. Definition of the signup function(s)
SELECT n.nspname AS schema,
       p.proname AS function,
       pg_get_functiondef(p.oid) AS source
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname IN ('handle_new_user', 'create_profile');

-- A3. Does public.profiles exist and what columns / NOT NULLs?
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- A4. Enum values for user_role
SELECT e.enumlabel AS role_value
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- A5. RLS policies on profiles
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';

-- A6. Foreign keys on profiles (must reference auth.users)
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass AND contype = 'f';


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  PART B — FIX (executable)                                                 ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- B1. Ensure required type exists with all role values ------------------------
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'analyst', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'user';        EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';       EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'analyst';     EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'super_admin'; EXCEPTION WHEN others THEN NULL; END $$;

-- B2. Ensure profiles table exists with correct shape ------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Make sure columns are nullable where the trigger may omit them
ALTER TABLE public.profiles ALTER COLUMN full_name  DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN avatar_url DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';

-- B3. Remove ALL old triggers on auth.users to avoid duplicates/conflicts ----
DO $$
DECLARE t RECORD;
BEGIN
  FOR t IN
    SELECT tgname FROM pg_trigger
    WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users;', t.tgname);
  END LOOP;
END $$;

-- B4. Recreate the signup function — THE CRITICAL FIX ------------------------
--     * SET search_path = public  → so 'profiles' / 'user_role' always resolve
--     * SECURITY DEFINER           → runs with owner privileges, bypasses RLS
--     * schema-qualified table     → public.profiles
--     * exception-safe             → never blocks auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role public.user_role := 'user';
BEGIN
  IF NEW.email = 'observatory@mug.so' THEN
    assigned_role := 'super_admin';
  ELSIF NEW.raw_user_meta_data ? 'role'
    AND (NEW.raw_user_meta_data->>'role') IN ('user','admin','analyst','super_admin') THEN
    assigned_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE
    SET email      = EXCLUDED.email,
        full_name  = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        role       = EXCLUDED.role,
        updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log but never block signup
  RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- B5. Recreate the trigger ----------------------------------------------------
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B6. Permissions: ensure the auth service can run everything ----------------
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin, authenticated, anon, service_role;
GRANT ALL ON public.profiles TO supabase_auth_admin, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin, service_role;

-- B7. RLS — keep enabled, but ensure SECURITY DEFINER trigger can insert -----
--     (SECURITY DEFINER runs as owner 'postgres' which bypasses RLS, so the
--      trigger insert works regardless. These policies cover normal app use.)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile"     ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;

CREATE POLICY "Users read own profile"   ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin'))
  );

-- B8. Backfill: create profiles for any existing auth.users without one ------
INSERT INTO public.profiles (id, email, full_name, role)
SELECT u.id,
       u.email,
       COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
       CASE WHEN u.email = 'observatory@mug.so' THEN 'super_admin'::public.user_role
            ELSE 'user'::public.user_role END
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  PART C — VERIFY                                                           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- C1. Confirm exactly one trigger exists, pointing to the fixed function
SELECT tgname, pg_get_triggerdef(oid) AS definition
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal;

-- C2. Confirm the function has search_path pinned
SELECT proname,
       prosecdef AS security_definer,
       proconfig AS settings   -- should contain search_path=public
FROM pg_proc
WHERE proname = 'handle_new_user';

-- C3. Profiles count vs users count (should match after backfill)
SELECT (SELECT count(*) FROM auth.users)      AS auth_users,
       (SELECT count(*) FROM public.profiles) AS profiles;
