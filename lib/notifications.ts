import { supabase } from "@/lib/supabase";

export type CommandFitNotificationInput = {
  cycleId?: string;
  battalion: string;
  eventType: "test_update" | "training_update" | "low_training_load";
  severity?: "info" | "success" | "warning";
  title: string;
  message: string;
  href: string;
  dedupeKey: string;
};

export async function publishNotification(input: CommandFitNotificationInput) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from("commandfit_notifications")
    .upsert({
      cycle_id: input.cycleId ?? null,
      battalion: input.battalion,
      event_type: input.eventType,
      severity: input.severity ?? "info",
      title: input.title,
      message: input.message,
      href: input.href,
      dedupe_key: input.dedupeKey,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }, { onConflict: "dedupe_key" });

  if (error) console.error("Notification publish error:", error);
}

export async function clearNotification(dedupeKey: string) {
  const { error } = await supabase
    .from("commandfit_notifications")
    .delete()
    .eq("dedupe_key", dedupeKey);

  if (error) console.error("Notification clear error:", error);
}
