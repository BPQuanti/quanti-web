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
  done_when?: string | null;
  constraints?: string | null;
  current_bottleneck?: string | null;
};

type DestinationBrief = {
  done_when: string | null;
  constraints: string | null;
  current_bottleneck: string | null;
};

type PhysicsMemory = {
  last_stall_reason?: string;
  last_artifact_noun?: string;
  last_entity_moved?: string;
  last_failed_scope?: string;
};

type DirectiveStruct = {
  lens: "blocker" | "artifact" | "entity_movement";
  physical_action_verb: string;
  concrete_target_noun: string;
  physical_scope_scale: "full" | "scaled_down_50_percent";
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
    miss_reason?: "too_big" | "wrong_move" | "exogenous" | "none";
    primary_directive?: string;
  };
  destination_brief?: DestinationBrief;
  synthesis_mode?: "onboarding" | "daily";
  artifact_retry?: boolean;
  days_on_target?: number | null;
  target_stale?: boolean;
  stall_pattern?: string | null;
  guided_question?: string | null;
  queued_destinations?: string[];
  physics_memory?: PhysicsMemory;
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
  last_directive: string | null;
  synthesis_mode: "onboarding" | "daily";
  artifact_retry: boolean;
  days_on_target: number | null;
  target_stale: boolean;
  stall_pattern: string | null;
  guided_question: string | null;
  queued_destinations: string[];
  physics_memory: PhysicsMemory;
  destination_brief: DestinationBrief;
  miss_reason: "too_big" | "wrong_move" | "exogenous" | "none" | null;
};

const EXTRACT_PROMPT = `You extract ONE physical 1% move for Quanti as JSON only.

Return ONLY:
{
  "lens": "blocker" | "artifact" | "entity_movement",
  "physical_action_verb": string,
  "concrete_target_noun": string,
  "physical_scope_scale": "full" | "scaled_down_50_percent"
}

RULES
- destination.next is the only plot. destination.now is a negative filter, never a second goal.
- queued_destinations are inert. Never pick a noun that would advance one of them.
- concrete_target_noun is a leftover object SMALLER than destination.next (a list of N, a batch of invites, one named file). NEVER restate destination.next. NEVER copy the campaign ("get 100 people to sign up").
- If destination.next contains a number N, today's noun uses a slice (~N/10, max 10) of that unit — never N itself.
- physical_action_verb: Build, Draft, Deploy, Ship, Write, Fix, Send, Call, Schedule, Open, Record, Cut, Print, File, Review, Name.
- First day / empty physics: Name a list of the slice (e.g. Name 10 beta testers). Do not Draft the whole destination.
- If yesterday_outcome is executed: noun MUST differ from last_directive. Advance the leftover (list → send the batch, send → next batch). Same sentence as yesterday is invalid.
- If yesterday_outcome is partial: physical_scope_scale MUST be scaled_down_50_percent. Reuse physics_memory.last_artifact_noun or last_failed_scope. Shrink quantity/size. No new plot. No pep.
- If yesterday_outcome is shifted: scaled_down_50_percent on the same destination.
- guided_question lens mapping: in the way -> blocker; physical artifact -> artifact; who/what must move -> entity_movement.
- Destination Brief is passive context, never a second plot:
  - done_when: terminal condition of the arc. Today's leftover must be checkable against it.
  - constraints: operational bounds. Do not propose a move that breaks them.
  - current_bottleneck: the obstacle the leftover must actually touch.
- Never emit generic cards ("Draft the next section", "make progress", "work on it"). The noun must be a named leftover bound to current_bottleneck and constraints.
- If yesterday miss_reason is too_big: shrink quantity. If wrong_move or exogenous: change the leftover, do NOT shrink the window.
- Ignore journal, vibes, secondary goals, errands.
- crisis_intercept is not your job unless the transcript is crisis; then still return JSON with verb Name and noun "trusted professional".`;

const RENDER_PROMPT = `Write ONE daily directive sentence from the given DirectiveStruct. Output the sentence only.

- 15–20 words. Verb-first. First word = physical_action_verb.
- Include concrete_target_noun. Serve destination.next as the plot, but do NOT paste destination.next as the action.
- If physical_scope_scale is scaled_down_50_percent, cut quantity/size (e.g. 2 items, one slice). Same destination.
- Zero commentary, pep, quotes, markdown, labels.`;

