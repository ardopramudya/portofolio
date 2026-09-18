export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

export function supabaseAdminEmail() {
  return process.env.SUPABASE_ADMIN_EMAIL || "";
}