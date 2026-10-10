import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

function resolveSupabaseUrl() {
  let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
  url = url.replace(/^['"]+|['"]+$/g, "");
  url = url.replace(/\/+$/, "");
  url = url.replace(/\/rest\/v1.*$/i, "");
  url = url.replace(/\/auth\/v1.*$/i, "");
  url = url.replace(/\/graphql\/v1.*$/i, "");
  url = url.replace(/\/storage\/v1.*$/i, "");
  return url || "https://placeholder.supabase.co";
}

export function getSupabase(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }
  const url = resolveSupabaseUrl();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key";
  browserClient = createClient(url, key);
  return browserClient;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) {
    return adminClient;
  }
  const url = resolveSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key";
  adminClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return adminClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const client = getSupabase();
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