const MAX_DIRECTIVE_WORDS = 20;
const MIN_DIRECTIVE_WORDS = 15;
const ALLOWED_VERBS = [
  "Build",
  "Draft",
  "Deploy",
  "Ship",
  "Write",
  "Fix",
  "Send",
  "Call",
  "Schedule",
  "Open",
  "Record",
  "Cut",
  "Print",
  "File",
  "Review",
  "Name",
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const CRISIS_CARD =
  "Take a step back today. Reach out to a trusted professional or support line.";
const CRISIS_WHY =
  "If you are in immediate danger, contact local emergency services. In the US, call or text 988.";

function looksLikeCrisis(text: string | null) {
  if (!text) {
    return false;
  }
  return /\b(kill myself|killing myself|suicide|suicidal|end my life|want to die|self[- ]harm|hurt myself|cut myself|don'?t want to (?:be alive|live))\b/i.test(
    text,
  );
}

function crisisDirective(input: SynthesizerInput) {
  return {
    primary_directive: CRISIS_CARD,
    recovery_actions: [] as string[],
    focus_block: "",
    focus_blocks: [] as string[],
    voice_prompt: "",
    north_star: input.destination.now || input.destination.next
      ? {
          now: input.destination.now,
          next: input.destination.next || input.destination.now,
          outcomes: [] as string[],
        }
      : undefined,
    why_today: CRISIS_WHY,
    crisis_intercept: true,
    aborted: true,
  };
}

function stripDirectiveText(text: string) {
  let next = text.replace(/\s+/g, " ").trim();
  next = next.replace(/^```(?:json|text)?\s*/i, "").replace(/\s*```$/i, "").trim();
  next = next.replace(/^["'`]+|["'`]+$/g, "").trim();
  next = next.replace(
    /^(you should|you need to|today'?s (?:goal|task|1%|directive) is|here is your task|here'?s your (?:task|directive)|please|try to)\s*[:\-]*\s*/i,
    "",
  );
  return next;
}

function clipWords(text: string, max = MAX_DIRECTIVE_WORDS) {
  const words = stripDirectiveText(text).split(" ").filter(Boolean);
  if (words.length <= max) {
    return words.join(" ");
  }
  return words.slice(0, max).join(" ");
}

function wordCount(text: string) {
  return text.split(" ").filter(Boolean).length;
}

function asOutcome(value: unknown): Outcome | null {
  if (value === "missed") {
    return "shifted";
  }
  return value === "executed" || value === "partial" || value === "shifted" ? value : null;
}

function asPhysics(value: unknown): PhysicsMemory {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const record = value as Record<string, unknown>;
  const next: PhysicsMemory = {};
  for (const key of ["last_stall_reason", "last_artifact_noun", "last_entity_moved", "last_failed_scope"] as const) {
    if (typeof record[key] === "string" && record[key].trim()) {
      next[key] = record[key].replace(/\s+/g, " ").trim().slice(0, key === "last_failed_scope" ? 220 : 120);
    }
  }
  return next;
}

function parseDestination(input: TelemetryPayload): Destination {
  const dest = input.destination && typeof input.destination === "object" ? input.destination : null;
  const brief = {
    done_when: String(input.destination_brief?.done_when || dest?.done_when || "").trim().slice(0, 280) || null,
    constraints: String(input.destination_brief?.constraints || dest?.constraints || "").trim().slice(0, 280) || null,
    current_bottleneck: String(input.destination_brief?.current_bottleneck || dest?.current_bottleneck || input.stall_pattern || "").trim().slice(0, 280) || null,
  };
  if (typeof input.destination === "string" && input.destination.trim()) {
    const text = input.destination.trim();
    const parts = text.split(/\s*->\s*|\s+to\s+/i);
    if (parts.length >= 2) {
      return {
        now: parts[0].trim().slice(0, 280),
        next: parts.slice(1).join(" ").trim().slice(0, 280),
        ...brief,
      };
    }
    return { now: text.slice(0, 280), next: text.slice(0, 280), ...brief };
  }
  const now = String(dest?.now || input.north_star?.now || "").trim().slice(0, 280);
  const next = String(dest?.next || input.north_star?.next || "").trim().slice(0, 280);
  return { now, next: next || now, ...brief };
}

function sanitizePayload(input: TelemetryPayload): SynthesizerInput {
  const transcript = String(
    input.transcript || input.voice_context?.transcript || input.voice?.transcript || "",
  ).trim();
  const healthkit = input.healthkit === true;
  const onboarding = input.synthesis_mode === "onboarding";
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
    yesterday_outcome: onboarding
      ? null
      : asOutcome(input.yesterday_outcome) ?? asOutcome(input.last_execution?.status),
    last_directive: onboarding
      ? null
      : String(input.last_execution?.primary_directive || "").trim().slice(0, 280) || null,
    synthesis_mode: onboarding ? "onboarding" : "daily",
    artifact_retry: input.artifact_retry === true,
    days_on_target: typeof input.days_on_target === "number" && Number.isFinite(input.days_on_target)
      ? Math.max(0, Math.round(input.days_on_target))
      : null,
    target_stale: input.target_stale === true,
    stall_pattern: String(input.stall_pattern || "").trim().slice(0, 280) || null,
    destination_brief: {
      done_when: String(input.destination_brief?.done_when || (typeof input.destination === "object" ? input.destination?.done_when : "") || "").trim().slice(0, 280) || null,
      constraints: String(input.destination_brief?.constraints || (typeof input.destination === "object" ? input.destination?.constraints : "") || "").trim().slice(0, 280) || null,
      current_bottleneck: String(input.destination_brief?.current_bottleneck || (typeof input.destination === "object" ? input.destination?.current_bottleneck : "") || input.stall_pattern || "").trim().slice(0, 280) || null,
    },
    miss_reason:
      input.last_execution?.miss_reason === "too_big" ||
      input.last_execution?.miss_reason === "wrong_move" ||
      input.last_execution?.miss_reason === "exogenous" ||
      input.last_execution?.miss_reason === "none"
        ? input.last_execution.miss_reason
        : null,
    guided_question: String(input.guided_question || "").trim().slice(0, 220) || null,
    queued_destinations: Array.isArray(input.queued_destinations)
      ? input.queued_destinations
          .map((item) => String(item || "").trim())
          .filter(Boolean)
          .slice(0, 12)
      : [],
    physics_memory: asPhysics(input.physics_memory),
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
  if (input.guided_question) {
    return input.guided_question;
  }
  const next = clip(input.destination.next || "where you want to go");
  const stall = clip(input.stall_pattern || input.physics_memory.last_stall_reason || "", 36);

  if (input.yesterday_outcome === "shifted") {
    return stall
      ? `What is in the way of ${next} the same way as ${stall}?`
      : `What is in the way of ${next} today — a person, artifact, or tool?`;
  }
  if (input.yesterday_outcome === "partial") {
    return `What is the next physical artifact toward ${next}? Name one smaller object.`;
  }
  if (input.yesterday_outcome === "executed") {
    return `What named artifact is the next increment toward ${next}?`;
  }
  if (stall) {
    return `What is in the way of ${next} the same way as ${stall}?`;
  }
  return `What is in the way of ${next} today — a person, artifact, or tool?`;
}

function whyForOutcome(input: SynthesizerInput) {
  if (input.yesterday_outcome === "shifted") {
    return "Yesterday shifted. Same destination. Smaller physical scope.";
  }
  if (input.yesterday_outcome === "partial") {
    return "Yesterday was partial. Same destination. Smaller physical scope.";
  }
  if (input.yesterday_outcome === "executed") {
    return "Yesterday executed. Today is the next leftover, not the destination restated.";
  }
  return undefined;
}

function significantTokens(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 4);
}

function mentionsQueued(text: string, queued: string[]) {
  const hay = text.toLowerCase();
  return queued.some((name) => {
    const clipped = name.replace(/\s+/g, " ").trim().toLowerCase();
    if (clipped.length >= 8 && hay.includes(clipped)) {
      return true;
    }
    const tokens = significantTokens(clipped).filter((token) => token.length >= 5);
    return tokens.length > 0 && tokens.every((token) => hay.includes(token));
  });
}

function restatesDestination(text: string, destination: string) {
  const dest = destination.replace(/\s+/g, " ").trim().toLowerCase();
  const hay = text.replace(/\s+/g, " ").trim().toLowerCase();
  if (!dest || dest.length < 8 || !hay) {
    return false;
  }
  if (hay.includes(dest) || (hay.length >= 12 && dest.includes(hay))) {
    return true;
  }
  const destTokens = significantTokens(dest);
  const haySet = new Set(significantTokens(hay));
  if (destTokens.length < 3) {
    return destTokens.length > 0 && destTokens.every((token) => hay.includes(token));
  }
  const hits = destTokens.filter((token) => haySet.has(token) || hay.includes(token)).length;
  return hits / destTokens.length >= 0.7;
}

function sameMove(left: string | null, right: string | null) {
  if (!left?.trim() || !right?.trim()) {
    return false;
  }
  const a = significantTokens(left);
  const b = significantTokens(right);
  if (!a.length || !b.length) {
    return left.replace(/\s+/g, " ").trim().toLowerCase() === right.replace(/\s+/g, " ").trim().toLowerCase();
  }
  const aSet = new Set(a);
  const hits = b.filter((token) => aSet.has(token)).length;
  return hits / Math.max(a.length, b.length) >= 0.75;
}

function campaignSlice(destination: string) {
  const text = destination.replace(/\s+/g, " ").trim();
  const match = text.match(/\b(\d{1,5})\b/);
  const n = match ? Number(match[1]) : 0;
  const count = n >= 50 ? 10 : n >= 20 ? 5 : n >= 5 ? Math.max(1, Math.floor(n / 5)) : n >= 2 ? 1 : 10;
  let unit = "named leftover artifacts";
  if (/\b(tester|beta)\b/i.test(text)) {
    unit = "beta testers";
  } else if (/\binvite/i.test(text)) {
    unit = "invites";
  } else if (/\b(signup|sign[- ]up|user|people|person|customer|client)\b/i.test(text)) {
    unit = "people";
  } else if (/\b(email|message|dm|post)\b/i.test(text)) {
    unit = "messages";
  }
  if (!n) {
    return { count: 1, unit: "named leftover artifact", campaignNumber: null as number | null };
  }
  return { count, unit, campaignNumber: n };
}

function usableArtifact(artifact: string | null | undefined, destination: string) {
  const text = artifact?.replace(/\s+/g, " ").trim() || "";
  if (!text || restatesDestination(text, destination)) {
    return "";
  }
  return text.slice(0, 80);
}

function normalizeVerb(value: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  const first = cleaned.split(" ")[0] || "Draft";
  const titled = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  return ALLOWED_VERBS.includes(titled) ? titled : "Draft";
}

function nounFromMove(text: string) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  return words.slice(1, 7).join(" ") || text.replace(/\s+/g, " ").trim();
}

function scaleNoun(noun: string) {
  const trimmed = nounFromMove(noun.replace(/\s+/g, " ").trim());
  const numbered = trimmed.match(/^(\d+)\s+(.*)$/);
  if (numbered) {
    const half = Math.max(1, Math.floor(Number(numbered[1]) / 2));
    return `${half} ${numbered[2]}`.trim();
  }
  if (/^smaller |^2 |slice|piece/i.test(trimmed)) {
    return trimmed.slice(0, 80);
  }
  return `2 smaller pieces of ${trimmed}`.slice(0, 80);
}

function lensFromQuestion(question: string | null, outcome: Outcome | null): DirectiveStruct["lens"] {
  const text = (question || "").toLowerCase();
  if (outcome === "partial" || text.includes("artifact")) {
    return "artifact";
  }
  if (text.includes("who or what") || text.includes("person")) {
    return "entity_movement";
  }
  return "blocker";
}

function fallbackStruct(input: SynthesizerInput): DirectiveStruct {
  const dest = input.destination.next;
  const slice = campaignSlice(dest);
  const kept = usableArtifact(input.physics_memory.last_artifact_noun, dest);
  const scaled = input.yesterday_outcome === "partial" || input.miss_reason === "too_big";
  if (scaled) {
    const n = Math.max(1, Math.floor(slice.count / 2));
    return {
      lens: "artifact",
      physical_action_verb: "Send",
      concrete_target_noun: kept && !/\d/.test(kept)
        ? `2 smaller pieces of ${kept}`
        : `${n} ${slice.unit} from yesterday’s leftover`,
      physical_scope_scale: "scaled_down_50_percent",
    };
  }
  if (
    input.yesterday_outcome === "shifted" ||
    input.miss_reason === "wrong_move" ||
    input.miss_reason === "exogenous"
  ) {
    return {
      lens: "blocker",
      physical_action_verb: "Name",
      concrete_target_noun: "a different named leftover",
      physical_scope_scale: "full",
    };
  }
  if (input.yesterday_outcome === "executed") {
    return {
      lens: "artifact",
      physical_action_verb: "Send",
      concrete_target_noun: kept
        ? `${slice.count} ${slice.unit} from yesterday’s list`
        : `${slice.count} ${slice.unit} as the next batch`,
      physical_scope_scale: "full",
    };
  }
  return {
    lens: lensFromQuestion(input.guided_question, input.yesterday_outcome),
    physical_action_verb: "Name",
    concrete_target_noun: `${slice.count} ${slice.unit} to invite or move today`,
    physical_scope_scale: "full",
  };
}

function parseStruct(raw: unknown): DirectiveStruct | null {
  let record: Record<string, unknown> | null = null;
  if (typeof raw === "string") {
    const trimmed = stripDirectiveText(raw);
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start < 0 || end <= start) {
      return null;
    }
    try {
      record = JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      return null;
    }
  } else if (raw && typeof raw === "object") {
    record = raw as Record<string, unknown>;
  }
  if (!record) {
    return null;
  }
  const lens =
    record.lens === "artifact" || record.lens === "entity_movement" || record.lens === "blocker"
      ? record.lens
      : null;
  const verb = typeof record.physical_action_verb === "string" ? record.physical_action_verb : "";
  const noun = typeof record.concrete_target_noun === "string" ? record.concrete_target_noun : "";
  const scale =
    record.physical_scope_scale === "scaled_down_50_percent" || record.physical_scope_scale === "full"
      ? record.physical_scope_scale
      : null;
  if (!lens || !verb.trim() || !noun.trim() || !scale) {
    return null;
  }
  return {
    lens,
    physical_action_verb: normalizeVerb(verb),
    concrete_target_noun: noun.replace(/\s+/g, " ").trim().slice(0, 80),
    physical_scope_scale: scale,
  };
}

