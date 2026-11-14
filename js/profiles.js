import { supabase } from "./supabase-client.js";

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

export function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

export function isValidUsername(username) {
  return USERNAME_PATTERN.test(username);
}

export async function isUsernameAvailable(username) {
  const candidate = normalizeUsername(username);

  if (!isValidUsername(candidate)) {
    return false;
  }

  const { data, error } = await supabase.rpc(
    "is_username_available",
    {
      candidate
    }
  );

  if (error) {
    throw error;
  }

  return data === true;
}