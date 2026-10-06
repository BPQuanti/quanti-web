import { fetchAllUserTransactions } from "@/lib/plaid/aggregation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

async function requireUser(request: Request) {
  const { url, anonKey } = supabaseConfig();
  const header = request.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!url || !anonKey || !token) return null;
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
    },
  });
  if (!response.ok) return null;
  const user = (await response.json()) as { id?: string };
  return user.id ? { id: user.id } : null;
}

function statusFor(message: string) {
  if (
    message.includes("not configured") ||
    message.includes("TOKEN_ENCRYPTION_KEY") ||
    message.includes("not set")
  ) {
    return 503;
  }
  return 502;
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return Response.json({ transactions: [], message: "Sign in is required." }, { status: 401 });
    }
    const transactions = await fetchAllUserTransactions(user.id);
    return Response.json({ transactions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load transactions.";
    return Response.json({ transactions: [], message }, { status: statusFor(message) });
  }
}