function enforcePartial(input: SynthesizerInput, struct: DirectiveStruct): DirectiveStruct {
  const next = { ...struct, physical_action_verb: normalizeVerb(struct.physical_action_verb) };
  const shrink = input.yesterday_outcome === "partial" || input.miss_reason === "too_big";
  if (shrink) {
    next.physical_scope_scale = "scaled_down_50_percent";
    next.lens = "artifact";
    const seed =
      input.physics_memory.last_artifact_noun ||
      input.physics_memory.last_failed_scope ||
      input.last_directive ||
      next.concrete_target_noun;
    next.concrete_target_noun = scaleNoun(seed);
  }
  return next;
}

function validateStruct(input: SynthesizerInput, struct: DirectiveStruct): string[] {
  const errors: string[] = [];
  const blob = `${struct.physical_action_verb} ${struct.concrete_target_noun}`;
  if (!struct.concrete_target_noun.trim()) {
    errors.push("missing noun");
  }
  if (mentionsQueued(blob, input.queued_destinations)) {
    errors.push("noun advances a queued destination");
  }
  const dest = input.destination.next;
  const vision = input.destination.now.toLowerCase();
  const noun = struct.concrete_target_noun.toLowerCase();
  if (vision && vision.length >= 8 && noun.includes(vision) && dest && !noun.includes(dest.slice(0, 12).toLowerCase())) {
    errors.push("noun serves North Star instead of Active Destination");
  }
  if (restatesDestination(blob, dest) || restatesDestination(struct.concrete_target_noun, dest)) {
    errors.push("noun restates the destination");
  }
  const slice = campaignSlice(dest);
  if (slice.campaignNumber && new RegExp(`\\b${slice.campaignNumber}\\b`).test(struct.concrete_target_noun)) {
    errors.push("noun uses the full campaign number");
  }
  if (input.yesterday_outcome === "executed" && sameMove(blob, input.last_directive)) {
    errors.push("executed card cannot replay yesterday");
  }
  if (input.yesterday_outcome === "partial" && struct.physical_scope_scale !== "scaled_down_50_percent") {
    errors.push("partial must scale down");
  }
  if (/\b(next section|make progress|work on it|the next step)\b/i.test(blob)) {
    errors.push("generic card");
  }
  return errors;
}

