import { createClient } from "@/lib/supabase/client";
import type {
  UrbanGrowth,
  BuildingDensity,
  GrowthStatistics,
  Prediction,
  Report,
  District,
  GisLayer,
  Profile,
  UserRole,
  AnalyticsLog,
  AnalyticsSummary,
  ContactMessage,
  LayerType,
} from "@/types";
import { computeStatistics } from "@/lib/data/sample-data";

function db() {
  return createClient();
}

export const supabaseData = {
  async getDistricts(): Promise<District[] | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data, error } = await supabase.from("districts").select("*").order("name");
    if (error || !data?.length) return null;
    return data as District[];
  },

  async getUrbanGrowth(year?: number, districtId?: string): Promise<UrbanGrowth[] | null> {
    const supabase = db();
    if (!supabase) return null;
    let query = supabase.from("urban_growth").select("*").order("year");
    if (year) query = query.eq("year", year);
    if (districtId) query = query.eq("district_id", districtId);
    const { data, error } = await query;
    if (error || !data?.length) return null;
    return data as UrbanGrowth[];
  },

  async getBuildingDensity(year?: number, districtId?: string): Promise<BuildingDensity[] | null> {
    const supabase = db();
    if (!supabase) return null;
    let query = supabase.from("building_density").select("*").order("year");
    if (year) query = query.eq("year", year);
    if (districtId) query = query.eq("district_id", districtId);
    const { data, error } = await query;
    if (error || !data?.length) return null;
    return data as BuildingDensity[];
  },

  async getStatistics(): Promise<GrowthStatistics | null> {
    const [growth, density, districts] = await Promise.all([
      this.getUrbanGrowth(),
      this.getBuildingDensity(),
      this.getDistricts(),
    ]);
    if (!growth?.length || !density?.length) return null;
    return computeStatistics(growth, density, districts ?? undefined);
  },

  async getPredictions(): Promise<Prediction[] | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data?.length) return null;
    return data as Prediction[];
  },

  async createPrediction(input: {
    target_year: number;
    district_id?: string;
    model_type?: string;
  }): Promise<Prediction | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("predictions")
      .insert({
        target_year: input.target_year,
        district_id: input.district_id ?? null,
        model_type: input.model_type ?? "random_forest",
        predicted_area_km2: 15 + Math.random() * 10,
        predicted_density: 1200 + Math.random() * 800,
        confidence_score: 0.78 + Math.random() * 0.15,
        status: "completed",
        metadata: { generated: true },
      })
      .select()
      .single();
    if (error) return null;
    return data as Prediction;
  },

  async getReports(): Promise<Report[] | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data?.length) return null;
    return data as Report[];
  },

  async createReport(input: {
    title: string;
    description?: string;
    year_range?: string;
  }): Promise<Report | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("reports")
      .insert({
        title: input.title,
        description: input.description ?? null,
        year_range: input.year_range ?? null,
        status: "draft",
        metadata: { generated: true, format: "pdf" },
      })
      .select()
      .single();
    if (error) return null;
    return data as Report;
  },

  async getGisLayer(slug: string, year?: number): Promise<GisLayer | null> {
    const supabase = db();
    if (!supabase) return null;
    let query = supabase.from("gis_layers").select("*").eq("slug", slug).eq("is_public", true);
    if (year) query = query.eq("year", year);
    const { data, error } = await query.limit(1).maybeSingle();
    if (error || !data) return null;
    return data as GisLayer;
  },

  async getMapGeoJSON(type: string, year = 2024): Promise<GeoJSON.FeatureCollection | null> {
    const layer = await this.getGisLayer(type, type === "districts" ? undefined : year);
    if (layer?.geojson) return layer.geojson as GeoJSON.FeatureCollection;

    // Build district GeoJSON from districts table
    if (type === "districts") {
      const districts = await this.getDistricts();
      if (!districts?.length) return null;
      return {
        type: "FeatureCollection",
        features: districts
          .filter((d) => d.centroid)
          .map((d) => ({
            type: "Feature" as const,
            properties: {
              name: d.name,
              code: d.code,
              area_km2: d.area_km2,
              population: d.population,
            },
            geometry: d.centroid!,
          })),
      };
    }

    return null;
  },

  async getProfiles(): Promise<Profile[] | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data?.length) return null;
    return data as Profile[];
  },

  async updateProfileRole(id: string, role: UserRole): Promise<Profile | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) return null;
    return data as Profile;
  },

  async getGisLayers(): Promise<GisLayer[] | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("gis_layers")
      .select("*")
      .order("sort_order");
    if (error || !data?.length) return null;
    return data as GisLayer[];
  },

  async updateGisLayerVisibility(id: string, is_visible: boolean): Promise<GisLayer | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("gis_layers")
      .update({ is_visible, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) return null;
    return data as GisLayer;
  },

  async getAnalyticsLogs(limit = 10): Promise<AnalyticsLog[] | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("analytics_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return null;
    return (data ?? []) as AnalyticsLog[];
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary | null> {
    const supabase = db();
    if (!supabase) return null;

    // Pull a recent window of events and aggregate client-side.
    const { data, error } = await supabase
      .from("analytics_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) return null;
    const logs = (data ?? []) as AnalyticsLog[];

    const counts = new Map<string, number>();
    const sessions = new Set<string>();
    for (const log of logs) {
      counts.set(log.event_type, (counts.get(log.event_type) ?? 0) + 1);
      if (log.session_id) sessions.add(log.session_id);
    }

    return {
      total: logs.length,
      uniqueSessions: sessions.size,
      byEvent: Array.from(counts.entries())
        .map(([event_type, count]) => ({ event_type, count }))
        .sort((a, b) => b.count - a.count),
      recent: logs.slice(0, 10),
    };
  },

  async createContactMessage(input: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<ContactMessage | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data: auth } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name: input.name,
        email: input.email,
        subject: input.subject ?? null,
        message: input.message,
        status: "new",
        user_id: auth?.user?.id ?? null,
      })
      .select()
      .single();
    if (error) return null;
    return data as ContactMessage;
  },

  async getContactMessages(): Promise<ContactMessage[] | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return null;
    return (data ?? []) as ContactMessage[];
  },

  async createGisLayer(input: {
    name: string;
    slug: string;
    description?: string;
    layer_type: LayerType;
    year?: number | null;
    geojson?: GeoJSON.FeatureCollection | null;
    is_public?: boolean;
  }): Promise<GisLayer | null> {
    const supabase = db();
    if (!supabase) return null;
    const { data: auth } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("gis_layers")
      .insert({
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        layer_type: input.layer_type,
        year: input.year ?? null,
        geojson: input.geojson ?? null,
        is_visible: true,
        is_public: input.is_public ?? true,
        created_by: auth?.user?.id ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as GisLayer;
  },

  async createBatchPredictions(
    targetYear: number,
    modelType = "random_forest"
  ): Promise<number> {
    const supabase = db();
    if (!supabase) return 0;

    const districts = await this.getDistricts();
    if (!districts?.length) return 0;

    const rows = districts.map((d) => {
      const rand = Math.random();
      const base = (d.area_km2 ?? 10) * (0.4 + rand * 0.15);
      return {
        district_id: d.id,
        target_year: targetYear,
        predicted_area_km2: Math.round(base * 100) / 100,
        predicted_density: Math.round(1100 + rand * 700),
        confidence_score: Math.round((0.8 + rand * 0.15) * 10000) / 10000,
        model_type: modelType,
        status: "completed",
        metadata: { batch: true },
      };
    });

    const { error } = await supabase.from("predictions").insert(rows);
    if (error) throw error;
    return rows.length;
  },

  async getAdminStats(): Promise<{
    users: number;
    layers: number;
    reports: number;
    predictions: number;
  } | null> {
    const supabase = db();
    if (!supabase) return null;

    const [profiles, layers, reports, predictions] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("gis_layers").select("id", { count: "exact", head: true }),
      supabase.from("reports").select("id", { count: "exact", head: true }),
      supabase.from("predictions").select("id", { count: "exact", head: true }),
    ]);

    if (profiles.error) return null;

    return {
      users: profiles.count ?? 0,
      layers: layers.count ?? 0,
      reports: reports.count ?? 0,
      predictions: predictions.count ?? 0,
    };
  },
};
