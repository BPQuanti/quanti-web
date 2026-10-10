export function waitlistAppUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_APP_URL || "https://quanti-app.com").replace(/\/$/, "");
}

export function waitlistShareUrl(referralCode: string) {
  return `${waitlistAppUrl()}?ref=${encodeURIComponent(referralCode)}`;
}
