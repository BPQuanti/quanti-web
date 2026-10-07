import fs from "fs";
import path from "path";
import { Resend } from "resend";
import { getWelcomeEmailHtml } from "../src/lib/email/templates";

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

  const result = await resend.emails.send({
    from: process.env.WAITLIST_FROM_EMAIL as string,
    to,
    subject: "You're on the Quanti waitlist",
    html: getWelcomeEmailHtml({
      userEmail: to,
      currentRank: 42,
      referralCode: "OGTEST",
      isTop500: true,
    }),
  });

  console.log(JSON.stringify(result, null, 2));
  if (result.error) {
    process.exit(1);
  }
}

void main();
