-- Mogadishu Urban Growth Observatory — Seed Data
-- Run after 001_initial_schema.sql and 002_super_admin.sql

-- ─── Districts (fixed UUIDs for referential seed data) ───
INSERT INTO districts (id, name, name_so, code, area_km2, population, centroid) VALUES
  ('11111111-1111-4111-8111-111111110001', 'Hodan',       'Hodan',       'HOD', 12.5, 185000, '{"type":"Point","coordinates":[45.32,2.04]}'),
  ('11111111-1111-4111-8111-111111110002', 'Wadajir',     'Wadajir',     'WAD', 10.8, 162000, '{"type":"Point","coordinates":[45.30,2.05]}'),
  ('11111111-1111-4111-8111-111111110003', 'Waberi',      'Waberi',      'WAB',  8.2,  98000, '{"type":"Point","coordinates":[45.34,2.03]}'),
  ('11111111-1111-4111-8111-111111110004', 'Hamar Weyne', 'Xamar Weyne', 'HWN',  4.5,  72000, '{"type":"Point","coordinates":[45.34,2.04]}'),
  ('11111111-1111-4111-8111-111111110005', 'Shangani',    'Shangaani',   'SHA',  3.8,  55000, '{"type":"Point","coordinates":[45.35,2.04]}'),
  ('11111111-1111-4111-8111-111111110006', 'Bondhere',    'Boondheere',  'BON',  6.1,  88000, '{"type":"Point","coordinates":[45.33,2.05]}'),
  ('11111111-1111-4111-8111-111111110007', 'Yaaqshiid',   'Yaaqshiid',   'YAA', 14.2, 210000, '{"type":"Point","coordinates":[45.28,2.06]}'),
  ('11111111-1111-4111-8111-111111110008', 'Daynile',     'Dayniile',    'DAY', 18.5, 245000, '{"type":"Point","coordinates":[45.25,2.08]}'),
  ('11111111-1111-4111-8111-111111110009', 'Karaan',      'Karaan',      'KAR', 11.3, 168000, '{"type":"Point","coordinates":[45.29,2.07]}'),
  ('11111111-1111-4111-8111-111111110010', 'Heliwa',      'Heliwa',      'HEL',  9.7, 142000, '{"type":"Point","coordinates":[45.31,2.06]}')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  area_km2 = EXCLUDED.area_km2,
  population = EXCLUDED.population,
  centroid = EXCLUDED.centroid,
  updated_at = NOW();

-- ─── Urban growth (2014–2026 per district) ───
INSERT INTO urban_growth (district_id, year, built_up_area_km2, growth_rate, change_from_previous)
SELECT
  d.id,
  y.year,
  ROUND((d.area_km2 * (0.18 + (y.year - 2014) * 0.008))::numeric, 2),
  ROUND((2.0 + (y.year - 2014) * 0.15 + (ASCII(d.code) % 10) * 0.05)::numeric, 2),
  ROUND((d.area_km2 * 0.008)::numeric, 2)
FROM districts d
CROSS JOIN generate_series(2014, 2026) AS y(year)
ON CONFLICT (district_id, year) DO NOTHING;

-- ─── Building density (2014–2026 per district) ───
INSERT INTO building_density (district_id, year, buildings_count, density_per_km2, avg_building_size_m2)
SELECT
  d.id,
  y.year,
  ROUND((800 + (y.year - 2014) * 45 + (d.population / 100))::numeric)::integer,
  ROUND((900 + (y.year - 2014) * 35 + (ASCII(d.code) % 20) * 10)::numeric, 2),
  ROUND((85 + (ASCII(d.code) % 15))::numeric, 2)
FROM districts d
CROSS JOIN generate_series(2014, 2026) AS y(year)
ON CONFLICT (district_id, year) DO NOTHING;

