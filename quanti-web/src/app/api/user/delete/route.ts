import { decryptToken, isEncryptedToken } from "@/lib/security/encryption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USER_TABLES = ["ai_chat_history", "saved_stats", "recaps", "health_daily"];
const SUCCESS = {
  success: true as const,
  message: "Account and associated data completely purged.",
};

type PlaidItem = {
  id?: string;
  access_token?: string | null;
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, anonKey, serviceKey };
}

function plaidHost() {
  const env = (process.env.PLAID_ENV || "sandbox").toLowerCase();
  if (env === "production") return "https://production.plaid.com";
  if (env === "development") return "https://development.plaid.com";
  return "https://sandbox.plaid.com";
}

async function requireUser(request: Request) {
  const { url, anonKey } = supabaseConfig();
  const header = request.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!url || !anonKey || !token) {
    return null;
  }
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
    },
  });
  if (!response.ok) {
    return null;
  }
  const user = (await response.json()) as { id?: string };
  return user.id ? { id: user.id } : null;
}

async function serviceFetch(path: string, init: RequestInit = {}) {
  const { url, serviceKey } = supabaseConfig();
  if (!url || !serviceKey) {
    throw new Error("Account deletion is not configured.");
  }
  return fetch(`${url}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

async function loadPlaidItems(userId: string): Promise<PlaidItem[]> {
  const response = await serviceFetch(
    `/rest/v1/plaid_items?user_id=eq.${encodeURIComponent(userId)}&select=id,access_token`,
    { method: "GET" },
  );
  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    const body = await response.text();
    if (body.includes("PGRST") || response.status === 400) {
      return [];
    }
    throw new Error("Could not read stored bank connections.");
  }
  const rows = (await response.json()) as PlaidItem[];
  return Array.isArray(rows) ? rows : [];
}

async function revokePlaidItem(accessToken: string) {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  if (!clientId || !secret) {
    throw new Error("Plaid is not configured on the server.");
  }
  const response = await fetch(`${plaidHost()}/item/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      secret,
      access_token: accessToken,
    }),
  });
  if (response.ok) {
    return;
  }
  const payload = (await response.json().catch(() => null)) as { error_code?: string } | null;
  if (payload?.error_code === "ITEM_NOT_FOUND" || payload?.error_code === "INVALID_ACCESS_TOKEN") {
    return;
  }
  throw new Error("Plaid did not revoke the bank connection.");
}

async function deleteRows(table: string, column: string, userId: string) {
  const response = await serviceFetch(
    `/rest/v1/${table}?${column}=eq.${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    },
  );
  if (response.ok || response.status === 404) {
    return;
  }
  const body = await response.text();
  if (body.includes("PGRST") || response.status === 400) {
    return;
  }
  throw new Error(`Could not delete ${table}.`);
}

async function purgeAccount(userId: string) {
  const items = await loadPlaidItems(userId);
  for (const item of items) {
    const stored = item.access_token;
    if (!stored) {
      continue;
    }
    const accessToken = isEncryptedToken(stored) ? decryptToken(stored) : stored;
    await revokePlaidItem(accessToken);
  }

  await deleteRows("plaid_items", "user_id", userId);
  for (const table of USER_TABLES) {
    await deleteRows(table, "user_id", userId);
  }
  await deleteRows("profiles", "id", userId);

  const removed = await serviceFetch(`/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
  if (!removed.ok && removed.status !== 404) {
    throw new Error("The login record could not be deleted.");
  }
}

async function handleDelete(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return Response.json({ success: false, message: "Sign in is required." }, { status: 401 });
    }
    await purgeAccount(user.id);
    return Response.json(SUCCESS);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Account deletion failed.";
    const status = message.includes("not configured") ? 503 : 500;
    return Response.json({ success: false, message }, { status });
  }
}

export function DELETE(request: Request) {
  return handleDelete(request);
}

export function POST(request: Request) {
  return handleDelete(request);
}
