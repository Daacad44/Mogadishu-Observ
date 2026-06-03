import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateUrbanGrowthData, computeStatistics, generateDensityData } from "../src/lib/data/sample-data";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const growth = generateUrbanGrowthData().map((g, i) => ({
    ...g,
    id: `growth-${i}`,
    created_at: new Date().toISOString(),
  }));
  const density = generateDensityData().map((d, i) => ({
    ...d,
    id: `density-${i}`,
    created_at: new Date().toISOString(),
  }));
  const stats = computeStatistics(growth, density);
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.status(200).json({ data: stats, error: null });
}