-- ─── Predictions (2027–2030) ───
INSERT INTO predictions (district_id, target_year, predicted_area_km2, predicted_density, confidence_score, model_type, status, metadata)
SELECT
  d.id,
  y.target_year,
  ROUND((d.area_km2 * (0.42 + (y.target_year - 2026) * 0.03))::numeric, 2),
  ROUND((1100 + (y.target_year - 2026) * 80)::numeric, 2),
  ROUND((0.82 + (ASCII(d.code) % 10) * 0.01)::numeric, 4),
  'random_forest',
  'completed',
  '{"source":"seed"}'::jsonb
FROM districts d
CROSS JOIN (VALUES (2027), (2028), (2029), (2030)) AS y(target_year);

-- ─── Reports ───
INSERT INTO reports (title, description, year_range, status, metadata)
SELECT * FROM (VALUES
  (
    'Mogadishu Urban Growth Analysis 2014–2026',
    'Comprehensive analysis of urban expansion patterns across all districts.',
    '2014–2026',
    'published'::report_status,
    '{"pages":48,"format":"pdf"}'::jsonb
  ),
  (
    'Building Density Assessment Report',
    'District-level building density analysis with comparative statistics.',
    '2020–2026',
    'published'::report_status,
    '{"pages":32,"format":"pdf"}'::jsonb
  ),
  (
    'AI Urban Expansion Forecast 2027–2030',
    'Machine learning predictions for future urban growth hotspots.',
    '2027–2030',
    'published'::report_status,
    '{"pages":24,"format":"pdf"}'::jsonb
  )
) AS v(title, description, year_range, status, metadata)
WHERE NOT EXISTS (SELECT 1 FROM reports WHERE title = v.title);

-- ─── GIS layers (metadata; GeoJSON generated client-side when null) ───
INSERT INTO gis_layers (name, slug, description, layer_type, year, is_visible, is_public, sort_order) VALUES
  ('District Boundaries',  'districts', 'Mogadishu district boundaries',     'vector',   NULL, true, true, 1),
  ('Built-up Areas',       'built-up',  'Urban built-up area polygons',      'vector',   2024, true, true, 2),
  ('Growth Heatmap',       'heatmap',   'Urban expansion intensity heatmap', 'heatmap',  2024, true, true, 3),
  ('Satellite Imagery',    'satellite', 'Sentinel-2 satellite basemap',      'satellite',2024, false,true, 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ─── Extend admin RLS to super_admin on all data tables ───
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Super admin full access districts'
  ) THEN
    CREATE POLICY "Super admin full access districts" ON districts FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Super admin full access urban_growth'
  ) THEN
    CREATE POLICY "Super admin full access urban_growth" ON urban_growth FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Super admin full access building_density'
  ) THEN
    CREATE POLICY "Super admin full access building_density" ON building_density FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Super admin full access predictions'
  ) THEN
    CREATE POLICY "Super admin full access predictions" ON predictions FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Super admin full access reports'
  ) THEN
    CREATE POLICY "Super admin full access reports" ON reports FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Super admin full access gis_layers'
  ) THEN
    CREATE POLICY "Super admin full access gis_layers" ON gis_layers FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Super admin read analytics'
  ) THEN
    CREATE POLICY "Super admin read analytics" ON analytics_logs FOR SELECT
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));
  END IF;
END $$;

-- Admin role (not analyst) write access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin role full access districts'
  ) THEN
    CREATE POLICY "Admin role full access districts" ON districts FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin role full access urban_growth'
  ) THEN
    CREATE POLICY "Admin role full access urban_growth" ON urban_growth FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin role full access building_density'
  ) THEN
    CREATE POLICY "Admin role full access building_density" ON building_density FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin role full access predictions'
  ) THEN
    CREATE POLICY "Admin role full access predictions" ON predictions FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin role full access reports'
  ) THEN
    CREATE POLICY "Admin role full access reports" ON reports FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin role full access gis_layers'
  ) THEN
    CREATE POLICY "Admin role full access gis_layers" ON gis_layers FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin role read analytics'
  ) THEN
    CREATE POLICY "Admin role read analytics" ON analytics_logs FOR SELECT
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;
