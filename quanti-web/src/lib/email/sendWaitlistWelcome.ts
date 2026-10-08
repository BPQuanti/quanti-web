import { getResend } from "@/lib/email/client";
import {
  getWelcomeEmailHtml,
  getWelcomeEmailSubject,
  getWelcomeEmailText,
} from "@/lib/email/templates";

function replyToAddress(from: string) {
  const match = from.match(/<([^>]+)>/);
  return (match?.[1] || from).trim();
}

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

  const payload = { userEmail, currentRank, referralCode, isTop500 };

  try {
    const { error } = await getResend().emails.send({
      from,
      to: userEmail,
      replyTo: replyToAddress(from),
      subject: getWelcomeEmailSubject(currentRank),
      html: getWelcomeEmailHtml(payload),
      text: getWelcomeEmailText(payload),
    });

    if (error) {
      console.error("Waitlist welcome email failed", error);
    }
  } catch (emailError) {
    console.error("Waitlist welcome email failed", emailError);
  }
}