function padDirective(sentence: string, input: SynthesizerInput, struct: DirectiveStruct): string {
  let next = clipWords(sentence);
  while (wordCount(next) < MIN_DIRECTIVE_WORDS) {
    next = `${next} in one sitting then stop`.replace(/\s+/g, " ").trim();
    next = clipWords(next);
    if (struct.physical_scope_scale === "scaled_down_50_percent" && wordCount(next) < MIN_DIRECTIVE_WORDS) {
      next = clipWords(`${next} keep scope small`);
    }
    break;
  }
  if (wordCount(next) < MIN_DIRECTIVE_WORDS) {
    next = clipWords(`${struct.physical_action_verb} ${struct.concrete_target_noun} in one sitting then stop`);
  }
  return next;
}

function renderTemplate(input: SynthesizerInput, struct: DirectiveStruct): string {
  const core =
    struct.physical_scope_scale === "scaled_down_50_percent"
      ? `${struct.physical_action_verb} ${struct.concrete_target_noun} in one sitting then stop`
      : `${struct.physical_action_verb} ${struct.concrete_target_noun} in one sitting today`;
  return padDirective(core, input, struct);
}

function sentenceLegal(input: SynthesizerInput, sentence: string): boolean {
  if (wordCount(sentence) < 8) {
    return false;
  }
  if (mentionsQueued(sentence, input.queued_destinations)) {
    return false;
  }
  if (restatesDestination(sentence, input.destination.next)) {
    return false;
  }
  if (input.yesterday_outcome === "executed" && sameMove(sentence, input.last_directive)) {
    return false;
  }
  return true;
}

