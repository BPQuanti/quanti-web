import { Platform } from 'react-native';

const SLEEP_TYPE = 'HKCategoryTypeIdentifierSleepAnalysis' as const;
const HRV_TYPE = 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN' as const;
const READ_TYPES = [SLEEP_TYPE, HRV_TYPE] as const;

type HealthKitModule = typeof import('@kingstinct/react-native-healthkit');

export type HealthKitQueryResult = {
  available: boolean;
  authorized: boolean;
  sleepSamples: readonly unknown[];
  hrvSamples: readonly unknown[];
};

async function loadHealthKit(): Promise<HealthKitModule | null> {
  if (Platform.OS !== 'ios') {
    return null;
  }

  try {
    return await import('@kingstinct/react-native-healthkit');
  } catch {
    return null;
  }
}

function isHealthDataAvailable(healthkit: HealthKitModule) {
  try {
    if (typeof healthkit.isHealthDataAvailable === 'function' && !healthkit.isHealthDataAvailable()) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

async function ensureHealthStore(healthkit: HealthKitModule) {
  if (!isHealthDataAvailable(healthkit)) {
    return false;
  }
  try {
    return await healthkit.isHealthDataAvailableAsync();
  } catch {
    return false;
  }
}

async function isAuthorizedForRead(healthkit: HealthKitModule) {
  try {
    const status = await healthkit.getRequestStatusForAuthorization({
      toRead: [...READ_TYPES],
    });
    return status === 2;
  } catch {
    return false;
  }
}

export async function getHealthKitAvailability() {
  try {
    const healthkit = await loadHealthKit();
    if (!healthkit) {
      return {
        state: 'unavailable',
        canAskAgain: false,
        detail: 'HealthKit native module is not linked.',
      };
    }

    const available = await ensureHealthStore(healthkit);
    if (!available) {
      return {
        state: 'unavailable',
        canAskAgain: false,
        detail: 'HKHealthStore.isHealthDataAvailable() returned false.',
      };
    }

    const authorized = await isAuthorizedForRead(healthkit);
    return authorized
      ? { state: 'granted', canAskAgain: false }
      : { state: 'pending', canAskAgain: true };
  } catch {
    return { state: 'unavailable', canAskAgain: false };
  }
}

export async function requestHealthKitAuthorization() {
  try {
    const healthkit = await loadHealthKit();
    if (!healthkit) {
      return { available: false, authorized: false };
    }

    const available = await ensureHealthStore(healthkit);
    if (!available) {
      return { available: false, authorized: false };
    }

    const authorized = await healthkit.requestAuthorization({
      toRead: [...READ_TYPES],
    });

    return { available: true, authorized: Boolean(authorized) };
  } catch {
    return { available: false, authorized: false };
  }
}

async function authorizeThen<T>(run: (healthkit: HealthKitModule) => Promise<T>) {
  try {
    const healthkit = await loadHealthKit();
    if (!healthkit) {
      return null;
    }

    const available = await ensureHealthStore(healthkit);
    if (!available) {
      return null;
    }

    if (!(await isAuthorizedForRead(healthkit))) {
      const authorized = await healthkit.requestAuthorization({
        toRead: [...READ_TYPES],
      });
      if (!authorized) {
        return null;
      }
    }

    return await run(healthkit);
  } catch {
    return null;
  }
}

export async function queryQuantitySamplesSafe() {
  return authorizeThen((healthkit) =>
    healthkit.queryQuantitySamples(HRV_TYPE, {
      limit: 20,
      ascending: false,
    })
  );
}

export async function queryCategorySamplesSafe() {
  return authorizeThen((healthkit) =>
    healthkit.queryCategorySamples(SLEEP_TYPE, {
      limit: 20,
      ascending: false,
    })
  );
}

export async function querySleepAndHrv(): Promise<HealthKitQueryResult | null> {
  return authorizeThen(async (healthkit) => {
    const [sleepSamples, hrvSamples] = await Promise.all([
      healthkit.queryCategorySamples(SLEEP_TYPE, { limit: 20, ascending: false }),
      healthkit.queryQuantitySamples(HRV_TYPE, { limit: 20, ascending: false }),
    ]);

    return {
      available: true,
      authorized: true,
      sleepSamples,
      hrvSamples,
    };
  });
}

export async function fetchSleepAndHRV() {
  try {
    const healthkit = await loadHealthKit();
    if (!healthkit) {
      return null;
    }

    const available = await ensureHealthStore(healthkit);
    if (!available || !(await isAuthorizedForRead(healthkit))) {
      return null;
    }

    const [sleepSamples, hrvSamples] = await Promise.all([
      healthkit.queryCategorySamples(SLEEP_TYPE, { limit: 20, ascending: false }),
      healthkit.queryQuantitySamples(HRV_TYPE, { limit: 20, ascending: false }),
    ]);

    return {
      available: true,
      authorized: true,
      sleepSamples,
      hrvSamples,
    } satisfies HealthKitQueryResult;
  } catch {
    return null;
  }
}
