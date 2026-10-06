import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from './supabase';

const LOCAL_KEYS = [
  '@quanti_health_data',
  '@quanti_plaid_data',
  '@quanti_profile',
  '@quanti_location_data',
  '@quanti_recaps',
  '@quanti_saved_stats',
];

async function clearOnDeviceData() {
  await Promise.all(
    LOCAL_KEYS.map(async (key) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.log('Local purge failed', key, error);
      }
    })
  );
}

async function purgeOnServer(accessToken) {
  const apiBase = process.env.EXPO_PUBLIC_API_URL;
  if (apiBase) {
    const response = await fetch(`${apiBase.replace(/\/$/, '')}/api/user/delete`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success) {
      throw new Error(payload?.message || 'Account deletion was rejected.');
    }
    return payload;
  }

  if (!isSupabaseConfigured) {
    throw new Error('Add the account API URL or Supabase keys before deleting a cloud account.');
  }

  const { data, error } = await supabase.functions.invoke('delete-account', { body: {} });
  if (error) {
    throw new Error(error.message || 'Account deletion failed.');
  }
  if (!data?.success) {
    throw new Error(data?.message || 'Account deletion failed.');
  }
  return data;
}

/**
 * Clears HealthKit and Plaid caches on the device, then asks the server to
 * revoke bank tokens and delete the account. iOS does not let an app switch
 * off the system Health permission; removing the app data is the local step.
 */
export async function deleteAccount(accessToken) {
  if (!accessToken) {
    await clearOnDeviceData();
    return {
      success: false,
      localOnly: true,
      message: 'On-device health and bank data were cleared. Sign in to delete the cloud account.',
    };
  }
  const payload = await purgeOnServer(accessToken);
  await clearOnDeviceData();
  return payload;
}
