import { listActiveAccessTokens } from "@/lib/plaid/connections";

/** Spending is negative and income is positive, matching the in-app ledger. */
export type NormalizedTransaction = {
  id: string;
  itemId: string;
  accountId: string;
  name: string;
  merchantName: string | null;
  amount: number;
  date: string;
  pending: boolean;
  category: string | null;
};

type PlaidTransaction = {
  transaction_id?: string;
  account_id?: string;
  amount?: number;
  date?: string;
  authorized_date?: string | null;
  name?: string | null;
  merchant_name?: string | null;
  pending?: boolean;
  category?: string[] | null;
  personal_finance_category?: {
    primary?: string | null;
    detailed?: string | null;
  } | null;
};

type SyncPage = {
  added?: PlaidTransaction[];
  next_cursor?: string;
  has_more?: boolean;
  error_code?: string;
  error_message?: string;
};

const INTERNAL_DETAILED = new Set([
  "LOAN_PAYMENTS_CREDIT_CARD_PAYMENT",
  "TRANSFER_IN_ACCOUNT_TRANSFER",
  "TRANSFER_OUT_ACCOUNT_TRANSFER",
  "TRANSFER_IN_SAVINGS",
  "TRANSFER_OUT_SAVINGS",
]);

const INTERNAL_TEXT = [
  /credit card payment/i,
  /payment\s*-?\s*thank you/i,
  /transfer to savings/i,
  /transfer from savings/i,
  /transfer to checking/i,
  /transfer from checking/i,
  /internal transfer/i,
];

const MAX_SYNC_PAGES = 40;

function plaidHost() {
  const env = (process.env.PLAID_ENV || "sandbox").toLowerCase();
  if (env === "production") return "https://production.plaid.com";
  if (env === "development") return "https://development.plaid.com";
  return "https://sandbox.plaid.com";
}

function isInternalTransfer(transaction: PlaidTransaction) {
  const detailed = transaction.personal_finance_category?.detailed || "";
  if (INTERNAL_DETAILED.has(detailed)) return true;

  const categories = Array.isArray(transaction.category) ? transaction.category : [];
  const label = categories.join(" ").toLowerCase();
  if (label.includes("credit card") && label.includes("payment")) return true;

  const text = `${transaction.name || ""} ${transaction.merchant_name || ""}`;
  return INTERNAL_TEXT.some((pattern) => pattern.test(text));
}

function normalize(itemId: string, transaction: PlaidTransaction): NormalizedTransaction | null {
  const id = transaction.transaction_id;
  if (!id) return null;
  const categories = Array.isArray(transaction.category) ? transaction.category : [];
  const category = transaction.personal_finance_category?.primary || categories[0] || null;
  const plaidAmount = Number(transaction.amount);
  return {
    id,
    itemId,
    accountId: transaction.account_id || "",
    name: transaction.name || transaction.merchant_name || "Transaction",
    merchantName: transaction.merchant_name || null,
    amount: Number.isFinite(plaidAmount) ? -plaidAmount : 0,
    date: transaction.date || transaction.authorized_date || "",
    pending: Boolean(transaction.pending),
    category,
  };
}

async function plaidSync(accessToken: string, cursor?: string) {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  if (!clientId || !secret) {
    throw new Error("Plaid is not configured on the server.");
  }
  const response = await fetch(`${plaidHost()}/transactions/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      secret,
      access_token: accessToken,
      count: 500,
      ...(cursor ? { cursor } : {}),
    }),
  });
  const payload = (await response.json().catch(() => null)) as SyncPage | null;
  if (!response.ok || !payload) {
    const code = payload?.error_code ? ` (${payload.error_code})` : "";
    throw new Error(`Plaid could not load transactions${code}.`);
  }
  return payload;
}

async function fetchTransactionsForItem(itemId: string, accessToken: string) {
  const collected: PlaidTransaction[] = [];
  let cursor: string | undefined;
  let hasMore = true;
  let pages = 0;

  while (hasMore) {
    pages += 1;
    if (pages > MAX_SYNC_PAGES) break;
    const page = await plaidSync(accessToken, cursor);
    if (Array.isArray(page.added)) collected.push(...page.added);
    cursor = page.next_cursor || undefined;
    hasMore = Boolean(page.has_more && cursor);
  }

  return collected.filter((transaction) => !isInternalTransfer(transaction)).flatMap((transaction) => {
    const normalized = normalize(itemId, transaction);
    return normalized ? [normalized] : [];
  });
}

export async function fetchAllUserTransactions(userId: string): Promise<NormalizedTransaction[]> {
  const items = await listActiveAccessTokens(userId);
  const groups = await Promise.all(
    items.map((item) => fetchTransactionsForItem(item.itemId, item.accessToken)),
  );
  return groups.flat().sort((a, b) => {
    if (a.date === b.date) return a.id.localeCompare(b.id);
    return a.date < b.date ? 1 : -1;
  });
}
