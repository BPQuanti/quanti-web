import { NextResponse } from "next/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = String(body.email || "").trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const loopsKey = process.env.LOOPS_API_KEY;
    if (loopsKey) {
      const loopsResponse = await fetch("https://app.loops.so/api/v1/contacts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${loopsKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "quanti-app.com waitlist",
        }),
      });

      if (!loopsResponse.ok) {
        const detail = await loopsResponse.text();
        console.error("Loops waitlist error", detail);
        return NextResponse.json({ error: "Waitlist provider rejected this email." }, { status: 502 });
      }
    } else {
      console.log("Waitlist signup (set LOOPS_API_KEY to persist in Loops.so):", email);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Waitlist error", error);
    return NextResponse.json({ error: "Unable to join the waitlist." }, { status: 500 });
  }
}
