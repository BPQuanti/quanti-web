import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

type OutreachTarget = {
  id: string;
  name: string | null;
  job_title_bio: string | null;
  connection_type: string | null;
  status: string | null;
};

const SYSTEM_PROMPT = `You are a founder drafting a short, natural outreach message on LinkedIn for Quanti (quanti-app.com) — a privacy-first destination GPS. You name where you are and where you want to go. Overnight signals size the window. A 15-second check fills one blank. Yesterday’s mark writes tomorrow. One 1% daily directive plus smart friction (never forced app locks).
Goal: Ask for their raw, genuine perspective on the concept to gain interest and waitlist signups without sounding salesy, pushy, or spammy.
Rules:
- Max 3 short sentences.
- No sales jargon ('game-changer', 'revolutionary', 'target market').
- Reference their bio/work naturally in line 1.
- End with a low-friction feedback request on the site concept.
- If connection_type is 'out_of_network', write it naturally as a short note for a connection request.`;

function stripQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function applyEnvFile(envPath: string) {
  if (!fs.existsSync(envPath)) {
    return false;
  }

  const text = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    const value = stripQuotes(match[2].trim());
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
  return true;
}

function loadLocalEnv() {
  const candidates = [
    path.join(scriptDir, "..", ".env.local"),
    path.join(scriptDir, "..", "..", ".env.local"),
    path.join(process.cwd(), ".env.local"),
  ];

  const loaded = [...new Set(candidates)].filter((envPath) => applyEnvFile(envPath));
  if (loaded.length > 0) {
    console.log(`Loaded env from: ${loaded.join(", ")}`);
  }
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildUserPrompt(target: OutreachTarget) {
  return [
    `Name: ${target.name ?? "Unknown"}`,
    `Job title / bio: ${target.job_title_bio ?? "Not provided"}`,
    `Connection type: ${target.connection_type ?? "unknown"}`,
    "",
    "Draft the outreach message now.",
  ].join("\n");
}

async function main() {
  loadLocalEnv();

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const openaiKey = requireEnv("OPENAI_API_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const openai = new OpenAI({ apiKey: openaiKey });

  console.log("Fetching outreach targets with status=needs_draft (limit 15)...");

  const { data, error } = await supabase
    .from("outreach_targets")
    .select("id, name, job_title_bio, connection_type, status")
    .eq("status", "needs_draft")
    .limit(15);

  if (error) {
    throw new Error(`Failed to query outreach_targets: ${error.message}`);
  }

  const targets = (data ?? []) as OutreachTarget[];
  if (targets.length === 0) {
    console.log("No outreach targets need drafts.");
    return;
  }

  console.log(`Generating drafts for ${targets.length} target(s).`);

  let succeeded = 0;
  let failed = 0;

  for (const [index, target] of targets.entries()) {
    const label = `${index + 1}/${targets.length} ${target.name ?? target.id}`;
    try {
      console.log(`[${label}] Calling gpt-4o-mini...`);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(target) },
        ],
        temperature: 0.7,
      });

      const draft = completion.choices[0]?.message?.content?.trim();
      if (!draft) {
        throw new Error("OpenAI returned an empty draft");
      }

      const { error: updateError } = await supabase
        .from("outreach_targets")
        .update({
          generated_draft: draft,
          status: "ready_for_review",
        })
        .eq("id", target.id);

      if (updateError) {
        throw new Error(`Supabase update failed: ${updateError.message}`);
      }

      succeeded += 1;
      console.log(`[${label}] Saved draft (${draft.length} chars).`);
    } catch (err) {
      failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${label}] Failed: ${message}`);
    }
  }

  console.log(`Done. ${succeeded} draft(s) ready for review, ${failed} failed.`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`generate-drafts failed: ${message}`);
  process.exit(1);
});
