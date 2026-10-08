import fs from "fs";
import path from "path";
import { Resend } from "resend";
import {
  getWelcomeEmailHtml,
  getWelcomeEmailSubject,
  getWelcomeEmailText,
} from "../src/lib/email/templates";

const envPath = path.join(process.cwd(), ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const index = trimmed.indexOf("=");
  if (index > 0) {
    process.env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim();
  }
}

async function main() {
  const to = "brianalan21@gmail.com";
  const resend = new Resend(process.env.RESEND_API_KEY);

  const payload = {
    userEmail: to,
    currentRank: 42,
    referralCode: "OGTEST",
    isTop500: true,
  };
  const from = process.env.WAITLIST_FROM_EMAIL as string;
  const result = await resend.emails.send({
    from,
    to,
    replyTo: from.match(/<([^>]+)>/)?.[1] || from,
    subject: getWelcomeEmailSubject(payload.currentRank),
    html: getWelcomeEmailHtml(payload),
    text: getWelcomeEmailText(payload),
  });

  console.log(JSON.stringify(result, null, 2));
  if (result.error) {
    process.exit(1);
  }
}

void main();