async function chatJson(apiKey: string, system: string, user: string, maxTokens: number) {
  const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("LLM_MODEL") || "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!openAiResponse.ok) {
    const errorBody = await openAiResponse.text();
    throw new Error(`OpenAI API error (${openAiResponse.status}): ${errorBody.slice(0, 400)}`);
  }
  const aiData = await openAiResponse.json();
  return String(aiData.choices?.[0]?.message?.content || "");
}

async function chatText(apiKey: string, system: string, user: string, maxTokens: number) {
  const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("LLM_MODEL") || "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!openAiResponse.ok) {
    const errorBody = await openAiResponse.text();
    throw new Error(`OpenAI API error (${openAiResponse.status}): ${errorBody.slice(0, 400)}`);
  }
  const aiData = await openAiResponse.json();
  return String(aiData.choices?.[0]?.message?.content || "");
}

function extractUserPayload(input: SynthesizerInput) {
  return {
    destination: input.destination,
    transcript: input.transcript,
    guided_question: input.guided_question,
    stall_pattern: input.stall_pattern,
    queued_destinations: input.queued_destinations,
    physics_memory: input.physics_memory,
    yesterday_outcome: input.yesterday_outcome,
    miss_reason: input.miss_reason,
    destination_brief: input.destination_brief,
    last_directive: input.last_directive,
    synthesis_mode: input.synthesis_mode,
    artifact_retry: input.artifact_retry,
  };
}

