import { randomInt } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { waitlistShareUrl } from "@/lib/waitlist/publicUrl";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 6;
const TABLE = "waitlist_users";

export type WaitlistUser = {
  email: string;
  referralCode: string;
  initialPosition: number;
  referralCount: number;
  referredByCode: string | null;
};

export type WaitlistSignupResult = {
  success: true;
  created: boolean;
  email: string;
  referralCode: string;
  referralCount: number;
  currentRank: number;
  initialPosition: number;
  totalJumps: number;
  isTop500: boolean;
  shareUrl: string;
  progressToNextJump: number;
};

type WaitlistUserRow = {
  email: string;
  referral_code: string;
  initial_position: number;
  referral_count: number;
  referred_by_code: string | null;
};

function rowToUser(row: WaitlistUserRow): WaitlistUser {
  return {
    email: String(row.email || "").toLowerCase(),
    referralCode: String(row.referral_code || "").toUpperCase(),
    initialPosition: Number(row.initial_position || 0),
    referralCount: Number(row.referral_count || 0),
    referredByCode: row.referred_by_code ? String(row.referred_by_code).toUpperCase() : null,
  };
}

export function sanitizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email);
}

export function calculateWaitlistStatus(initialPosition: number, referralCount: number) {
  const totalJumps = Math.floor(referralCount / 3) * 50;
  const currentRank = Math.max(1, initialPosition - totalJumps);
  return {
    totalJumps,
    currentRank,
    isTop500: currentRank <= 500,
    progressToNextJump: referralCount % 3,
  };
}

function generateReferralCode() {
  let code = "";
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

async function findByEmail(email: string) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select("email,referral_code,initial_position,referral_count,referred_by_code")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to look up waitlist user.");
  }
  return data ? rowToUser(data as WaitlistUserRow) : null;
}

async function findByCode(code: string) {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select("email,referral_code,initial_position,referral_count,referred_by_code")
    .eq("referral_code", code)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to look up referral code.");
  }
  return data ? rowToUser(data as WaitlistUserRow) : null;
}

async function waitlistCount() {
  const { count, error } = await getSupabaseAdmin().from(TABLE).select("id", { count: "exact", head: true });
  if (error) {
    throw new Error(error.message || "Unable to read waitlist size.");
  }
  return count ?? 0;
}

async function uniqueReferralCode() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateReferralCode();
    const existing = await findByCode(code);
    if (!existing) {
      return code;
    }
  }
  throw new Error("Unable to generate a unique referral code.");
}

function toSignupResult(user: WaitlistUser, created: boolean): WaitlistSignupResult {
  const status = calculateWaitlistStatus(user.initialPosition, user.referralCount);
  return {
    success: true,
    created,
    email: user.email,
    referralCode: user.referralCode,
    referralCount: user.referralCount,
    currentRank: status.currentRank,
    initialPosition: user.initialPosition,
    totalJumps: status.totalJumps,
    isTop500: status.isTop500,
    shareUrl: waitlistShareUrl(user.referralCode),
    progressToNextJump: status.progressToNextJump,
  };
}

export async function signupWaitlist(input: { email: string; referredBy?: string }) {
  const email = sanitizeEmail(input.email);
  if (!isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  const existing = await findByEmail(email);
  if (existing) {
    return toSignupResult(existing, false);
  }

  const referredBy = String(input.referredBy || "")
    .trim()
    .toUpperCase();
  const referrer = referredBy ? await findByCode(referredBy) : null;
  const validReferrer = referrer && referrer.email !== email ? referrer : null;

  const initialPosition = (await waitlistCount()) + 1;
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert({
      email,
      referral_code: await uniqueReferralCode(),
      initial_position: initialPosition,
      referral_count: 0,
      referred_by_code: validReferrer?.referralCode ?? null,
    })
    .select("email,referral_code,initial_position,referral_count,referred_by_code")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      const existingAfterConflict = await findByEmail(email);
      if (existingAfterConflict) {
        return toSignupResult(existingAfterConflict, false);
      }
    }
    throw new Error(error?.message || "Unable to join the waitlist.");
  }

  if (validReferrer) {
    const { error: incrementError } = await getSupabaseAdmin()
      .from(TABLE)
      .update({ referral_count: validReferrer.referralCount + 1 })
      .eq("referral_code", validReferrer.referralCode);

    if (incrementError) {
      throw new Error(incrementError.message || "Unable to attribute referral.");
    }
  }

  return toSignupResult(rowToUser(data as WaitlistUserRow), true);
}
