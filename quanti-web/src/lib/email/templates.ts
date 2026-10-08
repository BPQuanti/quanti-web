import { waitlistShareUrl } from "@/lib/waitlist/publicUrl";

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getWelcomeEmailSubject(currentRank: number) {
  return `You're on the list for Quanti 🎯 [Spot #${currentRank}]`;
}

export function getWelcomeEmailHtml({
  userEmail,
  currentRank,
  referralCode,
  isTop500,
}: {
  userEmail: string;
  currentRank: number;
  referralCode: string;
  isTop500: boolean;
}) {
  const referralUrl = waitlistShareUrl(referralCode);
  const spot = escapeHtml(String(currentRank));
  const ogNote = isTop500
    ? "You are inside the first 500 — reply BETA below to request TestFlight access and lock OG Founder pricing."
    : "The first 500 waitlist members lock $49/yr OG Founder pricing. Reply BETA if you want in on the first TestFlight wave.";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${escapeHtml(getWelcomeEmailSubject(currentRank))}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0a0a0a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0a0a0a;width:100%;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background-color:#111111;border:1px solid #8b5cf6;border-radius:20px;">
            <tr>
              <td style="padding:28px 24px 32px;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8b5cf6;">Quanti Waitlist</p>
                <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#ffffff;">You're on the list.</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#e4e4e7;">
                  Thanks for joining, ${escapeHtml(userEmail)}. Your official waitlist position is
                  <strong style="color:#ffffff;">#${spot}</strong>.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
                  <tr>
                    <td style="background-color:#1a1028;border:1px solid #8b5cf6;border-radius:16px;padding:20px;text-align:center;">
                      <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#a78bfa;">Official Spot</p>
                      <p style="margin:0;font-size:36px;line-height:1;font-weight:700;color:#ffffff;">#${spot}</p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#d4d4d8;">
                  Most apps are a <strong style="color:#ffffff;">Mirror</strong>: they show you charts of the past and leave you to guess what to do next.
                  Quanti is a <strong style="color:#ffffff;">GPS</strong>: one daily directive from your money, health, and habits so you always know the next right move.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
                  <tr>
                    <td style="background-color:#0a0a0a;border:1px solid #8b5cf6;border-radius:16px;padding:20px;">
                      <p style="margin:0 0 14px;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#8b5cf6;">Roadmap</p>
                      <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#d4d4d8;">
                        <strong style="color:#ffffff;">1. Private TestFlight Beta</strong> — first 500 testers get the Action-First Engine on iOS.
                      </p>
                      <p style="margin:0;font-size:14px;line-height:1.7;color:#d4d4d8;">
                        <strong style="color:#ffffff;">2. App Store Launch</strong> — public release after the beta hardens the daily GPS.
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#ffffff;font-weight:700;">$49/yr OG Founder pricing</p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#d4d4d8;">
                  The first 500 waitlist members lock in <strong style="color:#ffffff;">$49/yr OG Founder</strong> pricing for life.
                  ${escapeHtml(ogNote)}
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="background-color:#1a1028;border:1px solid #34d399;border-radius:16px;padding:20px;">
                      <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#34d399;">Want TestFlight?</p>
                      <p style="margin:0;font-size:14px;line-height:1.7;color:#d4d4d8;">
                        Reply to this email with <strong style="color:#ffffff;">BETA</strong> if you want to join the first 500 TestFlight testers.
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8b5cf6;">Share your unique link</p>
                <p style="margin:0 0 16px;padding:14px 16px;background-color:#0a0a0a;border:1px solid #3f3f46;border-radius:12px;font-size:13px;line-height:1.5;color:#ffffff;word-break:break-all;">
                  ${escapeHtml(referralUrl)}
                </p>

                <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#71717a;">
                  © ${new Date().getFullYear()} Quanti Technologies LLC. All rights reserved.
                </p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;">
                  <a href="https://quanti-app.com" style="color:#8b5cf6;text-decoration:none;">quanti-app.com</a>
                  &nbsp;·&nbsp;
                  <a href="https://quanti-app.com/privacy" style="color:#8b5cf6;text-decoration:none;">Privacy</a>
                  &nbsp;·&nbsp;
                  <a href="https://quanti-app.com/terms" style="color:#8b5cf6;text-decoration:none;">Terms</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function getWelcomeEmailText({
  userEmail,
  currentRank,
  referralCode,
  isTop500,
}: {
  userEmail: string;
  currentRank: number;
  referralCode: string;
  isTop500: boolean;
}) {
  const referralUrl = waitlistShareUrl(referralCode);
  const ogNote = isTop500
    ? "You are inside the first 500 — reply BETA to request TestFlight access and lock OG Founder pricing."
    : "The first 500 waitlist members lock $49/yr OG Founder pricing. Reply BETA if you want in on the first TestFlight wave.";

  return [
    `Thanks for joining, ${userEmail}. Your official waitlist position is #${currentRank}.`,
    "",
    "Most apps are a Mirror: they show you charts of the past and leave you to guess what to do next.",
    "Quanti is a GPS: one daily directive from your money, health, and habits so you always know the next right move.",
    "",
    "Roadmap:",
    "1. Private TestFlight Beta — first 500 testers get the Action-First Engine on iOS.",
    "2. App Store Launch — public release after the beta hardens the daily GPS.",
    "",
    "$49/yr OG Founder pricing: the first 500 waitlist members lock this rate for life.",
    ogNote,
    "",
    'Want TestFlight? Reply to this email with "BETA" if you want to join the first 500 TestFlight testers.',
    "",
    `Share your unique link: ${referralUrl}`,
    "",
    "quanti-app.com",
  ].join("\n");
}
