import { randomInt } from "crypto";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const SITE_ORIGIN = "https://quanti-app.com";

export type WaitlistEntry = {
  email: string;
  referralCode: string;
  initialPosition: number;
  referralCount: number;
  referredBy: string | null;
};

export type WaitlistStatus = {
  currentRank: number;
  totalJumps: number;
  progressToNextJump: number;
  isTop500: boolean;
};

export type WaitlistSignupResult = {
  success: true;
  email: string;
  referralCode: string;
  referralCount: number;
  currentRank: number;
  totalJumps: number;
  shareUrl: string;
  initialPosition: number;
  progressToNextJump: number;
  isTop500: boolean;
};

type Store = {
  findByEmail(email: string): Promise<WaitlistEntry | null>;
  findByCode(code: string): Promise<WaitlistEntry | null>;
  count(): Promise<number>;
  insert(entry: WaitlistEntry): Promise<WaitlistEntry>;
  incrementReferralCount(code: string): Promise<WaitlistEntry | null>;
};

type GlobalWaitlist = typeof globalThis & {
  __quantiWaitlistEntries?: Map<string, WaitlistEntry>;
};

function memoryMaps() {
  const globalStore = globalThis as GlobalWaitlist;
  if (!globalStore.__quantiWaitlistEntries) {
    globalStore.__quantiWaitlistEntries = new Map();
  }
  return globalStore.__quantiWaitlistEntries;
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, serviceKey };
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  const { url, serviceKey } = supabaseConfig();
  if (!url || !serviceKey) {
    return null;
  }
  return fetch(`${url}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
  });
}

function rowToEntry(row: {
  email?: string;
  referral_code?: string;
  initial_position?: number;
  referral_count?: number;
  referred_by?: string | null;
}): WaitlistEntry {
  return {
    email: String(row.email || "").toLowerCase(),
    referralCode: String(row.referral_code || "").toUpperCase(),
    initialPosition: Number(row.initial_position || 0),
    referralCount: Number(row.referral_count || 0),
    referredBy: row.referred_by ? String(row.referred_by).toUpperCase() : null,
  };
}

const memoryStore: Store = {
  async findByEmail(email) {
    return memoryMaps().get(email) ?? null;
  },
  async findByCode(code) {
    const needle = code.toUpperCase();
    for (const entry of memoryMaps().values()) {
      if (entry.referralCode === needle) {
        return entry;
      }
    }
    return null;
  },
  async count() {
    return memoryMaps().size;
  },
  async insert(entry) {
    memoryMaps().set(entry.email, entry);
    return entry;
  },
  async incrementReferralCount(code) {
    const referrer = await this.findByCode(code);
    if (!referrer) {
      return null;
    }
    const updated = { ...referrer, referralCount: referrer.referralCount + 1 };
    memoryMaps().set(updated.email, updated);
    return updated;
  },
};

const supabaseStore: Store = {
  async findByEmail(email) {
    const response = await supabaseFetch(
      `/rest/v1/waitlist_signups?email=eq.${encodeURIComponent(email)}&select=*`,
    );
    if (!response?.ok) {
      return memoryStore.findByEmail(email);
    }
    const rows = (await response.json()) as Record<string, unknown>[];
    return rows[0] ? rowToEntry(rows[0]) : null;
  },
  async findByCode(code) {
    const response = await supabaseFetch(
      `/rest/v1/waitlist_signups?referral_code=eq.${encodeURIComponent(code)}&select=*`,
    );
    if (!response?.ok) {
      return memoryStore.findByCode(code);
    }
    const rows = (await response.json()) as Record<string, unknown>[];
    return rows[0] ? rowToEntry(rows[0]) : null;
  },
  async count() {
    const response = await supabaseFetch("/rest/v1/waitlist_signups?select=email", {
      method: "GET",
      headers: { Prefer: "count=exact" },
    });
    if (!response?.ok) {
      return memoryStore.count();
    }
    const contentRange = response.headers.get("content-range");
    const total = contentRange?.split("/")[1];
    const parsed = Number(total);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
    const rows = (await response.json()) as unknown[];
    return Array.isArray(rows) ? rows.length : 0;
  },
  async insert(entry) {
    const response = await supabaseFetch("/rest/v1/waitlist_signups", {
      method: "POST",
      body: JSON.stringify({
        email: entry.email,
        referral_code: entry.referralCode,
        initial_position: entry.initialPosition,
        referral_count: entry.referralCount,
        referred_by: entry.referredBy,
      }),
    });
    if (!response?.ok) {
      return memoryStore.insert(entry);
    }
    const rows = (await response.json()) as Record<string, unknown>[];
    return rows[0] ? rowToEntry(rows[0]) : entry;
  },
  async incrementReferralCount(code) {
    const referrer = await this.findByCode(code);
    if (!referrer) {
      return null;
    }
    const nextCount = referrer.referralCount + 1;
    const response = await supabaseFetch(
      `/rest/v1/waitlist_signups?referral_code=eq.${encodeURIComponent(code)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ referral_count: nextCount }),
      },
    );
    if (!response?.ok) {
      return memoryStore.incrementReferralCount(code);
    }
    return { ...referrer, referralCount: nextCount };
  },
};

function store(): Store {
  const { url, serviceKey } = supabaseConfig();
  return url && serviceKey ? supabaseStore : memoryStore;
}

export function sanitizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email);
}

export function calculateWaitlistStatus(initialPosition: number, referralCount: number): WaitlistStatus {
  const totalJumps = Math.floor(referralCount / 3) * 50;
  const currentRank = Math.max(1, initialPosition - totalJumps);
  const progressToNextJump = referralCount % 3;
  return {
    currentRank,
    totalJumps,
    progressToNextJump,
    isTop500: currentRank <= 500,
  };
}

function generateReferralCode() {
  let code = "";
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

async function uniqueReferralCode() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateReferralCode();
    const existing = await store().findByCode(code);
    if (!existing) {
      return code;
    }
  }
  throw new Error("Unable to generate a unique referral code.");
}

function toSignupResult(entry: WaitlistEntry): WaitlistSignupResult {
  const status = calculateWaitlistStatus(entry.initialPosition, entry.referralCount);
  return {
    success: true,
    email: entry.email,
    referralCode: entry.referralCode,
    referralCount: entry.referralCount,
    currentRank: status.currentRank,
    totalJumps: status.totalJumps,
    shareUrl: `${SITE_ORIGIN}/?ref=${encodeURIComponent(entry.referralCode)}`,
    initialPosition: entry.initialPosition,
    progressToNextJump: status.progressToNextJump,
    isTop500: status.isTop500,
  };
}

export async function signupWaitlist(input: { email: string; referredBy?: string }) {
  const email = sanitizeEmail(input.email);
  if (!isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  const existing = await store().findByEmail(email);
  if (existing) {
    return toSignupResult(existing);
  }

  const referredBy = String(input.referredBy || "")
    .trim()
    .toUpperCase();
  const referrer = referredBy ? await store().findByCode(referredBy) : null;
  const validReferrer = referrer && referrer.email !== email ? referrer : null;

  const initialPosition = (await store().count()) + 1;
  const entry = await store().insert({
    email,
    referralCode: await uniqueReferralCode(),
    initialPosition,
    referralCount: 0,
    referredBy: validReferrer?.referralCode ?? null,
  });

  if (validReferrer) {
    await store().incrementReferralCount(validReferrer.referralCode);
  }

  return toSignupResult(entry);
}
