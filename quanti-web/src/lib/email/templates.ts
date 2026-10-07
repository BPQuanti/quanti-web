import { waitlistShareUrl } from "@/lib/waitlist/publicUrl";

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  const status = isTop500 ? "🟢 IN RANGE FOR OG FOUNDER PASS" : "🟡 PROVISIONAL";
  const statusColor = isTop500 ? "#34d399" : "#fbbf24";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>You're on the Quanti waitlist</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0a0a0a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0a0a0a;width:100%;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background-color:#111111;border:1px solid #8b5cf6;border-radius:20px;">
            <tr>
              <td style="padding:28px 24px 32px;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8b5cf6;">Quanti Waitlist</p>
                <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#ffffff;">Thank you for jumping in early.</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#e4e4e7;">
                  ${escapeHtml(userEmail)}, we are genuinely grateful you are here. Quanti is being built with the people who show up first — and this waitlist is how we construct that future together.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
                  <tr>
                    <td style="background-color:#1a1028;border:1px solid #8b5cf6;border-radius:16px;padding:20px;text-align:center;">
                      <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#a78bfa;">Current Position</p>
                      <p style="margin:0 0 12px;font-size:36px;line-height:1;font-weight:700;color:#ffffff;">#${escapeHtml(String(currentRank))}</p>
                      <p style="margin:0;display:inline-block;padding:8px 14px;border-radius:999px;border:1px solid ${statusColor};background-color:#0a0a0a;color:${statusColor};font-size:11px;font-weight:700;letter-spacing:0.08em;">
                        ${status}
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="background-color:#0a0a0a;border:1px solid #8b5cf6;border-radius:16px;padding:20px;">
                      <p style="margin:0 0 14px;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#8b5cf6;">OG Founder Mechanics</p>
                      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#d4d4d8;">
                        <strong style="color:#ffffff;">48-hour priority access.</strong> The Top 500 receive a 48-hour launch window and a 6-digit in-app claim code to lock the OG Founder Pass.
                      </p>
                      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#d4d4d8;">
                        <strong style="color:#ffffff;">Roll-down rule.</strong> Unclaimed spots after 48 hours cascade to position #501 and below, in rank order.
                      </p>
                      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#d4d4d8;">
                        <strong style="color:#ffffff;">Top 100 TestFlight.</strong> The first 100 spots get immediate pre-launch Apple TestFlight beta invites.
                      </p>
                      <p style="margin:0;font-size:14px;line-height:1.7;color:#d4d4d8;">
                        <strong style="color:#ffffff;">0.5% revenue dividend pool.</strong> Verified OG Founders keep lifetime perks plus a share of a 0.5% company revenue pool reserved for this group.
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#ffffff;font-weight:700;">3 referrals = 50-spot rank jump</p>
                <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#d4d4d8;">
                  Every 3 friends who join with your link moves you 50 spots closer to OG, TestFlight, and the founder pool.
                </p>
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8b5cf6;">Your referral link</p>
                <p style="margin:0 0 16px;padding:14px 16px;background-color:#0a0a0a;border:1px solid #3f3f46;border-radius:12px;font-size:13px;line-height:1.5;color:#ffffff;word-break:break-all;">
                  ${escapeHtml(referralUrl)}
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
                  <tr>
                    <td style="background-color:#8b5cf6;border-radius:12px;">
                      <a href="${escapeHtml(referralUrl)}" style="display:inline-block;padding:14px 22px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                        Share your unique link
                      </a>
                    </td>
                  </tr>
                </table>

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
