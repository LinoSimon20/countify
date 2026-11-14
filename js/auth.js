import { supabase } from "./supabase-client.js";

export async function getCurrentSession() {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

export async function signIn({ email, password }) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }
}

export async function signUp({
  email,
  password,
  redirectTo
}) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo
    }
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function isCurrentUserAdmin() {
  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    throw error;
  }

  return data === true;
}

export function watchAuthState(onChange) {
  return supabase.auth.onAuthStateChange(onChange);
}