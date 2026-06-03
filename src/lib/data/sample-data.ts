import type {
  District,
  UrbanGrowth,
  BuildingDensity,
  GrowthStatistics,
  HeatmapPoint,
} from "@/types";

export const MOGADISHU_CENTER: [number, number] = [2.0469, 45.3182];
export const MOGADISHU_BOUNDS: [[number, number], [number, number]] = [
  [1.95, 45.15],
  [2.15, 45.45],
];

export const DISTRICTS: Omit<District, "id" | "created_at" | "updated_at">[] = [
  { name: "Hodan", name_so: "Hodan", code: "HOD", area_km2: 12.5, population: 185000, geometry: null, centroid: { type: "Point", coordinates: [45.32, 2.04] } },
  { name: "Wadajir", name_so: "Wadajir", code: "WAD", area_km2: 10.8, population: 162000, geometry: null, centroid: { type: "Point", coordinates: [45.30, 2.05] } },
  { name: "Waberi", name_so: "Waberi", code: "WAB", area_km2: 8.2, population: 98000, geometry: null, centroid: { type: "Point", coordinates: [45.34, 2.03] } },
  { name: "Hamar Weyne", name_so: "Xamar Weyne", code: "HWN", area_km2: 4.5, population: 72000, geometry: null, centroid: { type: "Point", coordinates: [45.34, 2.04] } },
  { name: "Shangani", name_so: "Shangaani", code: "SHA", area_km2: 3.8, population: 55000, geometry: null, centroid: { type: "Point", coordinates: [45.35, 2.04] } },
  { name: "Bondhere", name_so: "Boondheere", code: "BON", area_km2: 6.1, population: 88000, geometry: null, centroid: { type: "Point", coordinates: [45.33, 2.05] } },
  { name: "Yaaqshiid", name_so: "Yaaqshiid", code: "YAA", area_km2: 14.2, population: 210000, geometry: null, centroid: { type: "Point", coordinates: [45.28, 2.06] } },
  { name: "Daynile", name_so: "Dayniile", code: "DAY", area_km2: 18.5, population: 245000, geometry: null, centroid: { type: "Point", coordinates: [45.25, 2.08] } },
  { name: "Karaan", name_so: "Karaan", code: "KAR", area_km2: 11.3, population: 168000, geometry: null, centroid: { type: "Point", coordinates: [45.29, 2.07] } },
  { name: "Heliwa", name_so: "Heliwa", code: "HEL", area_km2: 9.7, population: 142000, geometry: null, centroid: { type: "Point", coordinates: [45.31, 2.06] } },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateUrbanGrowthData(): Omit<UrbanGrowth, "id" | "created_at">[] {
  const data: Omit<UrbanGrowth, "id" | "created_at">[] = [];
  const years = Array.from({ length: 13 }, (_, i) => 2014 + i);

  DISTRICTS.forEach((district, dIdx) => {
    const rand = seededRandom(dIdx * 1000 + 42);
    const baseArea = (district.area_km2 || 10) * (0.15 + rand() * 0.1);

    years.forEach((year, yIdx) => {
      const growthFactor = 1 + (yIdx * 0.025) + rand() * 0.015;
      const area = baseArea * Math.pow(growthFactor, yIdx / 3);
      const prevArea = yIdx > 0 ? data[data.length - 1]?.built_up_area_km2 || area : area;
      const growthRate = yIdx > 0 ? ((area - prevArea) / prevArea) * 100 : 0;

      data.push({
        district_id: `district-${dIdx}`,
        year,
        built_up_area_km2: Math.round(area * 100) / 100,
        growth_rate: Math.round(growthRate * 100) / 100,
        change_from_previous: Math.round((area - prevArea) * 100) / 100,
        geometry: null,
        metadata: { district: district.name },
      });
    });
  });

  return data;
}

export function generateDensityData(): Omit<BuildingDensity, "id" | "created_at">[] {
  const data: Omit<BuildingDensity, "id" | "created_at">[] = [];
  const years = Array.from({ length: 13 }, (_, i) => 2014 + i);

  DISTRICTS.forEach((district, dIdx) => {
    const rand = seededRandom(dIdx * 2000 + 77);
    const baseDensity = 800 + rand() * 400;

    years.forEach((year, yIdx) => {
      const density = baseDensity * (1 + yIdx * 0.03 + rand() * 0.01);
      const buildings = Math.round(density * (district.area_km2 || 10));

      data.push({
        district_id: `district-${dIdx}`,
        year,
        buildings_count: buildings,
        density_per_km2: Math.round(density),
        avg_building_size_m2: Math.round(80 + rand() * 40),
        geometry: null,
      });
    });
  });

  return data;
}

export function computeStatistics(
  growth: UrbanGrowth[],
  density: BuildingDensity[],
  districts?: { id: string; name: string }[]
): GrowthStatistics {
  const latestYear = Math.max(...growth.map((g) => g.year));
  const latestGrowth = growth.filter((g) => g.year === latestYear);
  const latestDensity = density.filter((d) => d.year === latestYear);

  const totalBuiltUpArea = latestGrowth.reduce((s, g) => s + g.built_up_area_km2, 0);
  const avgGrowthRate =
    latestGrowth.reduce((s, g) => s + (g.growth_rate || 0), 0) / latestGrowth.length;

  const yearlyMap = new Map<number, { area: number; count: number; growth: number }>();
  growth.forEach((g) => {
    const entry = yearlyMap.get(g.year) || { area: 0, count: 0, growth: 0 };
    entry.area += g.built_up_area_km2;
    entry.growth += g.growth_rate || 0;
    entry.count++;
    yearlyMap.set(g.year, entry);
  });

  const yearlyTrend = Array.from(yearlyMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, v]) => ({
      year,
      area: Math.round(v.area * 100) / 100,
      growth: Math.round((v.growth / v.count) * 100) / 100,
    }));

  const peakGrowthYear = yearlyTrend.reduce(
    (peak, t) => (t.growth > peak.growth ? t : peak),
    yearlyTrend[0]
  ).year;

  const districtNameMap = new Map(districts?.map((d) => [d.id, d.name]) ?? []);

  const densityMap = new Map(latestDensity.map((d) => [d.district_id, d]));
  const districtComparison = latestGrowth.map((g) => {
    const d = densityMap.get(g.district_id);
    const fallbackIdx = parseInt(g.district_id.replace("district-", ""), 10);
    const district = Number.isNaN(fallbackIdx) ? undefined : DISTRICTS[fallbackIdx];
    return {
      name: districtNameMap.get(g.district_id) || district?.name || g.district_id,
      area: g.built_up_area_km2,
      density: d?.density_per_km2 || 0,
      growth: g.growth_rate || 0,
    };
  });

  return {
    totalBuiltUpArea: Math.round(totalBuiltUpArea * 100) / 100,
    totalGrowthRate: Math.round(avgGrowthRate * 100) / 100,
    peakGrowthYear,
    districtsCount: districts?.length ?? DISTRICTS.length,
    avgDensity: Math.round(
      latestDensity.reduce((s, d) => s + d.density_per_km2, 0) / latestDensity.length
    ),
    yearlyTrend,
    districtComparison,
  };
}