async function extractStruct(apiKey: string, input: SynthesizerInput): Promise<DirectiveStruct> {
  const user = JSON.stringify(extractUserPayload(input));
  try {
    const first = parseStruct(await chatJson(apiKey, EXTRACT_PROMPT, user, 180));
    const candidate = first ? enforcePartial(input, first) : null;
    const firstErrors = candidate ? validateStruct(input, candidate) : ["invalid struct"];
    if (candidate && firstErrors.length === 0) {
      return candidate;
    }
    const retryUser = JSON.stringify({
      ...extractUserPayload(input),
      validation_errors: firstErrors,
      instruction:
        "Fix the struct. Do not restate destination.next. Use a leftover slice (a list or batch), not the campaign. If executed, change the noun from last_directive. Do not use queued names.",
    });
    const second = parseStruct(await chatJson(apiKey, EXTRACT_PROMPT, retryUser, 180));
    const retried = second ? enforcePartial(input, second) : null;
    if (retried && validateStruct(input, retried).length === 0) {
      return retried;
    }
  } catch (caught) {
    console.warn("[synthesize-directive] extract failed", caught);
  }
  return enforcePartial(input, fallbackStruct(input));
}

async function renderSentence(apiKey: string, input: SynthesizerInput, struct: DirectiveStruct): Promise<string> {
  try {
    const raw = await chatText(
      apiKey,
      RENDER_PROMPT,
      JSON.stringify({
        struct,
        destination: input.destination,
      }),
      60,
    );
    const sentence = padDirective(raw, input, struct);
    if (sentenceLegal(input, sentence)) {
      return sentence;
    }
  } catch (caught) {
    console.warn("[synthesize-directive] render failed", caught);
  }
  return renderTemplate(input, struct);
}

