const XAI_CHAT_URL = "https://api.x.ai/v1/chat/completions";
const WAITLIST_URL = "https://quanti-app.com";

export const GROWTH_PERSONAS = [
  "Biohackers & Quantified-Self",
  "Founders & Executives",
  "Deep Work Engineers",
] as const;

export const GROWTH_PLATFORMS = ["linkedin", "x"] as const;

export type GrowthPersona = (typeof GROWTH_PERSONAS)[number];
export type GrowthPlatform = (typeof GROWTH_PLATFORMS)[number];

export type WeeklyPostDraft = {
  persona: GrowthPersona;
  platform: GrowthPlatform;
  postContent: string;
  callToAction: string;
};

const PERSONA_BRIEF: Record<GrowthPersona, string> = {
  "Biohackers & Quantified-Self":
    "Oura/WHOOP/HealthKit users who already wear the stack. They hate turning recovery data into another spreadsheet. Quanti turns sleep, strain, and Screen Time into one Daily Focus Card with zero logging.",
  "Founders & Executives":
    "Operators drowning in decision fatigue. Bank + calendar + health already exist as telemetry. Quanti gives one high-leverage move for the morning instead of 40 charts.",
  "Deep Work Engineers":
    "Builders who track focus in Notion/Sheets by hand. Quanti kills the manual log: Screen Time, HealthKit, and Plaid spend become one Focus Directive.",
};

function xaiApiKey() {
  return process.env.XAI_API_KEY || process.env.GROK_API_KEY || "";
}

function xaiModel() {
  return process.env.XAI_MODEL || "grok-3";
}

function extractJson(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] || trimmed).trim();
}

function isPersona(value: string): value is GrowthPersona {
  return (GROWTH_PERSONAS as readonly string[]).includes(value);
}

function isPlatform(value: string): value is GrowthPlatform {
  return (GROWTH_PLATFORMS as readonly string[]).includes(value);
}

function normalizeDrafts(value: unknown): WeeklyPostDraft[] {
  const rows = Array.isArray(value) ? value : Array.isArray((value as { posts?: unknown })?.posts)
    ? (value as { posts: unknown[] }).posts
    : [];

  const drafts = rows.flatMap((row) => {
    if (!row || typeof row !== "object") {
      return [];
    }
    const item = row as Record<string, unknown>;
    const persona = String(item.persona || "");
    const platform = String(item.platform || "").toLowerCase();
    const postContent = String(item.postContent || item.content || "").trim();
    const callToAction = String(item.callToAction || item.cta || "").trim();
    if (!isPersona(persona) || !isPlatform(platform) || !postContent) {
      return [];
    }
    return [
      {
        persona,
        platform,
        postContent,
        callToAction: callToAction || `Closed TestFlight waitlist: ${WAITLIST_URL}`,
      } satisfies WeeklyPostDraft,
    ];
  });

  if (drafts.length < 5) {
    throw new Error("Grok returned fewer than 5 usable post drafts.");
  }

  return drafts.slice(0, 5);
}

function buildPrompt() {
  return `You are drafting a week's social posts for Quanti (quanti-app.com).

Quanti is an anti-homework GPS for your day. It links passive telemetry — Apple HealthKit, Screen Time, and Plaid spend — into ONE Daily Focus Card. Zero manual logging. Not another dashboard. Not a habit chart.

Write exactly 5 distinct, high-impact post drafts. Cover all 3 personas at least once:
1. ${GROWTH_PERSONAS[0]} — ${PERSONA_BRIEF[GROWTH_PERSONAS[0]]}
2. ${GROWTH_PERSONAS[1]} — ${PERSONA_BRIEF[GROWTH_PERSONAS[1]]}
3. ${GROWTH_PERSONAS[2]} — ${PERSONA_BRIEF[GROWTH_PERSONAS[2]]}

Mix platforms: some "linkedin", some "x". LinkedIn can be slightly longer (still tight). X must be punchy.

Rules:
- Tone: concise, sharp, high-signal. No hype, no emoji spam, no "game-changer", no "I'm thrilled to announce".
- Core value in every post: passive telemetry → one Daily Focus Card, 0 manual logging.
- CTA is subtle and non-salesy: invite people to the closed TestFlight waitlist at ${WAITLIST_URL}. Do not use "Sign up now!!" or discount language.
- Do not invent features (no AI chat, no trading, no social feed).
- Return JSON only.

JSON shape:
{
  "posts": [
    {
      "persona": "${GROWTH_PERSONAS[0]}" | "${GROWTH_PERSONAS[1]}" | "${GROWTH_PERSONAS[2]}",
      "platform": "linkedin" | "x",
      "postContent": "the post body only, no CTA URL dump if you split it",
      "callToAction": "one quiet line pointing to the closed TestFlight waitlist at ${WAITLIST_URL}"
    }
  ]
}`;
}

export async function generateWeeklyPosts(): Promise<WeeklyPostDraft[]> {
  const apiKey = xaiApiKey();
  if (!apiKey) {
    throw new Error("XAI_API_KEY is not set.");
  }

  const response = await fetch(XAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: xaiModel(),
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You write high-signal founder social copy. You only output valid JSON.",
        },
        { role: "user", content: buildPrompt() },
      ],
    }),
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || `xAI request failed (${response.status}).`);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("xAI returned an empty draft payload.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(content));
  } catch {
    throw new Error("xAI returned JSON that could not be parsed.");
  }

  return normalizeDrafts(parsed);
}
