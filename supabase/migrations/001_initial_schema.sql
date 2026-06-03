-- Mogadishu Urban Growth Observatory - Initial Schema
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'analyst', 'super_admin');
CREATE TYPE report_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE prediction_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Districts
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

-- Urban growth records
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

-- Building density
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

-- Predictions
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

-- Reports
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

-- GIS Layers
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

-- Analytics logs
CREATE TABLE IF NOT EXISTS analytics_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_urban_growth_year ON urban_growth(year);
CREATE INDEX idx_urban_growth_district ON urban_growth(district_id);
CREATE INDEX idx_building_density_year ON building_density(year);
CREATE INDEX idx_building_density_district ON building_density(district_id);
CREATE INDEX idx_predictions_target_year ON predictions(target_year);
CREATE INDEX idx_gis_layers_year ON gis_layers(year);
CREATE INDEX idx_gis_layers_slug ON gis_layers(slug);
CREATE INDEX idx_analytics_logs_event ON analytics_logs(event_type);
CREATE INDEX idx_analytics_logs_created ON analytics_logs(created_at DESC);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE urban_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_density ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE gis_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Public read urban_growth" ON urban_growth FOR SELECT USING (true);
CREATE POLICY "Public read building_density" ON building_density FOR SELECT USING (true);
CREATE POLICY "Public read predictions" ON predictions FOR SELECT USING (status = 'completed');
CREATE POLICY "Public read published reports" ON reports FOR SELECT USING (status = 'published');
CREATE POLICY "Public read public layers" ON gis_layers FOR SELECT USING (is_public = true);

-- Profile policies
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admin policies (full access for admins)
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst', 'super_admin')));

CREATE POLICY "Admin full access districts" ON districts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst')));

CREATE POLICY "Admin full access urban_growth" ON urban_growth FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst')));

CREATE POLICY "Admin full access building_density" ON building_density FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst')));

CREATE POLICY "Admin full access predictions" ON predictions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst')));

CREATE POLICY "Admin full access reports" ON reports FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst')));

CREATE POLICY "Admin full access gis_layers" ON gis_layers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'analyst')));

CREATE POLICY "Admin read analytics" ON analytics_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Insert analytics" ON analytics_logs FOR INSERT WITH CHECK (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER districts_updated_at BEFORE UPDATE ON districts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER predictions_updated_at BEFORE UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER gis_layers_updated_at BEFORE UPDATE ON gis_layers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage buckets (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gis-data', 'gis-data', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE urban_growth;
ALTER PUBLICATION supabase_realtime ADD TABLE building_density;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_logs;