type MoveCard = {
  verb: string;
  object: string;
  done_condition: string;
  card_text: string;
};

type Triplets = {
  contracted: MoveCard;
  baseline: MoveCard;
  expanded: MoveCard;
};

function bumpCount(noun: string, factor: number) {
  const numbered = noun.match(/^(\d+)\s+(.*)$/);
  if (numbered) {
    const next = Math.max(1, Math.round(Number(numbered[1]) * factor));
    return `${next} ${numbered[2]}`.trim();
  }
  if (factor < 1) {
    return `2 smaller pieces of ${noun}`.slice(0, 80);
  }
  return noun.slice(0, 80);
}

function cardFrom(verb: string, object: string, until: string): MoveCard {
  const done = until.startsWith("until ") ? until : `until ${until}`;
  let text = `${verb} ${object} ${done} in one sitting then stop`;
  text = clipWords(text);
  if (wordCount(text) < MIN_DIRECTIVE_WORDS) {
    text = clipWords(`${text} keep leftover named`);
  }
  return {
    verb,
    object,
    done_condition: done,
    card_text: text,
  };
}

function templateTriplets(input: SynthesizerInput, struct: DirectiveStruct): Triplets {
  const verb = struct.physical_action_verb;
  const noun = struct.concrete_target_noun;
  return {
    contracted: cardFrom(verb, bumpCount(noun, 0.5), "that smaller leftover is done"),
    baseline: cardFrom(verb, noun, "that leftover is done"),
    expanded: cardFrom(verb, bumpCount(noun, 1.2), "the extra leftover is done"),
  };
}

function packDirective(input: SynthesizerInput, sentence: string, struct: DirectiveStruct, triplets: Triplets) {
  return {
    primary_directive: sentence,
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
    why_today: whyForOutcome(input),
    crisis_intercept: false,
    aborted: false,
    directive_struct: struct,
    triplets,
    selected_window: "baseline",
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

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    const rawPayload = ((body as { payload?: TelemetryPayload }).payload ?? body) as TelemetryPayload;
    const payload = sanitizePayload(rawPayload);
    console.log("[synthesize-directive] extract-then-write", {
      user_id: user.id,
      destination: payload.destination,
      has_transcript: Boolean(payload.transcript),
      yesterday_outcome: payload.yesterday_outcome,
      physics_memory: payload.physics_memory,
    });

    if (looksLikeCrisis(payload.transcript)) {
      console.log("[synthesize-directive] crisis intercept", { user_id: user.id });
      return jsonResponse({
        ...crisisDirective(payload),
        source: "edge",
      });
    }

    const struct = await extractStruct(apiKey, payload);
    const errors = validateStruct(payload, struct);
    let safeStruct = errors.length ? enforcePartial(payload, fallbackStruct(payload)) : struct;
    if (validateStruct(payload, safeStruct).length) {
      safeStruct = fallbackStruct(payload);
    }
    const triplets = templateTriplets(payload, safeStruct);
    let sentence = triplets.baseline.card_text;
    if (!sentenceLegal(payload, sentence)) {
      const fallback = fallbackStruct(payload);
      const fallbackTriplets = templateTriplets(payload, fallback);
      sentence = fallbackTriplets.baseline.card_text;
      const directiveContent = packDirective(payload, sentence, fallback, fallbackTriplets);
      console.log("[synthesize-directive] structured directive", {
        struct: fallback,
        validation_errors: errors,
        primary_directive: directiveContent.primary_directive,
        triplets: fallbackTriplets,
      });
      return jsonResponse({
        ...directiveContent,
        source: "edge",
      });
    }
    const directiveContent = packDirective(payload, sentence, safeStruct, triplets);
    console.log("[synthesize-directive] structured directive", {
      struct: safeStruct,
      validation_errors: errors,
      primary_directive: directiveContent.primary_directive,
      triplets,
    });

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
