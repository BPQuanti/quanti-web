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
<html>
  <body style="margin:0;padding:0;background-color:#0a0a0a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0a0a0a;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#111111;border:1px solid #27272a;border-radius:20px;padding:32px;">
            <tr>
              <td style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8b5cf6;">Quanti Waitlist</p>
                <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#ffffff;">You're in.</h1>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#e4e4e7;">
                  Welcome, ${escapeHtml(userEmail)}. Your spot is locked and your referral engine is live.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
                  <tr>
                    <td style="background-color:#1a1028;border:1px solid #8b5cf6;border-radius:16px;padding:20px;text-align:center;">
                      <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#a78bfa;">Current Rank</p>
                      <p style="margin:0;font-size:36px;font-weight:700;color:#ffffff;">#${escapeHtml(String(currentRank))}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 20px;display:inline-block;padding:8px 14px;border-radius:999px;border:1px solid ${statusColor};background-color:#18181b;color:${statusColor};font-size:12px;font-weight:700;letter-spacing:0.08em;">
                  ${status}
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#d4d4d8;">
                  Jump <strong style="color:#ffffff;">50 spots</strong> for every <strong style="color:#ffffff;">3 friends</strong> who join with your link. The top 500 get a 48-hour VIP window and OG Claim Code.
                </p>
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8b5cf6;">Your referral link</p>
                <p style="margin:0 0 16px;padding:14px 16px;background-color:#0a0a0a;border:1px solid #3f3f46;border-radius:12px;font-size:14px;line-height:1.5;color:#ffffff;word-break:break-all;">
                  ${escapeHtml(referralUrl)}
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
                  <tr>
                    <td style="background-color:#8b5cf6;border-radius:12px;">
                      <a href="${escapeHtml(referralUrl)}" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
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
