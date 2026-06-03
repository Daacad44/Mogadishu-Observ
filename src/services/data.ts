import type {
  GrowthStatistics,
  UrbanGrowth,
  BuildingDensity,
  Prediction,
  Report,
} from "@/types";
import {
  generateUrbanGrowthData,
  generateDensityData,
  computeStatistics,
  generatePredictions,
  generateDistrictGeoJSON,
  generateBuiltUpGeoJSON,
  generateHeatmapData,
} from "@/lib/data/sample-data";

// Module-level cache — instant reads, zero network latency
const growthCache: UrbanGrowth[] = generateUrbanGrowthData().map((g, i) => ({
  ...g,
  id: `growth-${i}`,
  created_at: new Date().toISOString(),
}));

const densityCache: BuildingDensity[] = generateDensityData().map((d, i) => ({
  ...d,
  id: `density-${i}`,
  created_at: new Date().toISOString(),
}));

const statsCache: GrowthStatistics = computeStatistics(growthCache, densityCache);

let predictionsCache: Prediction[] = generatePredictions().map((p, i) => ({
  ...p,
  id: `pred-${i}`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

const SAMPLE_REPORTS: Report[] = [
  {
    id: "report-1",
    title: "Mogadishu Urban Growth Analysis 2014–2026",
    description: "Comprehensive analysis of urban expansion patterns across all districts.",
    year_range: "2014–2026",
    file_url: null,
    file_size: null,
    status: "published",
    generated_by: null,
    metadata: { pages: 48, format: "pdf" },
    created_at: "2025-06-15T10:00:00Z",
    updated_at: "2025-06-15T10:00:00Z",
  },
  {
    id: "report-2",
    title: "Building Density Assessment Report",
    description: "District-level building density analysis with comparative statistics.",
    year_range: "2020–2026",
    file_url: null,
    file_size: null,
    status: "published",
    generated_by: null,
    metadata: { pages: 32, format: "pdf" },
    created_at: "2025-08-20T14:30:00Z",
    updated_at: "2025-08-20T14:30:00Z",
  },
  {
    id: "report-3",
    title: "AI Urban Expansion Forecast 2027–2030",
    description: "Machine learning predictions for future urban growth hotspots.",
    year_range: "2027–2030",
    file_url: null,
    file_size: null,
    status: "published",
    generated_by: null,
    metadata: { pages: 24, format: "pdf" },
    created_at: "2025-11-01T09:00:00Z",
    updated_at: "2025-11-01T09:00:00Z",
  },
];

let reportsCache = [...SAMPLE_REPORTS];

export const dataService = {
  getGrowth: (year?: number, districtId?: string) => {
    let results = growthCache;
    if (year) results = results.filter((r) => r.year === year);
    if (districtId) results = results.filter((r) => r.district_id === districtId);
    return results;
  },

  getDensity: (year?: number, districtId?: string) => {
    let results = densityCache;
    if (year) results = results.filter((r) => r.year === year);
    if (districtId) results = results.filter((r) => r.district_id === districtId);
    return results;
  },

  getStatistics: () => statsCache,

  getPredictions: () => predictionsCache,

  createPrediction: (data: {
    target_year: number;
    district_id?: string;
    model_type?: string;
  }) => {
    const rand = Math.random();
    const prediction: Prediction = {
      id: `pred-${Date.now()}`,
      district_id: data.district_id || null,
      target_year: data.target_year,
      predicted_area_km2: Math.round((15 + rand * 10) * 100) / 100,
      predicted_density: Math.round(1200 + rand * 800),
      confidence_score: Math.round((0.78 + rand * 0.15) * 10000) / 10000,
      model_type: data.model_type || "random_forest",
      hotspot_geometry: null,
      status: "completed",
      metadata: { generated: true },
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    predictionsCache = [prediction, ...predictionsCache];
    return prediction;
  },

  getReports: () => reportsCache,

  createReport: (data: { title: string; description?: string; year_range?: string }) => {
    const report: Report = {
      id: `report-${Date.now()}`,
      title: data.title,
      description: data.description || null,
      year_range: data.year_range || null,
      file_url: null,
      file_size: null,
      status: "draft",
      generated_by: null,
      metadata: { generated: true, format: "pdf" },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    reportsCache = [report, ...reportsCache];
    return report;
  },

  getMapGeoJSON: (type: string, year = 2024) => {
    switch (type) {
      case "districts":
        return generateDistrictGeoJSON();
      case "built-up":
        return generateBuiltUpGeoJSON(year);
      case "heatmap": {
        const points = generateHeatmapData(year);
        return {
          type: "FeatureCollection" as const,
          features: points.map((p, i) => ({
            type: "Feature" as const,
            properties: { intensity: p.intensity, id: i },
            geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
          })),
        };
      }
      default:
        throw new Error(`Unknown map type: ${type}`);
    }
  },
};
