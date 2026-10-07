import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getWelcomeEmailHtml } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEST_RECIPIENT = "brianalan21@gmail.com";

export async function GET() {
  const from = process.env.WAITLIST_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY || !from) {
    return NextResponse.json(
      { error: "RESEND_API_KEY or WAITLIST_FROM_EMAIL is not set." },
      { status: 500 },
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from,
    to: TEST_RECIPIENT,
    subject: "Quanti waitlist test email",
    html: getWelcomeEmailHtml({
      userEmail: TEST_RECIPIENT,
      currentRank: 42,
      referralCode: "OGTEST",
      isTop500: true,
    }),
  });

  if (error) {
    console.error("Test email failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Welcome email dispatched to brianalan21@gmail.com",
    sender: process.env.WAITLIST_FROM_EMAIL,
  });
}
