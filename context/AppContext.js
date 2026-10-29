import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getReviewHealthSnapshot,
  getReviewPlaidSnapshot,
  IS_APP_REVIEW_DEMO,
  setReviewDemoEnabled,
} from '../lib/config/demoMode';
import { isReviewDemoEmail, syncReviewModeFromEmail } from '../src/lib/config/reviewMode';
import { fetchHealthData, isUsingMockHealthData } from '../services/healthService';
import { getCurrentLocation } from '../services/locationService';
import { openPlaidLink } from '../services/plaidService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { displayNameFromAuthUser } from '../src/services/displayName';
import { LEGACY_ASYNC_KEYS } from '../src/services/sessionIsolation';

const STEP_GOAL = 10000;

const STORAGE_KEYS = {
  profile: '@quanti_profile',
  health: '@quanti_health_data',
  location: '@quanti_location_data',
  plaid: '@quanti_plaid_data',
  recaps: '@quanti_recaps',
  savedStats: '@quanti_saved_stats',
  reviewDemo: '@quanti_review_demo',
};

const DEFAULT_PROFILE = {
  name: '',
  username: '',
  bio: '',
  avatarUri: null,
};

const DEFAULT_HEALTH = {
  steps: null,
  activeCalories: null,
  isMock: false,
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

export const DEFAULT_RECAPS = [];

export const DEFAULT_SAVED_STATS = [];

const SEEDED_RECAP_IDS = new Set(['weekly', 'monthly', 'yearly']);
const SEEDED_STAT_IDS = new Set(['stat-golf', 'stat-miles', 'stat-espresso']);

function withoutSeededRows(rows, ids) {
  if (!Array.isArray(rows)) return [];
  return rows.filter((row) => row && !ids.has(String(row.id)));
}

function mergeAuthName(profile, user) {
  const authName = displayNameFromAuthUser(user);
  if (profile?.name) {
    return profile;
  }
  if (!authName) {
    return profile;
  }
  return { ...profile, name: authName };
}

function withoutSeededHealth(health) {
  if (!health || typeof health !== 'object') return null;
  const seededSteps = health.steps === 8420 && health.activeCalories === 412 && !health.lastSynced;
  if (!seededSteps) return health;
  return {
    ...health,
    steps: null,
    activeCalories: null,
    isMock: false,
    status: 'Not synced',
  };
}

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
      full_name: profile.name || null,
      username: profile.username ? String(profile.username).replace(/^@/, '').trim() : null,
      bio: profile.bio || null,
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
  const [reviewDemoEnabled, setReviewDemoState] = useState(IS_APP_REVIEW_DEMO);

  const previousUserId = useRef(undefined);

  useEffect(() => {
    if (previousUserId.current === user?.id) {
      return undefined;
    }
    previousUserId.current = user?.id;
    setUserProfile({
      ...DEFAULT_PROFILE,
      name: displayNameFromAuthUser(user),
    });
    setHealthData(DEFAULT_HEALTH);
    setLocationData(DEFAULT_LOCATION);
    setPlaidData(DEFAULT_PLAID);
    setRecaps(DEFAULT_RECAPS);
    setSavedStats(DEFAULT_SAVED_STATS);
    return undefined;
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [profile, health, location, plaid, recapsStored, statsStored, storedDemo] = await Promise.all([
          readItem(STORAGE_KEYS.profile),
          readItem(STORAGE_KEYS.health),
          readItem(STORAGE_KEYS.location),
          readItem(STORAGE_KEYS.plaid),
          readItem(STORAGE_KEYS.recaps),
          readItem(STORAGE_KEYS.savedStats),
          readItem(STORAGE_KEYS.reviewDemo),
        ]);
        if (cancelled) {
          return;
        }
        const demoOn = IS_APP_REVIEW_DEMO || storedDemo === true;
        setReviewDemoEnabled(demoOn);
        setReviewDemoState(demoOn);
        if (profile && typeof profile === 'object') {
          setUserProfile((current) => {
            if (current?.name) {
              return current;
            }
            return mergeAuthName({ ...DEFAULT_PROFILE, ...profile }, user);
          });
        }
        if (demoOn) {
          const healthSnapshot = getReviewHealthSnapshot();
          const plaidSnapshot = getReviewPlaidSnapshot();
          setHealthData({
            ...DEFAULT_HEALTH,
            steps: healthSnapshot.steps,
            activeCalories: healthSnapshot.activeEnergyKcal,
            sleepHours: healthSnapshot.sleepHours ?? null,
            workouts: healthSnapshot.workouts || null,
            isMock: true,
            status: healthSnapshot.status,
            badge: healthSnapshot.badge,
          });
          setPlaidData({ ...DEFAULT_PLAID, ...plaidSnapshot });
        } else if (health && typeof health === 'object') {
          const cleanedHealth = withoutSeededHealth(health);
          setHealthData({ ...DEFAULT_HEALTH, ...cleanedHealth });
          if (cleanedHealth !== health) {
            void saveItem(STORAGE_KEYS.health, { ...DEFAULT_HEALTH, ...cleanedHealth });
          }
        }
        if (location && typeof location === 'object') {
          setLocationData({ ...DEFAULT_LOCATION, ...location });
        }
        if (!demoOn && plaid && typeof plaid === 'object') {
          setPlaidData({ ...DEFAULT_PLAID, ...plaid });
        }
        if (Array.isArray(recapsStored)) {
          const cleanedRecaps = withoutSeededRows(recapsStored, SEEDED_RECAP_IDS);
          setRecaps(cleanedRecaps);
          if (cleanedRecaps.length !== recapsStored.length) {
            void saveItem(STORAGE_KEYS.recaps, cleanedRecaps);
          }
        }
        if (Array.isArray(statsStored)) {
          const cleanedStats = withoutSeededRows(statsStored, SEEDED_STAT_IDS);
          setSavedStats(cleanedStats);
          if (cleanedStats.length !== statsStored.length) {
            void saveItem(STORAGE_KEYS.savedStats, cleanedStats);
          }
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
      if (error && error.code !== 'PGRST116') {
        console.log('Supabase profile fetch failed', error.message);
        return { data: null, error };
      }
      if (error?.code === 'PGRST116' || !data) {
        const fromAuth = mergeAuthName({ ...DEFAULT_PROFILE }, user);
        if (fromAuth.name) {
          setUserProfile(fromAuth);
          void saveItem(STORAGE_KEYS.profile, fromAuth);
          void persistCloudProfile(user.id, fromAuth);
          return { data: fromAuth, error: null };
        }
        return { data: null, error: null };
      }
      const mapped = mergeAuthName(mapRowToProfile(data), user);
      setUserProfile(mapped);
      void saveItem(STORAGE_KEYS.profile, mapped);
      if (mapped.name && mapped.name !== (data.full_name || data.name || '')) {
        void persistCloudProfile(user.id, mapped);
      }
      return { data: mapped, error: null };
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
        workouts: result.workouts ?? null,
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
        const mocked = result?.source === 'mock' || result?.publicToken === 'mock-public-token-sandbox';
        applyPlaid({
          isConnected: !mocked,
          bankName: mocked ? null : bankName,
          accountBalance: mocked ? null : result?.accountBalance ?? null,
          publicToken: result?.publicToken || null,
          accounts: mocked ? [] : result?.accounts || [],
          status: mocked ? 'Expo Go cannot read a bank balance.' : `Connected · ${bankName}`,
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

  const setReviewDemo = useCallback((enabled) => {
    const next = IS_APP_REVIEW_DEMO || Boolean(enabled);
    setReviewDemoEnabled(next);
    setReviewDemoState(next);
    void saveItem(STORAGE_KEYS.reviewDemo, next);
    if (next) {
      const healthSnapshot = getReviewHealthSnapshot();
      const plaidSnapshot = getReviewPlaidSnapshot();
      applyHealth({
        ...DEFAULT_HEALTH,
        steps: healthSnapshot.steps,
        activeCalories: healthSnapshot.activeEnergyKcal,
        sleepHours: healthSnapshot.sleepHours ?? null,
        workouts: healthSnapshot.workouts || null,
        isMock: true,
        status: healthSnapshot.status,
        badge: healthSnapshot.badge,
        lastSynced: new Date().toISOString(),
      });
      applyPlaid({ ...DEFAULT_PLAID, ...plaidSnapshot });
      return;
    }
    applyHealth(DEFAULT_HEALTH);
    applyPlaid(DEFAULT_PLAID);
  }, [applyHealth, applyPlaid]);

  const previousEmail = useRef(null);

  useEffect(() => {
    const wasReviewLogin = isReviewDemoEmail(previousEmail.current);
    previousEmail.current = user?.email || null;
    syncReviewModeFromEmail(user?.email);
    if (isReviewDemoEmail(user?.email)) {
      setReviewDemo(true);
    } else if (wasReviewLogin) {
      setReviewDemo(false);
    }
  }, [user?.email, setReviewDemo]);

  const resetAppData = useCallback(async () => {
    try {
      await Promise.all(LEGACY_ASYNC_KEYS.map((key) => AsyncStorage.removeItem(key)));
    } catch (error) {
      console.log('AsyncStorage user-data clear failed', error);
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
      reviewDemoEnabled,
      setReviewDemo,
    }),
    [
      userProfile,
      healthData,
      locationData,
      plaidData,
      recaps,
      savedStats,
      reviewDemoEnabled,
      syncHealth,
      syncLocation,
      connectPlaid,
      setHealthMock,
      updateUserProfile,
      fetchUserProfile,
      saveAiStatToForMe,
      resetAppData,
      setReviewDemo,
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