export function generateHeatmapData(year: number): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];
  const intensity = (year - 2014) / 12;
  const rand = seededRandom(year * 31337);

  for (let i = 0; i < 200; i++) {
    points.push({
      lat: 2.0 + rand() * 0.12,
      lng: 45.22 + rand() * 0.18,
      intensity: 0.3 + intensity * 0.5 + rand() * 0.2,
    });
  }
  return points;
}

export function generatePredictions() {
  const futureYears = [2027, 2028, 2029, 2030];
  const predictions = [];

  for (const year of futureYears) {
    for (let dIdx = 0; dIdx < DISTRICTS.length; dIdx++) {
      const rand = seededRandom(year * 100 + dIdx);
      const baseArea = (DISTRICTS[dIdx].area_km2 || 10) * (0.35 + rand() * 0.15);
      const yearFactor = 1 + (year - 2026) * 0.04;

      predictions.push({
        district_id: `district-${dIdx}`,
        target_year: year,
        predicted_area_km2: Math.round(baseArea * yearFactor * 100) / 100,
        predicted_density: Math.round((900 + rand() * 500) * yearFactor),
        confidence_score: Math.round((0.75 + rand() * 0.2) * 10000) / 10000,
        model_type: "random_forest",
        status: "completed" as const,
        hotspot_geometry: null,
        metadata: { district: DISTRICTS[dIdx].name },
        created_by: null,
      });
    }
  }
  return predictions;
}

export function generateDistrictGeoJSON(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = DISTRICTS.map((d) => {
    const [lng, lat] = d.centroid?.coordinates || [45.32, 2.04];
    const size = 0.015 + (d.area_km2 || 10) * 0.001;
    return {
      type: "Feature",
      properties: {
        name: d.name,
        code: d.code,
        area_km2: d.area_km2,
        population: d.population,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lng - size, lat - size],
            [lng + size, lat - size * 0.8],
            [lng + size * 1.2, lat + size],
            [lng, lat + size * 1.1],
            [lng - size, lat + size * 0.5],
            [lng - size, lat - size],
          ],
        ],
      },
    };
  });

  return { type: "FeatureCollection", features };
}

export function generateBuiltUpGeoJSON(year: number): GeoJSON.FeatureCollection {
  const intensity = (year - 2014) / 12;
  const rand = seededRandom(year * 999);
  const features: GeoJSON.Feature[] = [];

  for (let i = 0; i < 30 + Math.floor(intensity * 40); i++) {
    const lng = 45.22 + rand() * 0.18;
    const lat = 2.0 + rand() * 0.12;
    const size = 0.002 + rand() * 0.004 * (1 + intensity);

    features.push({
      type: "Feature",
      properties: { year, intensity: 0.5 + intensity * 0.5 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lng, lat],
            [lng + size, lat],
            [lng + size, lat + size * 0.8],
            [lng, lat + size * 0.8],
            [lng, lat],
          ],
        ],
      },
    });
  }

  return { type: "FeatureCollection", features };
}
