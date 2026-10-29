import { requestHealthKitAuthorization, getHealthKitAvailability } from './healthkit';
import { getAudioPermissionStatus } from './audio';

export type PermissionState = 'granted' | 'pending' | 'denied' | 'unavailable';

export type PermissionSnapshot = {
  state: PermissionState;
  canAskAgain: boolean;
  detail?: string;
};

export type AllPermissions = {
  healthkit: PermissionSnapshot;
  microphone: PermissionSnapshot;
  notifications: PermissionSnapshot;
};

function snapshot(
  state: PermissionState,
  canAskAgain = false,
  detail?: string
): PermissionSnapshot {
  return { state, canAskAgain, detail };
}

function mapMicrophonePermission(status: {
  granted: boolean;
  available: boolean;
  canAskAgain: boolean;
  status?: string;
  error?: string | null;
}): PermissionSnapshot {
  if (status.granted || status.status === 'granted') {
    return snapshot('granted');
  }
  if (!status.available) {
    return snapshot('unavailable', true, status.error ?? 'Microphone permission is not available in this build.');
  }
  if (status.status === 'denied') {
    return snapshot(
      'denied',
      Boolean(status.canAskAgain),
      status.error ??
        'This install cannot prompt for the microphone until it is rebuilt with NSMicrophoneUsageDescription.',
    );
  }
  return snapshot('pending', true);
}

async function loadNotifications() {
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

export async function checkNotificationPermission(): Promise<PermissionSnapshot> {
  try {
    const Notifications = await loadNotifications();
    if (!Notifications) {
      return snapshot('unavailable', false, 'Notifications native module is not linked.');
    }

    const settings = await Notifications.getPermissionsAsync();
    const iosStatus = settings.ios?.status;
    const granted =
      settings.granted ||
      iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (granted) {
      return snapshot('granted', false);
    }
    if (iosStatus === Notifications.IosAuthorizationStatus.DENIED || settings.status === 'denied') {
      return snapshot(settings.canAskAgain ? 'pending' : 'denied', Boolean(settings.canAskAgain));
    }
    return snapshot('pending', true);
  } catch {
    return snapshot('unavailable', false);
  }
}

export async function requestNotificationPermission(): Promise<PermissionSnapshot> {
  try {
    const Notifications = await loadNotifications();
    if (!Notifications) {
      return snapshot('unavailable', false, 'Notifications native module is not linked.');
    }

    const settings = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    const granted =
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (granted) {
      return snapshot('granted', false);
    }
    return snapshot(settings.canAskAgain ? 'pending' : 'denied', Boolean(settings.canAskAgain));
  } catch {
    return snapshot('unavailable', false);
  }
}

export async function checkAllPermissions(): Promise<AllPermissions> {
  const [healthkit, microphone, notifications] = await Promise.all([
    getHealthKitAvailability(),
    getAudioPermissionStatus({ requestIfNeeded: false }),
    checkNotificationPermission(),
  ]);

  return {
    healthkit,
    microphone: mapMicrophonePermission(microphone),
    notifications,
  };
}

export async function requestPermissionSequence() {
  const healthkit = await requestHealthKitAuthorization().then(async (result) => {
    if (!result.available) {
      return snapshot('unavailable', false, 'HealthKit is not available on this device.');
    }
    return snapshot(result.authorized ? 'granted' : 'pending', !result.authorized);
  }).catch(() => snapshot('unavailable', false));

  const microphone = await getAudioPermissionStatus({ requestIfNeeded: true })
    .then(mapMicrophonePermission)
    .catch(() => snapshot('unavailable', false));

  const notifications = await requestNotificationPermission();

  return {
    healthkit,
    microphone,
    notifications,
  } satisfies AllPermissions;
}
