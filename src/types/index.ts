export type UserRole = "user" | "admin" | "analyst" | "super_admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface District {
  id: string;
  name: string;
  name_so: string | null;
  code: string | null;
  area_km2: number | null;
  population: number | null;
  geometry: GeoJSON.Geometry | null;
  centroid: GeoJSON.Point | null;
  created_at: string;
  updated_at: string;
}

export interface UrbanGrowth {
  id: string;
  district_id: string;
  year: number;
  built_up_area_km2: number;
  growth_rate: number | null;
  change_from_previous: number | null;
  geometry: GeoJSON.Geometry | null;
  metadata: Record<string, unknown>;
  created_at: string;
  district?: District;
}

export interface BuildingDensity {
  id: string;
  district_id: string;
  year: number;
  buildings_count: number;
  density_per_km2: number;
  avg_building_size_m2: number | null;
  geometry: GeoJSON.Geometry | null;
  created_at: string;
  district?: District;
}

export type PredictionStatus = "pending" | "processing" | "completed" | "failed";

export interface Prediction {
  id: string;
  district_id: string | null;
  target_year: number;
  predicted_area_km2: number | null;
  predicted_density: number | null;
  confidence_score: number | null;
  model_type: string;
  hotspot_geometry: GeoJSON.Geometry | null;
  status: PredictionStatus;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  district?: District;
}

export type ReportStatus = "draft" | "published" | "archived";

export interface Report {
  id: string;
  title: string;
  description: string | null;
  year_range: string | null;
  file_url: string | null;
  file_size: number | null;
  status: ReportStatus;
  generated_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type LayerType = "vector" | "raster" | "heatmap" | "satellite";

export interface GisLayer {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  layer_type: LayerType;
  year: number | null;
  geojson: GeoJSON.FeatureCollection | null;
  file_url: string | null;
  style: Record<string, unknown>;
  is_visible: boolean;
  is_public: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsLog {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  user_id: string | null;
  session_id: string | null;
  ip_hash: string | null;
  created_at: string;
}

export type ContactMessageStatus = "new" | "read" | "archived";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: ContactMessageStatus;
  user_id: string | null;
  created_at: string;
}

export interface AnalyticsSummaryItem {
  event_type: string;
  count: number;
}

export interface AnalyticsSummary {
  total: number;
  uniqueSessions: number;
  byEvent: AnalyticsSummaryItem[];
  recent: AnalyticsLog[];
}

export interface GrowthStatistics {
  totalBuiltUpArea: number;
  totalGrowthRate: number;
  peakGrowthYear: number;
  districtsCount: number;
  avgDensity: number;
  yearlyTrend: { year: number; area: number; growth: number }[];
  districtComparison: { name: string; area: number; density: number; growth: number }[];
}

export interface MapLayerConfig {
  id: string;
  name: string;
  visible: boolean;
  type: LayerType;
  opacity: number;
  color?: string;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface PredictionInput {
  district_id?: string;
  target_year: number;
  model_type?: "random_forest" | "linear_regression";
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: Record<string, unknown>;
}
