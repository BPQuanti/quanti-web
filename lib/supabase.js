import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const CHUNK_SIZE = 1800;

function chunkKey(key, index) {
  return `${key}.chunk.${index}`;
}

async function secureStoreAvailable() {
  try {
    return Platform.OS !== 'web' && (await SecureStore.isAvailableAsync());
  } catch {
    return false;
  }
}

const ExpoAuthStorage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(key) ?? null;
    }
    try {
      if (await secureStoreAvailable()) {
        const countRaw = await SecureStore.getItemAsync(`${key}.chunks`);
        if (countRaw) {
          const count = Number(countRaw);
          const pieces = [];
          for (let i = 0; i < count; i += 1) {
            pieces.push((await SecureStore.getItemAsync(chunkKey(key, i))) || '');
          }
          return pieces.join('');
        }
        const secureValue = await SecureStore.getItemAsync(key);
        if (secureValue != null) {
          return secureValue;
        }
      }
    } catch (error) {
      console.log('SecureStore getItem failed, using AsyncStorage', error);
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.log('Auth storage getItem failed', error);
      return null;
    }
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, value);
      return;
    }
    try {
      if (await secureStoreAvailable()) {
        if (value.length < CHUNK_SIZE) {
          await SecureStore.setItemAsync(key, value);
        } else {
          const chunks = [];
          for (let i = 0; i < value.length; i += CHUNK_SIZE) {
            chunks.push(value.slice(i, i + CHUNK_SIZE));
          }
          await SecureStore.setItemAsync(`${key}.chunks`, String(chunks.length));
          await Promise.all(
            chunks.map((chunk, index) => SecureStore.setItemAsync(chunkKey(key, index), chunk))
          );
        }
        return;
      }
    } catch (error) {
      console.log('SecureStore setItem failed, using AsyncStorage', error);
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.log('Auth storage setItem failed', error);
    }
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(key);
      return;
    }
    try {
      if (await secureStoreAvailable()) {
        const countRaw = await SecureStore.getItemAsync(`${key}.chunks`);
        if (countRaw) {
          const count = Number(countRaw);
          await Promise.all([
            SecureStore.deleteItemAsync(`${key}.chunks`),
            ...Array.from({ length: count }, (_, index) =>
              SecureStore.deleteItemAsync(chunkKey(key, index))
            ),
          ]);
        }
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.log('SecureStore removeItem failed', error);
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.log('Auth storage removeItem failed', error);
    }
  },
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    supabaseAnonKey !== 'your-anon-key'
);

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
  auth: {
    storage: ExpoAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
