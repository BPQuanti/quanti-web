import { after, NextResponse } from "next/server";
import { sendWaitlistWelcomeEmail } from "@/lib/email/sendWaitlistWelcome";
import { waitlistViralRuleCopy } from "@/lib/waitlist/rank";
import { signupWaitlist } from "@/lib/waitlist/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: Request) {
  try {
    let body: { email?: string; referredBy?: string } = {};
    try {
      body = (await request.json()) as { email?: string; referredBy?: string };
    } catch {
      return jsonError("Enter a valid email address.", 400);
    }

    const result = await signupWaitlist({
      email: body.email || "",
      referredBy: body.referredBy,
    });

    if (result.created) {
      after(async () => {
        try {
          await sendWaitlistWelcomeEmail({
            userEmail: result.email,
            currentRank: result.currentRank,
            referralCode: result.referralCode,
            isTop500: result.isTop500,
          });
        } catch (emailError) {
          console.error("Waitlist welcome email failed", emailError);
        }
      });
    }

    return NextResponse.json({
      success: true,
      email: result.email,
      referralCode: result.referralCode,
      referralCount: result.referralCount,
      currentRank: result.currentRank,
      initialPosition: result.initialPosition,
      totalJumps: result.totalJumps,
      shareUrl: result.shareUrl,
      positionRule: waitlistViralRuleCopy(),
      isTop500: result.isTop500,
    });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Unable to join the waitlist.";
    const message = /email|valid/i.test(raw) ? "Enter a valid email address." : "Something went wrong. Please try again.";
    const status = /email|valid/i.test(raw) ? 400 : 500;
    console.error("Waitlist error", error);
    return jsonError(message, status);
  }
}
