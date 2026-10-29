import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized user token" }, 401);
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("LLM_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "Server misconfiguration: API key missing" }, 500);
    }

    const body = await req.json();
    const audioBase64 = typeof body?.audio_base64 === "string" ? body.audio_base64 : "";
    if (!audioBase64) {
      return jsonResponse({ error: "audio_base64 is required" }, 400);
    }

    const filename = typeof body?.filename === "string" && body.filename.trim()
      ? body.filename.trim()
      : "voice-checkin.m4a";
    const mimeType = typeof body?.mime_type === "string" && body.mime_type.trim()
      ? body.mime_type.trim()
      : "audio/m4a";

    const bytes = decodeBase64(audioBase64);
    console.log("[transcribe-voice] received audio", {
      user_id: user.id,
      bytes: bytes.byteLength,
      filename,
      mimeType,
    });

    const form = new FormData();
    form.append("file", new Blob([bytes], { type: mimeType }), filename);
    form.append("model", "whisper-1");
    form.append("response_format", "json");

    const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    const whisperPayload = await whisperResponse.json().catch(() => ({}));
    if (!whisperResponse.ok) {
      const detail = typeof whisperPayload?.error?.message === "string"
        ? whisperPayload.error.message
        : JSON.stringify(whisperPayload);
      console.error("[transcribe-voice] Whisper error", whisperResponse.status, detail);
      return jsonResponse({ error: `Whisper API error (${whisperResponse.status}): ${detail}` }, 502);
    }

    const transcript = typeof whisperPayload?.text === "string" ? whisperPayload.text.trim() : "";
    if (!transcript) {
      return jsonResponse({ error: "Whisper returned an empty transcript" }, 502);
    }

    console.log("[transcribe-voice] transcript", transcript.slice(0, 200));
    return jsonResponse({ transcript, source: "whisper-1" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[transcribe-voice] failed", message);
    return jsonResponse({ error: message || "Internal server error" }, 500);
  }
});
