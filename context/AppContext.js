import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchHealthData, isUsingMockHealthData } from '../services/healthService';
import { getCurrentLocation } from '../services/locationService';
import { openPlaidLink } from '../services/plaidService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const STEP_GOAL = 10000;
const MOCK_BALANCE = 2847.32;

const STORAGE_KEYS = {
  profile: '@quanti_profile',
  health: '@quanti_health_data',
  location: '@quanti_location_data',
  plaid: '@quanti_plaid_data',
  recaps: '@quanti_recaps',
  savedStats: '@quanti_saved_stats',
};

const DEFAULT_PROFILE = {
  name: 'Brian Parr',
  username: 'brian_quanti',
  bio: 'Quantifying daily life | Verified Fitness & Finance',
  avatarUri: null,
};

const DEFAULT_HEALTH = {
  steps: 8420,
  activeCalories: 412,
  isMock: true,
  lastSynced: null,
  status: 'Not synced',
  error: null,
};

const DEFAULT_LOCATION = {
  latitude: null,
  longitude: null,
  city: 'Pending...',
  isPermissionGranted: false,
  error: null,
};

const DEFAULT_PLAID = {
  isConnected: false,
  bankName: null,
  accountBalance: null,
  publicToken: null,
  accounts: [],
  status: 'Bank not connected',
};

export const DEFAULT_RECAPS = [
  {
    id: 'weekly',
    period: 'Weekly Recap',
    range: 'This week',
    headline: '32,450 Steps this week',
    percentile: 'Top 5% Fitness Percentile',
    metrics: ['32,450 steps', '2,180 active kcal', '14 Coffee Trips'],
    emoji: '📊',
  },
  {
    id: 'monthly',
    period: 'Monthly Recap',
    range: 'This month',
    headline: '128,900 Steps this month',
    percentile: 'Top 8% Consistency',
    metrics: ['128,900 steps', '8,640 active kcal', '42 Coffee Trips'],
    emoji: '📅',
  },
  {
    id: 'yearly',
    period: 'Yearly Recap',
    range: '2026 YTD',
    headline: '1.2M Steps in 2026',
    percentile: 'Top 3% Yearly Walker',
    metrics: ['1.24M steps', '94,200 active kcal', '18 Golf Rounds'],
    emoji: '🏆',
  },
];

export const DEFAULT_SAVED_STATS = [
  {
    id: 'stat-golf',
    emoji: '⛳',
    title: 'Golfed 18 Times in 2026',
    subtitle: '18 Rounds of Golf',
    verified: true,
  },
  {
    id: 'stat-miles',
    emoji: '🏃',
    title: '100 Mile Club',
    subtitle: 'Verified distance stamp',
    verified: true,
  },
  {
    id: 'stat-espresso',
    emoji: '☕',
    title: 'Top 2% Espresso Fan',
    subtitle: 'Coffee percentile stamp',
    verified: true,
  },
];

const AppContext = createContext(null);

async function saveItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log('AsyncStorage save failed', key, error);
  }
}

async function readItem(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.log('AsyncStorage read failed', key, error);
    return null;
  }
}

function mapRowToProfile(row) {
  const avatar = row.avatar_url || row.avatar_uri || row.avatarUri || row.avatarUrl || null;
  return {
    name: row.full_name || row.name || row.display_name || DEFAULT_PROFILE.name,
    username: row.username || DEFAULT_PROFILE.username,
    bio: row.bio || DEFAULT_PROFILE.bio,
    avatarUri: avatar,
    avatar_url: avatar,
  };
}

function isCloudUser(user, isDevBypass) {
  if (!user?.id || isDevBypass || user.id === 'dev-user-123') {
    return false;
  }
  return isSupabaseConfigured;
}

async function persistCloudProfile(userId, profile) {
  if (!userId || !isSupabaseConfigured) {
    return { error: null };
  }
  try {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: profile.name,
      username: profile.username,
      bio: profile.bio,
      avatar_url: profile.avatar_url || profile.avatarUri || profile.avatarUrl || null,
      updated_at: new Date(),
    });
    if (error) {
      console.log('Supabase profile upsert failed', error.message);
    }
    return { error };
  } catch (error) {
    console.log('Supabase profile upsert failed', error);
    return { error };
  }
}

