const rateStore = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(
  key: string,
  max = 100,
  windowMs = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateStore.get(key);

  if (!entry || now > entry.reset) {
    rateStore.set(key, { count: 1, reset: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: max - entry.count };
}

export function apiResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200
) {
  return Response.json({ data, error: null, meta }, { status });
}

export function apiError(message: string, status = 400) {
  return Response.json({ data: null, error: message }, { status });
}
