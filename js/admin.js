import { supabase } from "./supabase-client.js";

const INTERNAL_IMAGE_PATH =
  /^assets\/images\/[\w./-]+\.(png|jpe?g|webp|gif|svg)$/i;

async function updateEvent(eventId, changes) {
  const { error } = await supabase
    .from("events")
    .update(changes)
    .eq("id", eventId);

  if (error) {
    throw error;
  }
}

export async function approveEvent(eventId) {
  await updateEvent(eventId, {
    status: "approved"
  });
}

export async function rejectEvent(eventId) {
  await updateEvent(eventId, {
    status: "rejected",
    is_featured: false
  });
}

export async function setFeaturedEvent(eventId) {
  const { error: clearError } = await supabase
    .from("events")
    .update({ is_featured: false })
    .eq("is_featured", true);

  if (clearError) {
    throw clearError;
  }

  await updateEvent(eventId, {
    status: "approved",
    is_featured: true
  });
}

export async function setEventImage(eventId, imagePath) {
  if (!INTERNAL_IMAGE_PATH.test(imagePath)) {
    throw new Error("La ruta de la imagen debe estar dentro de assets/images/.");
  }

  await updateEvent(eventId, {
    image_path: imagePath
  });
}

export async function deleteEvent(eventId) {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) {
    throw error;
  }
}