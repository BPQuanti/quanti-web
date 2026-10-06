import { useSyncExternalStore } from 'react';
import { getBadge } from '../../components/badges/badgeCatalog';

export type FeedPost = {
  id: string;
  title: string;
  subtitle: string;
  badgeId?: string;
  anonymous?: boolean;
  ogToken?: boolean;
};

const SEED: FeedPost[] = [
  {
    id: 'alex-amazon',
    title: "@alex_v shared 'Top 1% Amazonian' Badge to Instagram Stories",
    subtitle: 'Public share',
    badgeId: 'amazon',
  },
  {
    id: 'og-184',
    title: 'OG Token #184 claimed in Chicago, IL',
    subtitle: 'Founder token',
    ogToken: true,
  },
  {
    id: 'private-marathon',
    title: "A Private Member unlocked & shared 'Desert Marathoner' Badge!",
    subtitle: 'Anonymized',
    anonymous: true,
    badgeId: 'marathon',
  },
];

let privateMode = false;
let handle = 'you';
let posts = SEED;
let snapshot = { privateMode, posts };

const listeners = new Set<() => void>();

function publish() {
  snapshot = { privateMode, posts };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function setShareHandle(nextHandle: string) {
  handle = String(nextHandle || 'you').replace(/^@/, '');
}

export function setPrivateMode(enabled: boolean) {
  privateMode = Boolean(enabled);
  publish();
}

export function onBadgeShared(badgeId: string) {
  const badge = getBadge(badgeId);
  const name = badge?.name || 'Verified';
  const post: FeedPost = privateMode
    ? {
        id: `share-${Date.now()}`,
        title: `A Private Member unlocked & shared '${name}' Badge!`,
        subtitle: 'Anonymized',
        anonymous: true,
      }
    : {
        id: `share-${Date.now()}`,
        title: `@${handle} shared '${name}' Badge to Instagram Stories`,
        subtitle: 'Just now',
        badgeId,
      };
  posts = [post, ...posts];
  publish();
  return { anonymous: privateMode };
}

export function useSocialFeed() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
