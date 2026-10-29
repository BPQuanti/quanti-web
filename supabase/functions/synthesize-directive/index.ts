import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Outcome = "executed" | "partial" | "shifted";

type Destination = {
  now: string;
  next: string;
};

type TelemetryPayload = {
  schema_version?: number;
  session_id?: string;
  user_id?: string | null;
  local_date?: string;
  destination?: Destination | string;
  transcript?: string | null;
  yesterday_outcome?: Outcome;
  north_star?: {
    now?: string;
    next?: string;
    outcomes?: string[];
  };
  healthkit?: boolean;
  biometrics?: {
    hrv_delta_percent?: number | null;
    sleep_hours?: number | null;
    recovery_score?: number | null;
  };
  voice?: {
    transcript?: string | null;
    duration_seconds?: number | null;
    has_voice?: boolean;
  };
  voice_context?: {
    transcript?: string;
    recorded_at?: string;
  };
  last_execution?: {
    date?: string;
    status?: Outcome;
    primary_directive?: string;
  };
};

type SynthesizerInput = {
  destination: Destination;
  transcript: string | null;
  healthkit: boolean;
  biometrics: {
    sleep_hours: number | null;
    hrv_delta_percent: number | null;
    recovery_score: number | null;
  };
  yesterday_outcome: Outcome | null;
};

const SYSTEM_PROMPT = `You are Quanti's Daily Synthesizer. Write ONE 1% action for today.

INPUTS (only these — do not classify arcs, seasons, or posture)
- destination: immutable. now = where they are. next = where they are going. Never change or replace it.
- transcript: morning weather (10–15s). Use it to name the object, blocker, or next physical move. Not a new destination.
- biometrics: sleep hours, HRV delta, recovery. Scope only. Not the plot.
- healthkit: false = ignore biometrics; use a normal window. Do not invent recovery problems.
- yesterday_outcome: executed | partial | shifted | null.

primary_directive — STRICT
- 15–20 words max. Zero markdown. Zero preambles. No quotes, bullets, or labels.
- ALWAYS a concrete, physical action tied to destination.next AND the transcript (named object, file, message, place, person, or clock time).
- NEVER generic advice: "Take 1 small step", "Take 1 small action toward", "Focus on your goals", "Protect your energy", "Honor your energy", "Cut noise", "Stay consistent", pep talks.
- NEVER output an arc, season, posture, or inferred category. Use destination + transcript + biometrics + yesterday_outcome only.

SCOPE (telemetry + mark only)
- Low recovery (healthkit true: short sleep, HRV down, recovery < 40) OR yesterday shifted/partial → micro-step. Example: "Draft just the first 3 lines of your email invite before 10 AM."
- High recovery (healthkit true) AND yesterday executed → high-leverage execution. Example: "Deploy the full Supabase auth function and test all JWT tokens today."
- healthkit false and no mark → normal named 1% from destination + transcript, not a recovery sermon.
- Partial: finish the leftover named piece, then stop. Do not stack a new plot.

why_today — one sentence naming the constraint (mark and/or recovery). Empty string if neither applies.

OUTPUT valid JSON exactly:
{"primary_directive":"string","why_today":"string"}`;

const MAX_DIRECTIVE_WORDS = 20;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clipWords(text: string, max = MAX_DIRECTIVE_WORDS) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length <= max) {
    return words.join(" ");
  }
  return words.slice(0, max).join(" ");
}

function asOutcome(value: unknown): Outcome | null {
  return value === "executed" || value === "partial" || value === "shifted" ? value : null;
}

function parseDestination(input: TelemetryPayload): Destination {
  if (typeof input.destination === "string" && input.destination.trim()) {
    const text = input.destination.trim();
    const parts = text.split(/\s*->\s*|\s+to\s+/i);
    if (parts.length >= 2) {
      return {
        now: parts[0].trim().slice(0, 280),
        next: parts.slice(1).join(" ").trim().slice(0, 280),
      };
    }
    return { now: text.slice(0, 280), next: text.slice(0, 280) };
  }
  const dest = input.destination && typeof input.destination === "object" ? input.destination : null;
  const now = String(dest?.now || input.north_star?.now || "").trim().slice(0, 280);
  const next = String(dest?.next || input.north_star?.next || "").trim().slice(0, 280);
  return { now, next: next || now };
}

