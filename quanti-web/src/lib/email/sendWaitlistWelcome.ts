import { getResend } from "@/lib/email/client";
import { getWelcomeEmailHtml } from "@/lib/email/templates";

export async function sendWaitlistWelcomeEmail({
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
  const from = process.env.WAITLIST_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY || !from) {
    console.warn("Waitlist email skipped: RESEND_API_KEY or WAITLIST_FROM_EMAIL is not set.");
    return;
  }

  const { error } = await getResend().emails.send({
    from,
    to: userEmail,
    subject: `You're #${currentRank} on the Quanti waitlist`,
    html: getWelcomeEmailHtml({
      userEmail,
      currentRank,
      referralCode,
      isTop500,
    }),
  });

  if (error) {
    console.error("Waitlist welcome email failed", error);
  }
}
