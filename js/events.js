import { supabase } from "./supabase-client.js";

export async function fetchEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createEvent({
  title,
  description,
  eventAt,
  userId
}) {
  const { error } = await supabase
    .from("events")
    .insert({
      title: title.trim(),
      description: description.trim() || null,
      event_at: new Date(eventAt).toISOString(),
      created_by: userId
    });

  if (error) {
    throw error;
  }
}

export function subscribeToEventChanges(onChange) {
  return supabase
    .channel("countify-events")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "events"
      },
      onChange
    )
    .subscribe();
}

export async function unsubscribeFromEventChanges(channel) {
  if (channel) {
    await supabase.removeChannel(channel);
  }
}