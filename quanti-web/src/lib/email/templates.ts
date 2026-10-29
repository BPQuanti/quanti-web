import { waitlistShareUrl } from "@/lib/waitlist/publicUrl";

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getWelcomeEmailSubject(_currentRank: number) {
  return "You're on the list for Quanti [Early Access Queue]";
}

export function getWelcomeEmailHtml({
  referralCode,
}: {
  userEmail: string;
  currentRank: number;
  referralCode: string;
  isTop500: boolean;
}) {
  const referralUrl = waitlistShareUrl(referralCode);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${escapeHtml(getWelcomeEmailSubject(0))}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0b0712;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0712;width:100%;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background-color:#0f172a;border:1px solid #1e293b;border-radius:24px;">
            <tr>
              <td style="padding:32px 28px 36px;font-family:Arial,Helvetica,sans-serif;color:#f8fafc;">
                <p style="margin:0 0 20px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a5b4fc;">Quanti</p>
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:600;color:#f8fafc;">Welcome to the Quanti waitlist.</h1>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#94a3b8;">
                  Most tools show graphs after the fact. Quanti is a destination GPS: you name where you are and where you want to go.
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#94a3b8;">
                  Overnight signals only size how hard today can go. A 15-second check fills one blank. Yesterday’s mark writes tomorrow. You get one 1% move—not a season, streak, or dashboard.
                </p>
                <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#94a3b8;">
                  Your referral link to skip the line:
                </p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#818cf8;word-break:break-all;">
                  <a href="${escapeHtml(referralUrl)}" style="color:#818cf8;text-decoration:none;">${escapeHtml(referralUrl)}</a>
                </p>
                <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#94a3b8;">
                  Share with 3 friends to unlock early beta access and direct founder feedback.
                </p>
                <p style="margin:0 0 4px;font-size:15px;line-height:1.6;color:#f8fafc;">The Quanti Team</p>
                  <p style="margin:0 0 28px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">Privacy-first destination GPS</p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                  <a href="https://quanti-app.com" style="color:#818cf8;text-decoration:none;">quanti-app.com</a>
                  &nbsp;·&nbsp;
                  <a href="https://quanti-app.com/privacy" style="color:#818cf8;text-decoration:none;">Privacy</a>
                  &nbsp;·&nbsp;
                  <a href="https://quanti-app.com/terms" style="color:#818cf8;text-decoration:none;">Terms</a>
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
  referralCode,
}: {
  userEmail: string;
  currentRank: number;
  referralCode: string;
  isTop500: boolean;
}) {
  const referralUrl = waitlistShareUrl(referralCode);

  return [
    "You're on the list for Quanti [Early Access Queue]",
    "",
    "Welcome to the Quanti waitlist.",
    "",
    "Most tools show graphs after the fact. Quanti is a destination GPS: you name where you are and where you want to go.",
    "",
    "Overnight signals only size how hard today can go. A 15-second check fills one blank. Yesterday’s mark writes tomorrow. You get one 1% move—not a season, streak, or dashboard.",
    "",
    `Your referral link to skip the line: ${referralUrl}`,
    "",
    "Share with 3 friends to unlock early beta access and direct founder feedback.",
    "",
    "- The Quanti Team",
  ].join("\n");
}
