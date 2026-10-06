import { decryptToken, isEncryptedToken } from "@/lib/security/encryption";

type PlaidItemRow = {
  id?: string | null;
  access_token?: string | null;
  status?: string | null;
};

export type ActivePlaidItem = {
  itemId: string;
  accessToken: string;
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, serviceKey };
}

async function serviceFetch(path: string, init: RequestInit = {}) {
  const { url, serviceKey } = supabaseConfig();
  if (!url || !serviceKey) {
    throw new Error("Plaid storage is not configured.");
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

function isMissingStatusColumn(body: string) {
  return /status/i.test(body) && /column|schema cache|PGRST204/i.test(body);
}

function isMissingTable(body: string) {
  return /PGRST205|could not find the table|does not exist/i.test(body);
}

function isActive(row: PlaidItemRow) {
  if (!row.access_token) return false;
  if (typeof row.status === "string" && row.status.length > 0 && row.status !== "active") {
    return false;
  }
  return true;
}

async function readItemRows(userId: string, select: string) {
  const response = await serviceFetch(
    `/rest/v1/plaid_items?user_id=eq.${encodeURIComponent(userId)}&select=${select}`,
    { method: "GET" },
  );
  if (!response.ok) {
    return { ok: false as const, status: response.status, body: await response.text() };
  }
  const rows = (await response.json()) as PlaidItemRow[];
  return { ok: true as const, rows: Array.isArray(rows) ? rows : [] };
}

async function loadStoredItems(userId: string): Promise<PlaidItemRow[]> {
  if (!userId) return [];
  let result = await readItemRows(userId, "id,access_token,status");
  if (!result.ok && (result.status === 400 || isMissingStatusColumn(result.body))) {
    result = await readItemRows(userId, "id,access_token");
  }
  if (!result.ok) {
    if (result.status === 404 || isMissingTable(result.body) || result.body.includes("PGRST")) {
      return [];
    }
    throw new Error("Could not read stored bank connections.");
  }
  return result.rows.filter(isActive);
}

function revealToken(stored: string) {
  try {
    return isEncryptedToken(stored) ? decryptToken(stored) : stored;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("TOKEN_ENCRYPTION_KEY") || message.includes("not set")) {
      throw error;
    }
    throw new Error("A stored bank token could not be read.");
  }
}

export async function countActivePlaidConnections(userId: string) {
  const items = await loadStoredItems(userId);
  return items.length;
}

export async function listActiveAccessTokens(userId: string): Promise<ActivePlaidItem[]> {
  const items = await loadStoredItems(userId);
  return items.map((item, index) => ({
    itemId: item.id || `item-${index + 1}`,
    accessToken: revealToken(item.access_token as string),
  }));
}
