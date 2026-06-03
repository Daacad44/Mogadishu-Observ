-- ══════════════════════════════════════════════════════════════════════════════
-- Mogadishu Urban Growth Observatory — COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This is idempotent: safe to re-run if something failed previously
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- PostGIS is optional; comment out if not available on your plan
-- CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Custom Types (safe: skips if already exists) ─────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin', 'analyst', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE prediction_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ensure super_admin value exists (for existing databases without it)
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── Tables ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  name_so TEXT,
  code TEXT UNIQUE,
  area_km2 DECIMAL(10, 4),
  population INTEGER,
  geometry JSONB,
  centroid JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS urban_growth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 2014 AND year <= 2030),
  built_up_area_km2 DECIMAL(12, 4) NOT NULL,
  growth_rate DECIMAL(8, 4),
  change_from_previous DECIMAL(12, 4),
  geometry JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, year)
);

CREATE TABLE IF NOT EXISTS building_density (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 2014 AND year <= 2030),
  buildings_count INTEGER NOT NULL DEFAULT 0,
  density_per_km2 DECIMAL(12, 4) NOT NULL,
  avg_building_size_m2 DECIMAL(10, 2),
  geometry JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, year)
);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  target_year INTEGER NOT NULL,
  predicted_area_km2 DECIMAL(12, 4),
  predicted_density DECIMAL(12, 4),
  confidence_score DECIMAL(5, 4),
  model_type TEXT DEFAULT 'random_forest',
  hotspot_geometry JSONB,
  status prediction_status DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  year_range TEXT,
  file_url TEXT,
  file_size INTEGER,
  status report_status DEFAULT 'draft',
  generated_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gis_layers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  layer_type TEXT NOT NULL CHECK (layer_type IN ('vector', 'raster', 'heatmap', 'satellite')),
  year INTEGER,
  geojson JSONB,
  file_url TEXT,
  style JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_urban_growth_year       ON urban_growth(year);
