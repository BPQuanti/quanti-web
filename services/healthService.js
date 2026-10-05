import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

const MOCK_STEPS = 7420;
const MOCK_ACTIVE_ENERGY_KCAL = 340;

const MOCK_RESULT = {
  steps: MOCK_STEPS,
  activeEnergyKcal: MOCK_ACTIVE_ENERGY_KCAL,
  source: 'mock',
  badge: 'Mock Data (Expo Go)',
  status: 'Using mock HealthKit data',
};

function isExpoGo() {
  const ownership = Constants.appOwnership;
  const environment = Constants.executionEnvironment;

  return (
    ownership === 'expo' ||
    ownership === Constants.AppOwnership?.Expo ||
    (environment === ExecutionEnvironment.StoreClient && ownership === 'expo')
  );
}

function canUseNativeHealthKit() {
  if (isExpoGo()) {
    return false;
  }
  if (Platform.OS !== 'ios') {
    return false;
  }
  return (
    environmentIsNativeBuild() ||
    environmentIsStandaloneOrBare()
  );
}

function environmentIsStandaloneOrBare() {
  const environment = Constants.executionEnvironment;
  return (
    environment === ExecutionEnvironment.Standalone ||
    environment === ExecutionEnvironment.Bare
  );
}

function environmentIsNativeBuild() {
  // Custom EAS / expo-dev-client builds report StoreClient, but are not Expo Go.
  return (
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient &&
    Constants.appOwnership !== 'expo' &&
    Constants.appOwnership !== Constants.AppOwnership?.Expo
  );
}

export function isUsingMockHealthData() {
  return !canUseNativeHealthKit();
}

export function getHealthDataSourceBadge() {
  return isUsingMockHealthData() ? 'Mock Data (Expo Go)' : 'Live HealthKit Data';
}

function loadAppleHealthKit() {
  try {
    // Loaded only on native iOS builds so Expo Go never touches the native module.
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    const loaded = require('react-native-health');
    return loaded?.default ?? loaded;
  } catch {
    return null;
  }
}

function requestHealthPermissions(AppleHealthKit) {
  const permissions = AppleHealthKit?.Constants?.Permissions || {};
  const options = {
    permissions: {
      read: [
        permissions.Steps || 'Steps',
        permissions.ActiveEnergyBurned || 'ActiveEnergyBurned',
      ],
      write: [],
    },
  };

  return new Promise((resolve, reject) => {
    if (typeof AppleHealthKit?.initHealthKit !== 'function') {
      reject(new Error('HealthKit is not available on this build.'));
      return;
    }
    AppleHealthKit.initHealthKit(options, (error) => {
      if (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
        return;
      }
      resolve();
    });
  });
}

function getStepCount(AppleHealthKit) {
  return new Promise((resolve, reject) => {
    if (typeof AppleHealthKit?.getStepCount !== 'function') {
      reject(new Error('getStepCount is not available.'));
      return;
    }
    AppleHealthKit.getStepCount({ date: new Date().toISOString() }, (error, results) => {
      if (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
        return;
      }
      resolve(results?.value ?? 0);
    });
  });
}

function getActiveEnergy(AppleHealthKit) {
  return new Promise((resolve) => {
    if (typeof AppleHealthKit?.getActiveEnergyBurned !== 'function') {
      resolve(null);
      return;
    }
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    AppleHealthKit.getActiveEnergyBurned(
      {
        startDate: start.toISOString(),
        endDate: today.toISOString(),
      },
      (error, results) => {
        if (error) {
          resolve(null);
          return;
        }
        const samples = Array.isArray(results) ? results : [];
        const total = samples.reduce((sum, sample) => sum + (Number(sample?.value) || 0), 0);
        resolve(total || results?.value || 0);
      }
    );
  });
}

export async function getHealthData() {
  try {
    if (!canUseNativeHealthKit()) {
      return { ...MOCK_RESULT };
    }

    const AppleHealthKit = loadAppleHealthKit();
    if (!AppleHealthKit) {
      return {
        ...MOCK_RESULT,
        status: 'Native HealthKit module missing; using mock data',
      };
    }

    await requestHealthPermissions(AppleHealthKit);
    const [steps, activeEnergyKcal] = await Promise.all([
      getStepCount(AppleHealthKit),
      getActiveEnergy(AppleHealthKit),
    ]);

    return {
      steps: Number(steps) || 0,
      activeEnergyKcal: Number(activeEnergyKcal) || 0,
      source: 'healthkit',
      badge: 'Live HealthKit Data',
      status: 'Synced',
    };
  } catch (error) {
    return {
      ...MOCK_RESULT,
      status: 'HealthKit unavailable; using mock data',
      error: error?.message ? String(error.message) : String(error),
    };
  }
}

export async function fetchHealthData() {
  return getHealthData();
}
