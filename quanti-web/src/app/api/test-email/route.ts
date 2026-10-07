import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getWelcomeEmailHtml } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const to = new URL(request.url).searchParams.get("to")?.trim() || "";
  if (!to) {
    return NextResponse.json(
      { error: "Please provide a ?to=email query parameter" },
      { status: 400 },
    );
  }

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
    to,
    subject: "Quanti waitlist test email",
    html: getWelcomeEmailHtml({
      userEmail: to,
      currentRank: 42,
      referralCode: "TEST01",
      isTop500: true,
    }),
  });

  if (error) {
    console.error("Test email failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Test email dispatched via Resend",
    sentTo: to,
  });
}