CREATE INDEX IF NOT EXISTS idx_urban_growth_district   ON urban_growth(district_id);
CREATE INDEX IF NOT EXISTS idx_building_density_year   ON building_density(year);
CREATE INDEX IF NOT EXISTS idx_building_density_district ON building_density(district_id);
CREATE INDEX IF NOT EXISTS idx_predictions_target_year ON predictions(target_year);
CREATE INDEX IF NOT EXISTS idx_gis_layers_year         ON gis_layers(year);
CREATE INDEX IF NOT EXISTS idx_gis_layers_slug         ON gis_layers(slug);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_event    ON analytics_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_created  ON analytics_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE urban_growth      ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_density  ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports           ENABLE ROW LEVEL SECURITY;
ALTER TABLE gis_layers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies (drop first so re-runs don't fail) ─────────────────────────
-- Profiles
DROP POLICY IF EXISTS "Users read own profile"            ON profiles;
DROP POLICY IF EXISTS "Users update own profile"          ON profiles;
DROP POLICY IF EXISTS "Admin full access profiles"        ON profiles;
DROP POLICY IF EXISTS "Super admin full access profiles"  ON profiles;
DROP POLICY IF EXISTS "Users update own profile fields"   ON profiles;

CREATE POLICY "Users read own profile"     ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile"   ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Public read tables
DROP POLICY IF EXISTS "Public read districts"          ON districts;
DROP POLICY IF EXISTS "Public read urban_growth"       ON urban_growth;
DROP POLICY IF EXISTS "Public read building_density"   ON building_density;
DROP POLICY IF EXISTS "Public read predictions"        ON predictions;
DROP POLICY IF EXISTS "Public read published reports"  ON reports;
DROP POLICY IF EXISTS "Public read public layers"      ON gis_layers;

CREATE POLICY "Public read districts"         ON districts       FOR SELECT USING (true);
CREATE POLICY "Public read urban_growth"      ON urban_growth    FOR SELECT USING (true);
CREATE POLICY "Public read building_density"  ON building_density FOR SELECT USING (true);
CREATE POLICY "Public read predictions"       ON predictions     FOR SELECT USING (status = 'completed');
CREATE POLICY "Public read published reports" ON reports         FOR SELECT USING (status = 'published');
CREATE POLICY "Public read public layers"     ON gis_layers      FOR SELECT USING (is_public = true);

-- Admin write access
DROP POLICY IF EXISTS "Admin full access districts"       ON districts;
DROP POLICY IF EXISTS "Admin full access urban_growth"    ON urban_growth;
DROP POLICY IF EXISTS "Admin full access building_density" ON building_density;
DROP POLICY IF EXISTS "Admin full access predictions"     ON predictions;
DROP POLICY IF EXISTS "Admin full access reports"         ON reports;
DROP POLICY IF EXISTS "Admin full access gis_layers"      ON gis_layers;
DROP POLICY IF EXISTS "Admin read analytics"              ON analytics_logs;
DROP POLICY IF EXISTS "Insert analytics"                  ON analytics_logs;

CREATE POLICY "Admin full access districts"        ON districts        FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst', 'super_admin')));
CREATE POLICY "Admin full access urban_growth"     ON urban_growth     FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst', 'super_admin')));
CREATE POLICY "Admin full access building_density" ON building_density FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst', 'super_admin')));
CREATE POLICY "Admin full access predictions"      ON predictions      FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst', 'super_admin')));
CREATE POLICY "Admin full access reports"          ON reports          FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst', 'super_admin')));
CREATE POLICY "Admin full access gis_layers"       ON gis_layers       FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst', 'super_admin')));
CREATE POLICY "Admin read analytics"               ON analytics_logs   FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Insert analytics"                   ON analytics_logs   FOR INSERT WITH CHECK (true);

-- Contact messages
DROP POLICY IF EXISTS "Public insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin read contact messages"    ON contact_messages;
DROP POLICY IF EXISTS "Admin update contact messages"  ON contact_messages;

CREATE POLICY "Public insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read contact messages"    ON contact_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admin update contact messages"  ON contact_messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- ─── Functions & Triggers ─────────────────────────────────────────────────────
-- Auto-create profile on signup, auto-promote observatory@mug.so
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

-- Drop trigger first (CREATE OR REPLACE doesn't work for triggers)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at    ON profiles;
DROP TRIGGER IF EXISTS districts_updated_at   ON districts;
DROP TRIGGER IF EXISTS predictions_updated_at ON predictions;
DROP TRIGGER IF EXISTS reports_updated_at     ON reports;
DROP TRIGGER IF EXISTS gis_layers_updated_at  ON gis_layers;

CREATE TRIGGER profiles_updated_at    BEFORE UPDATE ON profiles    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER districts_updated_at   BEFORE UPDATE ON districts   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER predictions_updated_at BEFORE UPDATE ON predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER reports_updated_at     BEFORE UPDATE ON reports     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER gis_layers_updated_at  BEFORE UPDATE ON gis_layers  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Seed: Districts ──────────────────────────────────────────────────────────
INSERT INTO districts (id, name, name_so, code, area_km2, population, centroid) VALUES
  ('11111111-1111-4111-8111-111111110001','Hodan',       'Hodan',       'HOD',12.5,185000,'{"type":"Point","coordinates":[45.32,2.04]}'),
  ('11111111-1111-4111-8111-111111110002','Wadajir',     'Wadajir',     'WAD',10.8,162000,'{"type":"Point","coordinates":[45.30,2.05]}'),
  ('11111111-1111-4111-8111-111111110003','Waberi',      'Waberi',      'WAB', 8.2, 98000,'{"type":"Point","coordinates":[45.34,2.03]}'),
  ('11111111-1111-4111-8111-111111110004','Hamar Weyne', 'Xamar Weyne', 'HWN', 4.5, 72000,'{"type":"Point","coordinates":[45.34,2.04]}'),
  ('11111111-1111-4111-8111-111111110005','Shangani',    'Shangaani',   'SHA', 3.8, 55000,'{"type":"Point","coordinates":[45.35,2.04]}'),
  ('11111111-1111-4111-8111-111111110006','Bondhere',    'Boondheere',  'BON', 6.1, 88000,'{"type":"Point","coordinates":[45.33,2.05]}'),
  ('11111111-1111-4111-8111-111111110007','Yaaqshiid',   'Yaaqshiid',   'YAA',14.2,210000,'{"type":"Point","coordinates":[45.28,2.06]}'),
  ('11111111-1111-4111-8111-111111110008','Daynile',     'Dayniile',    'DAY',18.5,245000,'{"type":"Point","coordinates":[45.25,2.08]}'),
  ('11111111-1111-4111-8111-111111110009','Karaan',      'Karaan',      'KAR',11.3,168000,'{"type":"Point","coordinates":[45.29,2.07]}'),
  ('11111111-1111-4111-8111-111111110010','Heliwa',      'Heliwa',      'HEL', 9.7,142000,'{"type":"Point","coordinates":[45.31,2.06]}')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, area_km2 = EXCLUDED.area_km2,
  population = EXCLUDED.population, centroid = EXCLUDED.centroid, updated_at = NOW();

-- ─── Seed: Urban Growth (2014–2026) ──────────────────────────────────────────
INSERT INTO urban_growth (district_id, year, built_up_area_km2, growth_rate, change_from_previous)
SELECT
  d.id, y.year,
  ROUND((d.area_km2 * (0.18 + (y.year - 2014) * 0.008))::numeric, 2),
  ROUND((2.0 + (y.year - 2014) * 0.15 + (ASCII(d.code) % 10) * 0.05)::numeric, 2),
  ROUND((d.area_km2 * 0.008)::numeric, 2)
FROM districts d
CROSS JOIN (SELECT generate_series(2014, 2026) AS year) y
ON CONFLICT (district_id, year) DO NOTHING;

-- ─── Seed: Building Density (2014–2026) ───────────────────────────────────────
INSERT INTO building_density (district_id, year, buildings_count, density_per_km2, avg_building_size_m2)
SELECT
  d.id, y.year,
  (d.population / 4 + (y.year - 2014) * 120)::integer,
  ROUND(((d.population / 4 + (y.year - 2014) * 120) / d.area_km2)::numeric, 2),
  ROUND((85 + (y.year - 2014) * 1.5)::numeric, 2)
FROM districts d
CROSS JOIN (SELECT generate_series(2014, 2026) AS year) y
ON CONFLICT (district_id, year) DO NOTHING;

-- ─── Seed: Predictions ───────────────────────────────────────────────────────
INSERT INTO predictions (district_id, target_year, predicted_area_km2, predicted_density, confidence_score, model_type, status)
SELECT
  d.id, y.year,
  ROUND((d.area_km2 * (0.35 + (y.year - 2025) * 0.04))::numeric, 2),
  ROUND(((d.population / 4) / d.area_km2 * 1.2)::numeric, 2),
  ROUND((0.82 + random() * 0.12)::numeric, 4),
  'random_forest',
  'completed'
FROM districts d
CROSS JOIN (SELECT generate_series(2025, 2030) AS year) y
ON CONFLICT DO NOTHING;

-- ─── Seed: Reports ────────────────────────────────────────────────────────────
INSERT INTO reports (title, description, year_range, file_size, status) VALUES
  ('Urban Growth Analysis 2014–2022', 'Comprehensive analysis of Mogadishu urban expansion', '2014-2022', 2400000, 'published'),
  ('Building Density Report 2022',    'Spatial distribution of building density across districts', '2022', 1800000, 'published'),
  ('Infrastructure Assessment 2023',  'Current infrastructure capacity and future needs', '2023', 3200000, 'published'),
  ('Population Migration Patterns',   'Study of internal migration and urban growth drivers', '2020-2023', 1500000, 'published'),
  ('Flood Risk Mapping 2023',         'Identifying flood-prone areas in the city', '2023', 2100000, 'published')
ON CONFLICT DO NOTHING;

-- ─── Seed: GIS Layers ────────────────────────────────────────────────────────
INSERT INTO gis_layers (name, slug, description, layer_type, year, is_visible, is_public, sort_order) VALUES
  ('District Boundaries 2023', 'districts-2023',    'Administrative district boundaries', 'vector',   2023, true,  true,  1),
  ('Built-up Areas 2022',      'built-up-2022',     'Urban built-up area footprints',     'vector',   2022, true,  true,  2),
  ('Urban Growth Heatmap',     'growth-heatmap',    'Urban expansion intensity heatmap',  'heatmap',  2022, true,  true,  3),
  ('Population Density 2022',  'population-2022',   'Population density grid layer',      'raster',   2022, false, true,  4),
  ('Land Use Classification',  'land-use-2022',     'Land use and land cover classes',    'vector',   2022, false, true,  5),
  ('Infrastructure Network',   'infrastructure',    'Roads, utilities, facilities',       'vector',   2023, false, true,  6)
ON CONFLICT (slug) DO NOTHING;

-- ─── Create Super Admin Account (observatory@mug.so / 12345678) ──────────────
DO $$
DECLARE
  new_uid   UUID := uuid_generate_v4();
  exist_id  UUID;
BEGIN
  SELECT id INTO exist_id FROM auth.users WHERE email = 'observatory@mug.so';

  IF exist_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, created_at, updated_at,
      confirmation_token, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_uid, 'authenticated', 'authenticated',
      'observatory@mug.so',
      crypt('12345678', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Observatory Admin"}',
      false, NOW(), NOW(), '', '', ''
    );

    -- Required: identity record so GoTrue can authenticate via email/password
    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      new_uid,
      new_uid,
      json_build_object('sub', new_uid::text, 'email', 'observatory@mug.so'),
      'email',
      NOW(), NOW(), NOW()
    ) ON CONFLICT (provider, id) DO NOTHING;

    INSERT INTO profiles (id, email, full_name, role)
    VALUES (new_uid, 'observatory@mug.so', 'Observatory Admin', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin', updated_at = NOW();

    RAISE NOTICE 'Created observatory@mug.so with super_admin role';
  ELSE
    UPDATE auth.users
    SET encrypted_password  = crypt('12345678', gen_salt('bf')),
        email_confirmed_at  = COALESCE(email_confirmed_at, NOW()),
        updated_at          = NOW()
    WHERE id = exist_id;

    -- Ensure identity record exists for the existing user
    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      exist_id,
      exist_id,
      json_build_object('sub', exist_id::text, 'email', 'observatory@mug.so'),
      'email',
      NOW(), NOW(), NOW()
    ) ON CONFLICT (provider, id) DO NOTHING;

    INSERT INTO profiles (id, email, full_name, role)
    VALUES (exist_id, 'observatory@mug.so', 'Observatory Admin', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin', updated_at = NOW();

    RAISE NOTICE 'Updated observatory@mug.so → super_admin (existing account)';
  END IF;
END $$;

-- ─── Verify ───────────────────────────────────────────────────────────────────
SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  p.role,
  p.full_name
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'observatory@mug.so';
