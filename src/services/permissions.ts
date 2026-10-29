import { requestHealthKitAuthorization, getHealthKitAvailability } from './healthkit';
import { getLocationPermissionStatus, requestLocationPermission } from './location';
import { getAudioPermissionStatus } from './audio';
import { getPlaidAvailability } from './plaid';

export type PermissionState = 'granted' | 'pending' | 'denied' | 'unavailable';

export type PermissionSnapshot = {
  state: PermissionState;
  canAskAgain: boolean;
  detail?: string;
};

export type AllPermissions = {
  healthkit: PermissionSnapshot;
  location: PermissionSnapshot;
  microphone: PermissionSnapshot;
  notifications: PermissionSnapshot;
  plaid: PermissionSnapshot;
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

function mapExpoStatus(status?: string, canAskAgain = true): PermissionSnapshot {
  if (status === 'granted') {
    return snapshot('granted', false);
  }
  if (status === 'denied') {
    return snapshot(canAskAgain ? 'pending' : 'denied', canAskAgain);
  }
  if (status === 'undetermined' || !status) {
    return snapshot('pending', true);
  }
  return snapshot('unavailable', false);
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
  const [healthkit, location, microphone, notifications, plaid] = await Promise.all([
    getHealthKitAvailability(),
    getLocationPermissionStatus(),
    getAudioPermissionStatus({ requestIfNeeded: false }),
    checkNotificationPermission(),
    getPlaidAvailability(),
  ]);

  return {
    healthkit,
    location: mapExpoStatus(location.status, location.canAskAgain),
    microphone: mapMicrophonePermission(microphone),
    notifications,
    plaid: plaid.available
      ? snapshot('granted', false, 'Plaid Link native module is present.')
      : snapshot('unavailable', false, plaid.error ?? 'Plaid Link is not linked in this binary.'),
  };
}

export async function requestPermissionSequence() {
  const healthkit = await requestHealthKitAuthorization().then(async (result) => {
    if (!result.available) {
      return snapshot('unavailable', false, 'HealthKit is not available on this device.');
    }
    return snapshot(result.authorized ? 'granted' : 'pending', !result.authorized);
  }).catch(() => snapshot('unavailable', false));

  const locationGranted = await requestLocationPermission().catch(() => false);
  const location = locationGranted
    ? snapshot('granted')
    : (await getLocationPermissionStatus().then((status) =>
        mapExpoStatus(status.status, status.canAskAgain)
      ).catch(() => snapshot('unavailable', false)));

  const microphone = await getAudioPermissionStatus({ requestIfNeeded: true })
    .then(mapMicrophonePermission)
    .catch(() => snapshot('unavailable', false));

  const notifications = await requestNotificationPermission();

  const plaid = await getPlaidAvailability().then((status) =>
    status.available
      ? snapshot('granted', false, 'Plaid Link native module is present.')
      : snapshot('unavailable', false, status.error ?? undefined)
  );

  return {
    healthkit,
    location,
    microphone,
    notifications,
    plaid,
  } satisfies AllPermissions;
}
