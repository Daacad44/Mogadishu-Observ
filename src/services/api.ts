import { dataService } from "@/services/data";
import { supabaseData } from "@/services/supabase-data";
import { DISTRICTS } from "@/lib/data/sample-data";
import type {
  District,
  GisLayer,
  Profile,
  UserRole,
  LayerType,
  ContactMessage,
  AnalyticsSummary,
} from "@/types";

export const growthService = {
  getAll: async () => (await supabaseData.getUrbanGrowth()) ?? dataService.getGrowth(),
  getByYear: async (year: number) =>
    (await supabaseData.getUrbanGrowth(year)) ?? dataService.getGrowth(year),
};

export const densityService = {
  getAll: async (params?: { year?: string }) => {
    const year = params?.year ? parseInt(params.year) : undefined;
    return (await supabaseData.getBuildingDensity(year)) ?? dataService.getDensity(year);
  },
};

export const statisticsService = {
  get: async () => (await supabaseData.getStatistics()) ?? dataService.getStatistics(),
};

export const predictionService = {
  getAll: async () => (await supabaseData.getPredictions()) ?? dataService.getPredictions(),
  create: async (data: { target_year: number; district_id?: string; model_type?: string }) =>
    (await supabaseData.createPrediction(data)) ?? dataService.createPrediction(data),
  runBatch: async (targetYear: number, modelType?: string): Promise<number> =>
    supabaseData.createBatchPredictions(targetYear, modelType),
};

export const reportService = {
  getAll: async () => (await supabaseData.getReports()) ?? dataService.getReports(),
  generate: async (data: { title: string; description?: string; year_range?: string }) =>
    (await supabaseData.createReport(data)) ?? dataService.createReport(data),
};

export const mapService = {
  getGeoJSON: async (type: string, year?: number) =>
    (await supabaseData.getMapGeoJSON(type, year)) ?? dataService.getMapGeoJSON(type, year),
};

export const profileService = {
  getAll: async (): Promise<Profile[]> =>
    (await supabaseData.getProfiles()) ?? [],

  updateRole: async (id: string, role: UserRole): Promise<Profile | null> =>
    supabaseData.updateProfileRole(id, role),

  getDistricts: async (): Promise<District[]> => {
    const dbDistricts = await supabaseData.getDistricts();
    if (dbDistricts?.length) return dbDistricts;
    return DISTRICTS.map((d, i) => ({
      ...d,
      id: `district-${i}`,
      geometry: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })) as District[];
  },

  getAdminStats: async () =>
    (await supabaseData.getAdminStats()) ?? {
      users: 0,
      layers: 4,
      reports: 3,
      predictions: 40,
    },

  getAnalyticsLogs: async (limit?: number) =>
    (await supabaseData.getAnalyticsLogs(limit)) ?? [],
};

export const analyticsService = {
  getSummary: async (): Promise<AnalyticsSummary> =>
    (await supabaseData.getAnalyticsSummary()) ?? {
      total: 0,
      uniqueSessions: 0,
      byEvent: [],
      recent: [],
    },
};

export const contactService = {
  submit: async (input: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<ContactMessage | null> => supabaseData.createContactMessage(input),

  getAll: async (): Promise<ContactMessage[]> =>
    (await supabaseData.getContactMessages()) ?? [],
};

export const uploadService = {
  createLayer: async (input: {
    name: string;
    slug: string;
    description?: string;
    layer_type: LayerType;
    year?: number | null;
    geojson?: GeoJSON.FeatureCollection | null;
  }): Promise<GisLayer | null> => supabaseData.createGisLayer(input),
};

export const gisLayerService = {
  getAll: async (): Promise<GisLayer[]> => {
    const layers = await supabaseData.getGisLayers();
    if (layers?.length) return layers;
    return [
      {
        id: "1",
        name: "District Boundaries",
        slug: "districts",
        description: "Mogadishu district boundaries",
        layer_type: "vector",
        year: null,
        geojson: null,
        file_url: null,
        style: {},
        is_visible: true,
        is_public: true,
        sort_order: 1,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Built-up Areas",
        slug: "built-up",
        description: "Urban built-up area polygons",
        layer_type: "vector",
        year: 2024,
        geojson: null,
        file_url: null,
        style: {},
        is_visible: true,
        is_public: true,
        sort_order: 2,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Growth Heatmap",
        slug: "heatmap",
        description: "Urban expansion intensity heatmap",
        layer_type: "heatmap",
        year: 2024,
        geojson: null,
        file_url: null,
        style: {},
        is_visible: true,
        is_public: true,
        sort_order: 3,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] as GisLayer[];
  },

  updateVisibility: async (id: string, is_visible: boolean) =>
    supabaseData.updateGisLayerVisibility(id, is_visible),
};
