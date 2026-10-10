export const REF_STORAGE_KEY = "quanti_waitlist_ref";
export const SIGNUP_STORAGE_KEY = "quanti_waitlist_signup";
export const SIGNUP_EVENT = "quanti-waitlist-updated";

export function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export async function copyText(value: string) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through to execCommand */
  }
  try {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(field);
    return ok;
  } catch {
    return false;
  }
}

export function parseJsonResponse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function friendlyWaitlistError(message?: string) {
  const text = String(message || "");
  if (!text) {
    return "Something went wrong. Please try again.";
  }
  if (/enter a valid email/i.test(text)) {
    return "Enter a valid email address.";
  }
  if (/23505|duplicate|already exists|unique/i.test(text)) {
    return "";
  }
  if (/fetch failed|network|failed to fetch|load failed|timeout|internal|jwt|permission|row-level/i.test(text)) {
    return "Something went wrong. Please try again.";
  }
  if (text.length > 140 || /at\s+\S+\s+\(/i.test(text) || /TypeError|Postgres|supabase/i.test(text)) {
    return "Something went wrong. Please try again.";
  }
  return text;
}
