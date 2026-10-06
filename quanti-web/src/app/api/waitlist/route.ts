import { NextResponse } from "next/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GETWAITLIST_SIGNUP_URL = "https://api.getwaitlist.com/api/v1/signup";
const SITE_ORIGIN = "https://quanti-app.com";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; referred_by?: string };
    const email = String(body.email || "").trim().toLowerCase();
    const referredBy = String(body.referred_by || "").trim();

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const waitlistId = Number(
      process.env.NEXT_PUBLIC_GETWAITLIST_ID || process.env.GETWAITLIST_ID || process.env.WAITLIST_ID || "33110",
    );
    if (!Number.isFinite(waitlistId) || waitlistId <= 0) {
      return NextResponse.json(
        { error: "Waitlist is not configured yet. Add NEXT_PUBLIC_GETWAITLIST_ID to the server environment." },
        { status: 503 },
      );
    }

    const referralLink = referredBy
      ? `${SITE_ORIGIN}/?ref_id=${encodeURIComponent(referredBy)}`
      : `${SITE_ORIGIN}/`;

    const waitlistResponse = await fetch(GETWAITLIST_SIGNUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        waitlist_id: waitlistId,
        referral_link: referralLink,
        metadata: referredBy ? { referred_by: referredBy } : undefined,
      }),
    });

    const payload = (await waitlistResponse.json().catch(() => null)) as
      | {
          priority?: number;
          referral_token?: string;
          referral_link?: string;
          detail?: string;
          error?: string;
        }
      | null;

    if (!waitlistResponse.ok || !payload) {
      const detail = payload?.detail || payload?.error || "Waitlist provider rejected this email.";
      return NextResponse.json({ error: detail }, { status: 502 });
    }

    return NextResponse.json({
      email,
      position: payload.priority ?? 0,
      referralToken: payload.referral_token ?? "",
    });
  } catch (error) {
    console.error("Waitlist error", error);
    return NextResponse.json({ error: "Unable to join the waitlist." }, { status: 500 });
  }
}
