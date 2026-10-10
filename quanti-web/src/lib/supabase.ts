import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function resolveSupabaseUrl() {
  let raw = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
  raw = raw.replace(/^['"]+|['"]+$/g, "").split(/\s+/)[0] || "";
  if (!raw) {
    return "https://placeholder.supabase.co";
  }

  if (/^[a-z0-9]{15,}$/i.test(raw) && !raw.includes(".")) {
    return `https://${raw}.supabase.co`;
  }

  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }

  try {
    const parsed = new URL(raw);
    const dashboard = parsed.pathname.match(/\/project\/([a-z0-9]+)/i);
    if (parsed.hostname.endsWith("supabase.com") && dashboard?.[1]) {
      return `https://${dashboard[1]}.supabase.co`;
    }

    let host = parsed.hostname.replace(/^db\./i, "");
    if (host.endsWith(".supabase.co") || host.endsWith(".supabase.net")) {
      return `https://${host}`;
    }

    return parsed.origin.replace(/\/+$/, "");
  } catch {
    return raw.replace(/\/rest\/v1.*$/i, "").replace(/\/+$/, "") || "https://placeholder.supabase.co";
  }
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
