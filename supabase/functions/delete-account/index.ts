import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const USER_TABLES = ["plaid_items", "ai_chat_history", "saved_stats", "recaps", "health_daily"];

function plaidHost() {
  const env = (Deno.env.get("PLAID_ENV") || "sandbox").toLowerCase();
  if (env === "production") return "https://production.plaid.com";
  if (env === "development") return "https://development.plaid.com";
  return "https://sandbox.plaid.com";
}

function bytesFromBase64Url(value: string) {
  const pad = (4 - (value.length % 4)) % 4;
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function decryptToken(payload: string) {
  const [version, ivPart, tagPart, dataPart] = payload.split(".");
  if (version !== "v1" || !ivPart || !tagPart || !dataPart) {
    throw new Error("Unrecognized token ciphertext.");
  }
  const rawKey = Deno.env.get("TOKEN_ENCRYPTION_KEY") || "";
  const keyBytes = Uint8Array.from(atob(rawKey), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);
  const iv = bytesFromBase64Url(ivPart);
  const tag = bytesFromBase64Url(tagPart);
  const data = bytesFromBase64Url(dataPart);
  const combined = new Uint8Array(data.length + tag.length);
  combined.set(data, 0);
  combined.set(tag, data.length);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, combined);
  return new TextDecoder().decode(plain);
}

async function revokePlaidItem(accessToken: string) {
  const response = await fetch(`${plaidHost()}/item/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: Deno.env.get("PLAID_CLIENT_ID"),
      secret: Deno.env.get("PLAID_SECRET"),
      access_token: accessToken,
    }),
  });
  if (response.ok) {
    return;
  }
  const payload = await response.json().catch(() => null);
  if (payload?.error_code === "ITEM_NOT_FOUND" || payload?.error_code === "INVALID_ACCESS_TOKEN") {
    return;
  }
  throw new Error("Plaid did not revoke the bank connection.");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, message: "Sign in is required." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authError } = await userClient.auth.getUser();
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ success: false, message: "Sign in is required." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: items } = await admin
      .from("plaid_items")
      .select("access_token")
      .eq("user_id", userData.user.id);

    for (const item of items || []) {
      const stored = item.access_token as string | null;
      if (!stored) continue;
      const accessToken = stored.startsWith("v1.") ? await decryptToken(stored) : stored;
      await revokePlaidItem(accessToken);
    }

    for (const table of USER_TABLES) {
      await admin.from(table).delete().eq("user_id", userData.user.id);
    }
    await admin.from("profiles").delete().eq("id", userData.user.id);
    const { error: deleteError } = await admin.auth.admin.deleteUser(userData.user.id);
    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account and associated data completely purged.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Account deletion failed.";
    return new Response(JSON.stringify({ success: false, message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
