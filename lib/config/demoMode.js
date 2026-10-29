import { isReviewModeActive, REVIEW_MODE_HEALTH, REVIEW_MODE_PLAID } from '../../src/lib/config/reviewMode';

/** Set EXPO_PUBLIC_IS_APP_REVIEW_DEMO=true on the App Store review build. */
export const IS_APP_REVIEW_DEMO = process.env.EXPO_PUBLIC_IS_APP_REVIEW_DEMO === 'true';

let runtimeDemo = false;
const demoListeners = new Set();

export function setReviewDemoEnabled(enabled) {
  runtimeDemo = Boolean(enabled);
  demoListeners.forEach((listener) => listener());
}

export function subscribeReviewDemo(listener) {
  demoListeners.add(listener);
  return () => demoListeners.delete(listener);
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

/** Seven days, oldest first. Offsets are days from today. Yesterday stays under the 15-minute verify line; today crosses it. */
export function getReviewDeviceHabits() {
  return [
    { offset: -6, total_screen_minutes: 132, social_minutes: 18, shopping_minutes: 4, entertainment_minutes: 40, late_night_screen_minutes: 6, phone_pickups: 24, notifications_received: 46, daylight_minutes: 48, avg_noise_exposure_db: 52, focus_mode_minutes: 70, location_stability_score: 0.42, transit_minutes: 40, headphone_minutes: 25, low_battery_events: 0 },
    { offset: -5, total_screen_minutes: 148, social_minutes: 22, shopping_minutes: 6, entertainment_minutes: 48, late_night_screen_minutes: 9, phone_pickups: 27, notifications_received: 51, daylight_minutes: 55, avg_noise_exposure_db: 54, focus_mode_minutes: 62, location_stability_score: 0.51, transit_minutes: 22, headphone_minutes: 30, low_battery_events: 1 },
    { offset: -4, total_screen_minutes: 171, social_minutes: 31, shopping_minutes: 9, entertainment_minutes: 55, late_night_screen_minutes: 14, phone_pickups: 36, notifications_received: 63, daylight_minutes: 38, avg_noise_exposure_db: 57, focus_mode_minutes: 40, location_stability_score: 0.63, transit_minutes: 15, headphone_minutes: 44, low_battery_events: 0 },
    { offset: -3, total_screen_minutes: 198, social_minutes: 40, shopping_minutes: 14, entertainment_minutes: 64, late_night_screen_minutes: 21, phone_pickups: 44, notifications_received: 72, daylight_minutes: 26, avg_noise_exposure_db: 58, focus_mode_minutes: 28, location_stability_score: 0.74, transit_minutes: 8, headphone_minutes: 52, low_battery_events: 1 },
    { offset: -2, total_screen_minutes: 226, social_minutes: 48, shopping_minutes: 18, entertainment_minutes: 71, late_night_screen_minutes: 27, phone_pickups: 53, notifications_received: 80, daylight_minutes: 18, avg_noise_exposure_db: 61, focus_mode_minutes: 16, location_stability_score: 0.84, transit_minutes: 5, headphone_minutes: 61, low_battery_events: 2 },
    { offset: -1, total_screen_minutes: 164, social_minutes: 20, shopping_minutes: 3, entertainment_minutes: 36, late_night_screen_minutes: 12, phone_pickups: 29, notifications_received: 44, daylight_minutes: 62, avg_noise_exposure_db: 50, focus_mode_minutes: 84, location_stability_score: 0.48, transit_minutes: 38, headphone_minutes: 18, low_battery_events: 0 },
    { offset: 0, total_screen_minutes: 274, social_minutes: 63, shopping_minutes: 22, entertainment_minutes: 88, late_night_screen_minutes: 46, phone_pickups: 78, notifications_received: 96, daylight_minutes: 12, avg_noise_exposure_db: 64, focus_mode_minutes: 8, location_stability_score: 0.93, transit_minutes: 4, headphone_minutes: 88, low_battery_events: 2, pluggedHour: 23, pluggedMinute: 12, unpluggedHour: 7, unpluggedMinute: 40 },
  ];
}

export const REVIEW_HEALTH = {
  steps: 12480,
  activeEnergyKcal: 640,
  sleepHours: 7.4,
  workouts: 3,
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