export function AppProvider({ children }) {
  const { user, isDevBypass } = useAuth();
  const [healthData, setHealthData] = useState(DEFAULT_HEALTH);
  const [locationData, setLocationData] = useState(DEFAULT_LOCATION);
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
  const [plaidData, setPlaidData] = useState(DEFAULT_PLAID);
  const [recaps, setRecaps] = useState(DEFAULT_RECAPS);
  const [savedStats, setSavedStats] = useState(DEFAULT_SAVED_STATS);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [profile, health, location, plaid, recapsStored, statsStored] = await Promise.all([
          readItem(STORAGE_KEYS.profile),
          readItem(STORAGE_KEYS.health),
          readItem(STORAGE_KEYS.location),
          readItem(STORAGE_KEYS.plaid),
          readItem(STORAGE_KEYS.recaps),
          readItem(STORAGE_KEYS.savedStats),
        ]);
        if (cancelled) {
          return;
        }
        if (profile && typeof profile === 'object') {
          setUserProfile({ ...DEFAULT_PROFILE, ...profile });
        }
        if (health && typeof health === 'object') {
          setHealthData({ ...DEFAULT_HEALTH, ...health });
        }
        if (location && typeof location === 'object') {
          setLocationData({ ...DEFAULT_LOCATION, ...location });
        }
        if (plaid && typeof plaid === 'object') {
          setPlaidData({ ...DEFAULT_PLAID, ...plaid });
        }
        if (Array.isArray(recapsStored) && recapsStored.length) {
          setRecaps(recapsStored);
        }
        if (Array.isArray(statsStored) && statsStored.length) {
          setSavedStats(statsStored);
        }
      } catch (error) {
        console.log('AsyncStorage hydrate failed', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchUserProfile = useCallback(async () => {
    if (!isCloudUser(user, isDevBypass)) {
      return { data: null, error: null };
    }
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        console.log('Supabase profile fetch failed', error.message);
        return { data: null, error };
      }
      if (data) {
        const mapped = mapRowToProfile(data);
        setUserProfile(mapped);
        void saveItem(STORAGE_KEYS.profile, mapped);
        return { data: mapped, error: null };
      }
      return { data: null, error: null };
    } catch (error) {
      console.log('Supabase profile fetch failed', error);
      return { data: null, error };
    }
  }, [user, isDevBypass]);

  useEffect(() => {
    void fetchUserProfile();
  }, [fetchUserProfile]);

  const applyHealth = useCallback((next) => {
    setHealthData(next);
    void saveItem(STORAGE_KEYS.health, next);
  }, []);

  const applyLocation = useCallback((next) => {
    setLocationData(next);
    void saveItem(STORAGE_KEYS.location, next);
  }, []);

  const applyPlaid = useCallback((next) => {
    setPlaidData(next);
    void saveItem(STORAGE_KEYS.plaid, next);
  }, []);

  const syncHealth = useCallback(async () => {
    setHealthData((current) => ({ ...current, status: 'Syncing…', error: null }));
    try {
      const result = await fetchHealthData();
      applyHealth({
        steps: Number(result.steps) || 0,
        activeCalories: Number(result.activeEnergyKcal) || 0,
        isMock: result.source === 'mock' || isUsingMockHealthData(),
        lastSynced: new Date().toISOString(),
        status: result.status || 'Synced',
        error: result.error || null,
        badge: result.badge,
      });
      return result;
    } catch (error) {
      const message = error?.message ? String(error.message) : String(error);
      applyHealth({
        ...DEFAULT_HEALTH,
        lastSynced: new Date().toISOString(),
        status: 'Using mock HealthKit data',
        error: message,
        badge: 'Mock Data (Expo Go)',
      });
      return null;
    }
  }, [applyHealth]);

  const syncLocation = useCallback(async () => {
    setLocationData((current) => ({
      ...current,
      city: current.city === 'Pending...' ? 'Locating...' : current.city,
      error: null,
    }));
    const result = await getCurrentLocation();
    if (!result.ok) {
      applyLocation({
        latitude: null,
        longitude: null,
        city: 'Permission needed',
        isPermissionGranted: Boolean(result.isPermissionGranted),
        error: result.error || 'Unable to read GPS coordinates.',
      });
      return result;
    }

    applyLocation({
      latitude: result.latitude,
      longitude: result.longitude,
      city: result.city || 'Current location',
      isPermissionGranted: true,
      error: null,
    });
    return result;
  }, [applyLocation]);

  const updateUserProfile = useCallback((newProfileData) => {
    setUserProfile((current) => {
      const updated = {
        ...current,
        ...newProfileData,
        avatarUri: newProfileData.avatarUri ?? newProfileData.avatar_url ?? newProfileData.avatarUrl ?? current.avatarUri,
        avatar_url: newProfileData.avatar_url ?? newProfileData.avatarUrl ?? newProfileData.avatarUri ?? current.avatar_url,
      };
      void saveItem(STORAGE_KEYS.profile, updated);
      if (isCloudUser(user, isDevBypass)) {
        void persistCloudProfile(user.id, updated);
      }
      return updated;
    });
  }, [user, isDevBypass]);

  const setHealthMock = useCallback((isMock) => {
    setHealthData((current) => {
      const updated = {
        ...current,
        isMock,
        badge: isMock ? 'Mock Data (Expo Go)' : 'Live HealthKit Data',
      };
      void saveItem(STORAGE_KEYS.health, updated);
      return updated;
    });
  }, []);

  const connectPlaid = useCallback(async () => {
    setPlaidData((current) => ({ ...current, status: 'Opening Plaid Link…' }));
    await openPlaidLink({
      onSuccess: (result) => {
        const bankName = result?.institution?.name || 'Sandbox bank';
        applyPlaid({
          isConnected: true,
          bankName,
          accountBalance: MOCK_BALANCE,
          publicToken: result?.publicToken || null,
          accounts: result?.accounts || [],
          status: `Connected · ${bankName}`,
        });
      },
      onExit: (exit) => {
        setPlaidData((current) => {
          if (current.isConnected) {
            return current;
          }
          const updated = {
            ...current,
            status: exit?.error ? String(exit.error) : 'Plaid Link closed',
          };
          void saveItem(STORAGE_KEYS.plaid, updated);
          return updated;
        });
      },
    });
  }, [applyPlaid]);

  const saveAiStatToForMe = useCallback((statObject = {}) => {
    const stamp = {
      id: statObject.id || `stat-${Date.now()}`,
      emoji: statObject.emoji || '✨',
      title: statObject.title || 'Verified Quanti stat',
      subtitle: statObject.subtitle || statObject.title || 'Saved from Quanti AI',
      verified: true,
      sourceMessageId: statObject.sourceMessageId || null,
    };
    setSavedStats((current) => {
      const exists = current.some(
        (item) =>
          item.id === stamp.id ||
          (stamp.sourceMessageId && item.sourceMessageId === stamp.sourceMessageId) ||
          item.title === stamp.title
      );
      if (exists) {
        return current;
      }
      const updated = [stamp, ...current];
      void saveItem(STORAGE_KEYS.savedStats, updated);
      return updated;
    });
    return stamp;
  }, []);

  const resetAppData = useCallback(async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.log('AsyncStorage clear failed', error);
    }
    setUserProfile(DEFAULT_PROFILE);
    setHealthData(DEFAULT_HEALTH);
    setLocationData(DEFAULT_LOCATION);
    setPlaidData(DEFAULT_PLAID);
    setRecaps(DEFAULT_RECAPS);
    setSavedStats(DEFAULT_SAVED_STATS);
  }, []);

  const value = useMemo(
    () => ({
      userProfile,
      healthData,
      locationData,
      plaidData,
      recaps,
      savedStats,
      stepGoal: STEP_GOAL,
      syncHealth,
      syncLocation,
      connectPlaid,
      setHealthMock,
      updateUserProfile,
      fetchUserProfile,
      saveAiStatToForMe,
      resetAppData,
    }),
    [
      userProfile,
      healthData,
      locationData,
      plaidData,
      recaps,
      savedStats,
      syncHealth,
      syncLocation,
      connectPlaid,
      setHealthMock,
      updateUserProfile,
      fetchUserProfile,
      saveAiStatToForMe,
      resetAppData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return value;
}

export { AppContext };
