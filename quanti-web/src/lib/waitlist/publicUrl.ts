export function waitlistAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function waitlistShareUrl(referralCode: string) {
  return `${waitlistAppUrl()}?ref=${encodeURIComponent(referralCode)}`;
}