function sanitizePayload(input: TelemetryPayload, userId: string): SynthesizerInput {
  const transcript = String(
    input.transcript || input.voice_context?.transcript || input.voice?.transcript || "",
  ).trim();
  const healthkit = input.healthkit === true;
  return {
    destination: parseDestination(input),
    transcript: transcript ? transcript.slice(0, 600) : null,
    healthkit,
    biometrics: healthkit
      ? {
          sleep_hours: input.biometrics?.sleep_hours ?? null,
          hrv_delta_percent: input.biometrics?.hrv_delta_percent ?? null,
          recovery_score: input.biometrics?.recovery_score ?? null,
        }
      : { sleep_hours: 7, hrv_delta_percent: 0, recovery_score: 55 },
    yesterday_outcome: asOutcome(input.yesterday_outcome) ?? asOutcome(input.last_execution?.status),
  };
}

function clip(text: string, max = 40) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) {
    return cleaned;
  }
  return `${cleaned.slice(0, max - 3).trim()}…`;
}

function voiceCheckPrompt(input: SynthesizerInput): string {
  const next = clip(input.destination.next || "where you want to go");
  const sleep = input.biometrics.sleep_hours;
  const hrv = input.biometrics.hrv_delta_percent;
  const recovery = input.biometrics.recovery_score;
  const low =
    input.healthkit &&
    ((sleep != null && sleep < 6) || (hrv != null && hrv <= -12) || (recovery != null && recovery < 40));
  const high =
    input.healthkit &&
    ((sleep != null && sleep >= 7.5) || (hrv != null && hrv >= 8) || (recovery != null && recovery >= 70));

  if (input.yesterday_outcome === "shifted") {
    return "What actually blocked yesterday’s 1% — people, energy, or a missing object?";
  }
  if (input.yesterday_outcome === "partial") {
    return "What leftover piece is still unfinished? Name the object.";
  }
  if (input.yesterday_outcome === "executed") {
    return `What is the next named increment toward ${next}?`;
  }
  if (!input.destination.next || input.destination.next.length < 8) {
    return "Name one object that would count as progress toward where you want to go.";
  }
  if (low) {
    return "Does your body match last night’s recovery, or is the number wrong?";
  }
  if (high) {
    return `Where will the day steal the one window toward ${next}?`;
  }
  if (!input.transcript) {
    return `Name the object toward ${next}: listing, email, file, or ask.`;
  }
  return `What will try to steal today’s 1% toward ${next}?`;
}

function parseDirective(content: unknown, input: SynthesizerInput) {
  const parsed = typeof content === "string" ? JSON.parse(content) : content;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Model returned invalid JSON");
  }
  const record = parsed as {
    primary_directive?: unknown;
    why_today?: unknown;
  };
  if (typeof record.primary_directive !== "string" || !record.primary_directive.trim()) {
    throw new Error("Model omitted primary_directive");
  }
  const why =
    typeof record.why_today === "string" && record.why_today.trim()
      ? record.why_today.trim().slice(0, 220)
      : "";
  return {
    primary_directive: clipWords(record.primary_directive.trim()),
    recovery_actions: [] as string[],
    focus_block: "",
    focus_blocks: [] as string[],
    voice_prompt: voiceCheckPrompt(input),
    north_star: input.destination.now || input.destination.next
      ? {
          now: input.destination.now,
          next: input.destination.next || input.destination.now,
          outcomes: [] as string[],
        }
      : undefined,
    why_today: why || undefined,
  };
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
    if (!token) {
      return jsonResponse({ error: "Unauthorized user token" }, 401);
    }

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
    const rawPayload = (body?.payload ?? body) as TelemetryPayload;
    const payload = sanitizePayload(rawPayload, user.id);
    console.log("[synthesize-directive] daily synthesizer", {
      user_id: user.id,
      destination: payload.destination,
      has_transcript: Boolean(payload.transcript),
      biometrics: payload.biometrics,
      yesterday_outcome: payload.yesterday_outcome,
    });

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("LLM_MODEL") || "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(payload) },
        ],
      }),
    });

    if (!openAiResponse.ok) {
      const errorBody = await openAiResponse.text();
      console.error("[synthesize-directive] OpenAI error", openAiResponse.status, errorBody);
      throw new Error(`OpenAI API error (${openAiResponse.status}): ${errorBody.slice(0, 400)}`);
    }

    const aiData = await openAiResponse.json();
    const directiveContent = parseDirective(aiData.choices?.[0]?.message?.content, payload);
    console.log("[synthesize-directive] gpt-4o-mini directive", directiveContent);

    return jsonResponse({
      ...directiveContent,
      source: "edge",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[synthesize-directive] failed", message);
    return jsonResponse({ error: message || "Internal server error" }, 500);
  }
});
