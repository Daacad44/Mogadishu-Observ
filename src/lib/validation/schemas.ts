import { z } from "zod";

export const growthQuerySchema = z.object({
  year: z.coerce.number().min(2014).max(2030).optional(),
  district_id: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(500).default(100),
  offset: z.coerce.number().min(0).default(0),
});

export const densityQuerySchema = z.object({
  year: z.coerce.number().min(2014).max(2030).optional(),
  district_id: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(500).default(100),
});

export const predictionSchema = z.object({
  district_id: z.string().uuid().optional(),
  target_year: z.coerce.number().min(2027).max(2040),
  model_type: z.enum(["random_forest", "linear_regression"]).default("random_forest"),
});

export const reportSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  year_range: z.string().optional(),
});

export const layerSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  layer_type: z.enum(["vector", "raster", "heatmap", "satellite"]),
  year: z.coerce.number().min(2014).max(2030).optional(),
  is_visible: z.boolean().default(true),
  is_public: z.boolean().default(true),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
});

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  full_name: z.string().min(2).max(100).optional(),
});

export function parseQuery<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string | string[] | undefined>
): { data: T | null; error: string | null } {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) flat[key] = Array.isArray(value) ? value[0] : value;
  }
  const result = schema.safeParse(flat);
  if (!result.success) {
    return { data: null, error: result.error.errors[0]?.message || "Invalid input" };
  }
  return { data: result.data, error: null };
}
