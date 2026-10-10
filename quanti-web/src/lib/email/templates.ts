import { waitlistShareUrl } from "@/lib/waitlist/publicUrl";

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getWelcomeEmailSubject(currentRank: number) {
  return `You're on the Quanti waitlist — spot #${currentRank}`;
}

export function getWelcomeEmailHtml({
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
  const ogLine = isTop500
    ? "You're in the first 500, so OG Founder pricing at $49/yr is reserved for you before public launch at $99/yr."
    : "The first 500 lock OG Founder pricing at $49/yr before public launch at $99/yr.";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${escapeHtml(getWelcomeEmailSubject(currentRank))}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0b0712;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0712;width:100%;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background-color:#0f172a;border:1px solid #1e293b;border-radius:24px;">
            <tr>
              <td style="padding:32px 28px 36px;font-family:Arial,Helvetica,sans-serif;color:#f8fafc;">
                <p style="margin:0 0 20px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a5b4fc;">Quanti</p>
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:600;color:#f8fafc;">You're confirmed.</h1>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#94a3b8;">
                  This is your waitlist confirmation. Your spot is
                  <strong style="color:#f8fafc;">#${spot}</strong>.
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#94a3b8;">
                  Quanti reads Screen Time, Health, and Spending in the background and turns that into one daily Focus Directive—so you don't have to log it yourself.
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#94a3b8;">
                  ${escapeHtml(ogLine)}
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#94a3b8;">
                  If you want the private TestFlight, reply to this email with BETA.
                </p>
                <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#94a3b8;">
                  Your page, if you want to share it: every friend who joins moves you up 20 spots.
                </p>
                <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#818cf8;word-break:break-all;">
                  <a href="${escapeHtml(referralUrl)}" style="color:#818cf8;text-decoration:none;">${escapeHtml(referralUrl)}</a>
                </p>
                <p style="margin:0 0 4px;font-size:15px;line-height:1.6;color:#f8fafc;">Brian</p>
                <p style="margin:0 0 28px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">Founder, Quanti</p>
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
  const ogLine = isTop500
    ? "You're in the first 500, so OG Founder pricing at $49/yr is reserved for you before public launch at $99/yr."
    : "The first 500 lock OG Founder pricing at $49/yr before public launch at $99/yr.";

  return [
    "You're confirmed on the Quanti waitlist.",
    `Your spot is #${currentRank}.`,
    "",
    "Quanti reads Screen Time, Health, and Spending in the background and turns that into one daily Focus Directive—so you don't have to log it yourself.",
    ogLine,
    "If you want the private TestFlight, reply to this email with BETA.",
    "",
    `Your page: ${referralUrl}`,
    "Every friend who joins moves you up 20 spots.",
    "",
    "Brian",
    "Founder, Quanti",
    "",
    "https://quanti-app.com",
    "https://quanti-app.com/privacy",
    "https://quanti-app.com/terms",
  ].join("\n");
}
