import { isReviewModeActive, REVIEW_MODE_HEALTH, REVIEW_MODE_PLAID } from '../../src/lib/config/reviewMode';

/** Set EXPO_PUBLIC_IS_APP_REVIEW_DEMO=true on the App Store review build. */
export const IS_APP_REVIEW_DEMO = process.env.EXPO_PUBLIC_IS_APP_REVIEW_DEMO === 'true';

let runtimeDemo = false;

export function setReviewDemoEnabled(enabled) {
  runtimeDemo = Boolean(enabled);
}

export function isReviewDemoActive() {
  return IS_APP_REVIEW_DEMO || runtimeDemo || isReviewModeActive();
}

export function getReviewHealthSnapshot() {
  return isReviewModeActive() ? REVIEW_MODE_HEALTH : REVIEW_HEALTH;
}

export function getReviewPlaidSnapshot() {
  return isReviewModeActive() ? REVIEW_MODE_PLAID : REVIEW_PLAID;
}

export const REVIEW_HEALTH = {
  steps: 12480,
  activeEnergyKcal: 640,
  source: 'app-review-demo',
  badge: 'App Review Demo',
  status: 'Simulated HealthKit metrics for App Review',
};

export const REVIEW_PLAID = {
  isConnected: true,
  bankName: 'First Platypus Bank',
  accountBalance: 4280.16,
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
    { id: 'demo-txn-1', name: 'Blue Bottle Coffee', amount: -6.75, date: '2026-10-04' },
    { id: 'demo-txn-2', name: 'Equinox Fitness', amount: -240, date: '2026-10-02' },
    { id: 'demo-txn-3', name: 'City Transit', amount: -2.9, date: '2026-10-02' },
    { id: 'demo-txn-4', name: 'Payroll', amount: 3200, date: '2026-10-01' },
  ],
};
