import { isSupabaseConfigured, supabaseAdminEmail } from "@/lib/supabase/config";
import { getRouteHandlerSupabase } from "@/lib/supabase/server";
import { isAdminRequest as isLocalAdminRequest } from "./auth";

export async function isAdminRequest(): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getRouteHandlerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const email = supabaseAdminEmail();
    if (email && user.email !== email) return false;
    return true;
  }
  return isLocalAdminRequest();
}