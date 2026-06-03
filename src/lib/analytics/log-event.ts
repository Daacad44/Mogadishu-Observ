import { createClient } from "@/lib/supabase/client";

const SESSION_KEY = "mug_session_id";

/** Stable per-browser-session id used to group analytics events. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Fire-and-forget analytics event written to the analytics_logs table.
 * Never throws — analytics must not break the UI.
 */
export async function logEvent(
  eventType: string,
  eventData: Record<string, unknown> = {}
): Promise<void> {
  try {
    const supabase = createClient();
    if (!supabase) return;

    const { data: auth } = await supabase.auth.getUser();

    await supabase.from("analytics_logs").insert({
      event_type: eventType,
      event_data: eventData,
      user_id: auth?.user?.id ?? null,
      session_id: getSessionId(),
    });
  } catch {
    // swallow — analytics is non-critical
  }
}
