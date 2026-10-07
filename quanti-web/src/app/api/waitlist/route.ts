import { NextResponse } from "next/server";
import { signupWaitlist } from "@/lib/waitlist/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      referredBy?: string;
      referred_by?: string;
    };

    const result = await signupWaitlist({
      email: body.email || "",
      referredBy: body.referredBy || body.referred_by,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to join the waitlist.";
    const status = message.includes("email") ? 400 : 500;
    console.error("Waitlist error", error);
    return NextResponse.json({ error: message }, { status });
  }
}
