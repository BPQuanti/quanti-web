export const REVIEW_DEMO_EMAIL = 'demo@quanti.app';

let reviewSession = false;

export function isReviewDemoEmail(email?: string | null) {
  return String(email || '').trim().toLowerCase() === REVIEW_DEMO_EMAIL;
}

/** Call whenever the signed-in email changes, including sign-out. */
export function syncReviewModeFromEmail(email?: string | null) {
  reviewSession = isReviewDemoEmail(email);
}

export function isReviewModeActive() {
  return reviewSession;
}

export const REVIEW_MODE_HEALTH = {
  steps: 2_800_000,
  workouts: 142,
  activeEnergyKcal: 18640,
  source: 'app-review-demo',
  badge: 'App Review Demo',
  status: 'Simulated HealthKit metrics for App Review',
};

export const REVIEW_MODE_PLAID = {
  isConnected: true,
  bankName: 'First Platypus Bank',
  accountBalance: 6120.44,
  spent: 4200,
  golfRounds: 73,
  publicToken: null,
  source: 'app-review-demo',
  status: 'App Review demo bank',
  accounts: [
    {
      id: 'demo-checking',
      name: 'Plaid Checking',
      mask: '0000',
      type: 'depository',
      subtype: 'checking',
    },
  ],
  transactions: [
    { id: 'demo-golf-dues', name: 'Golf club dues', amount: -2400, date: '2026-09-28' },
    { id: 'demo-golf-round', name: 'Weekend rounds', amount: -1800, date: '2026-10-01' },
    { id: 'demo-txn-coffee', name: 'Blue Bottle Coffee', amount: -6.75, date: '2026-10-04' },
  ],
};
