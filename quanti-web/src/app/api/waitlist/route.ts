import { after, NextResponse } from "next/server";
import { sendWaitlistWelcomeEmail } from "@/lib/email/sendWaitlistWelcome";
import { signupWaitlist } from "@/lib/waitlist/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      referredBy?: string;
    };

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
      isTop500: result.isTop500,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to join the waitlist.";
    const status = /email|valid/i.test(message) ? 400 : 500;
    console.error("Waitlist error", error);
    return NextResponse.json({ error: message }, { status });
  }
}
