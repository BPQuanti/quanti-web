import * as Location from 'expo-location';

export async function getCurrentLocation() {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      return {
        ok: false,
        latitude: null,
        longitude: null,
        city: null,
        isPermissionGranted: false,
        error: 'Location permission was denied. Enable it in system settings to verify local fitness activities.',
      };
    }

    if (typeof Location.getProviderStatusAsync === 'function') {
      const provider = await Location.getProviderStatusAsync();
      if (provider && provider.locationServicesEnabled === false) {
        return {
          ok: false,
          latitude: null,
          longitude: null,
          city: null,
          isPermissionGranted: true,
          error: 'Location services are turned off on this device.',
        };
      }
    }

    const position = await Location.getCurrentPositionAsync({});
    const latitude = position?.coords?.latitude;
    const longitude = position?.coords?.longitude;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return {
        ok: false,
        latitude: null,
        longitude: null,
        city: null,
        isPermissionGranted: false,
        error: 'Location is unavailable right now.',
      };
    }

    return {
      ok: true,
      latitude,
      longitude,
      city: await resolveCity(latitude, longitude),
      isPermissionGranted: true,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      latitude: null,
      longitude: null,
      city: null,
      isPermissionGranted: false,
      error: error?.message ? String(error.message) : 'Unable to fetch the current location.',
    };
  }
}

async function resolveCity(latitude, longitude) {
  try {
    if (typeof Location.reverseGeocodeAsync !== 'function') {
      return null;
    }
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    const place = places?.[0];
    return place?.city || place?.subregion || place?.region || null;
  } catch {
    return null;
  }
}
