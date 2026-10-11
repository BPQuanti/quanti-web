import { createClient } from "@supabase/supabase-js";
import type { GrowthPlatform, WeeklyPostDraft } from "./content-generator";

const TABLE = "growth_posts";

function resolveSupabaseUrl() {
  const raw = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  )
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/\/rest\/v1.*$/i, "")
    .replace(/\/+$/, "");

  if (!raw) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  }
  if (/^[a-z0-9]{15,}$/i.test(raw) && !raw.includes(".")) {
    return `https://${raw}.supabase.co`;
  }
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

function growthClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }
  return createClient(resolveSupabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function platformLabel(platform: GrowthPlatform) {
  return platform === "linkedin" ? "LinkedIn" : "X";
}

export type GrowthPostRow = {
  id: string;
  persona: string;
  platform: string;
  post_content: string;
  call_to_action: string;
  status: "draft" | "scheduled" | "published";
  created_at: string;
};

export async function saveWeeklyPosts(posts: WeeklyPostDraft[]) {
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error("saveWeeklyPosts requires the array from generateWeeklyPosts().");
  }

  const rows = posts.map((post) => ({
    persona: post.persona,
    platform: platformLabel(post.platform),
    post_content: post.postContent,
    call_to_action: post.callToAction,
    status: "draft" as const,
  }));

  const { data, error } = await growthClient()
    .from(TABLE)
    .insert(rows)
    .select("id,persona,platform,post_content,call_to_action,status,created_at");

  if (error || !data) {
    throw new Error(error?.message || "Unable to save growth posts.");
  }

  return data as GrowthPostRow[];
}
