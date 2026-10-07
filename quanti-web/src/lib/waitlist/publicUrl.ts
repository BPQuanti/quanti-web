export function waitlistAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://quanti.app").replace(/\/$/, "");
}

export function waitlistShareUrl(referralCode: string) {
  return `${waitlistAppUrl()}?ref=${encodeURIComponent(referralCode)}`;
}
