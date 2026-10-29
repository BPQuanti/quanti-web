import { useEffect, useState } from 'react';
import type { LocationObject, LocationSubscription } from 'expo-location';

type LocationModule = typeof import('expo-location');

async function loadLocation(): Promise<LocationModule | null> {
  try {
    return await import('expo-location');
  } catch {
    return null;
  }
}

export async function getLocationPermissionStatus() {
  try {
    const Location = await loadLocation();
    if (!Location) {
      return { status: 'unavailable' as const, canAskAgain: false, granted: false };
    }

    const current = await Location.getForegroundPermissionsAsync();
    return {
      status: current.status,
      canAskAgain: Boolean(current.canAskAgain),
      granted: current.status === 'granted',
    };
  } catch {
    return { status: 'unavailable' as const, canAskAgain: false, granted: false };
  }
}

export async function ensureForegroundLocation() {
  try {
    const Location = await loadLocation();
    if (!Location) {
      return false;
    }

    const current = await Location.getForegroundPermissionsAsync();
    if (current.status === 'granted') {
      return true;
    }

    const next = await Location.requestForegroundPermissionsAsync();
    return next.status === 'granted';
  } catch {
    return false;
  }
}

export async function requestLocationPermission() {
  return ensureForegroundLocation();
}

export async function getCurrentLocation(options?: { requestIfNeeded?: boolean }) {
  try {
    const granted =
      options?.requestIfNeeded === false
        ? (await getLocationPermissionStatus()).granted
        : await ensureForegroundLocation();
    if (!granted) {
      return null;
    }

    const Location = await loadLocation();
    if (!Location) {
      return null;
    }

    return await Location.getCurrentPositionAsync({});
  } catch {
    return null;
  }
}

export async function getCurrentPositionAsync() {
  return getCurrentLocation();
}

export async function startLocationWatcher(
  onUpdate: (position: LocationObject) => void,
  onError?: (message: string) => void
) {
  let subscription: LocationSubscription | null = null;
  let cancelled = false;

  const teardown = () => {
    cancelled = true;
    try {
      subscription?.remove();
    } catch {
      // Native watcher may already be gone in Expo Go / unlinked builds.
    }
    subscription = null;
  };

  try {
    const granted = await ensureForegroundLocation();
    if (!granted || cancelled) {
      return teardown;
    }

    const Location = await loadLocation();
    if (!Location || cancelled) {
      return teardown;
    }

    subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced },
      (position) => {
        if (!cancelled) {
          onUpdate(position);
        }
      },
      (message) => {
        if (!cancelled) {
          onError?.(String(message));
        }
      }
    );

    if (cancelled) {
      teardown();
    }
  } catch (error) {
    onError?.(error instanceof Error ? error.message : 'Location watcher failed.');
    teardown();
  }

  return teardown;
}

export function useLocationWatcher(enabled = true) {
  const [position, setPosition] = useState<LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;
    let teardown: (() => void) | undefined;

    (async () => {
      const granted = await ensureForegroundLocation();
      if (!granted || cancelled) {
        if (!granted && !cancelled) {
          setError('Location permission is not granted.');
        }
        return;
      }

      const stop = await startLocationWatcher(
        (next) => setPosition(next),
        (message) => setError(message)
      );
      if (cancelled) {
        stop();
        return;
      }
      teardown = stop;
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [enabled]);

  return { position, error };
}
