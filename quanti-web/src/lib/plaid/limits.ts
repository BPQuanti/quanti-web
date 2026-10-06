import { countActivePlaidConnections } from "@/lib/plaid/connections";

export type PlaidTier = "free" | "pro" | "og";

const PRO_ACCOUNT_LIMIT = 3;

/**
 * Free cannot link a bank. Pro can link up to 3 active Items. OG is unlimited.
 */
export async function canLinkNewAccount(userId: string, userTier: PlaidTier): Promise<boolean> {
  if (!userId) return false;
  if (userTier === "free") return false;
  if (userTier === "og") return true;
  if (userTier !== "pro") return false;
  const connected = await countActivePlaidConnections(userId);
  return connected < PRO_ACCOUNT_LIMIT;
}
