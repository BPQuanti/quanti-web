import type { Duel } from '../../hooks/useDuels';
import type { Friend, FriendRequest } from '../../hooks/useFriends';
import type { PublicPlayer } from '../../hooks/usePublicBoard';
import { matchSides, type DuelDay } from './momentum';

const WON_DUEL_YOU: DuelDay[] = ['verified', 'verified', 'verified'];
const WON_DUEL_THEM: DuelDay[] = ['verified', 'verified', 'missed'];

export function reviewDuelPurse() {
  return buildReviewSocial()
    .duels.filter((duel) => duel.status === 'completed')
    .reduce((sum, duel) => sum + matchSides(duel).purse, 0);
}

const STRANGER_QUEUE = [
  { userId: 'sample-public-rina', username: 'rina.sol', momentumScore: 860, waitedMs: 4000 },
  { userId: 'sample-public-juniper', username: 'juniper', momentumScore: 2180, waitedMs: 50000 },
  { userId: 'sample-public-theo', username: 'theo', momentumScore: 140, waitedMs: 140000 },
];

export function closestStranger(busyIds: string[]) {
  return STRANGER_QUEUE.filter((player) => !busyIds.includes(player.userId)).sort((a, b) => a.waitedMs - b.waitedMs)[0] ?? null;
}

export function reviewWinCount() {
  return buildReviewSocial()
    .duels.filter((duel) => duel.status === 'completed' && matchSides(duel).purse > 0)
    .length;
}

function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function shift(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

export type ReviewSocial = {
  friends: Friend[];
  requests: FriendRequest[];
  duels: Duel[];
  publicPlayers: PublicPlayer[];
};

const CROWD_STEMS = [
  'nova', 'pixel', 'lumen', 'orbit', 'cedar', 'milo', 'wren', 'sora', 'nile', 'quinn',
  'harper', 'jules', 'rowan', 'ember', 'sol', 'indie', 'fox', 'reed', 'blake', 'ash',
  'winter', 'comet', 'ivy', 'opal', 'finch', 'harbor', 'moss', 'vale', 'poet', 'river',
  'skye', 'jade', 'north', 'west', 'elo', 'remy', 'tao', 'nico', 'sloan', 'marlow',
];

function buildGlobalCrowd(since: (days: number) => string): PublicPlayer[] {
  const named: PublicPlayer[] = [
    { userId: 'sample-public-ada', username: 'ada.quinn', momentumScore: 18420, memberSince: since(820), wins: 41 },
    { userId: 'sample-public-kai', username: 'kai_m', momentumScore: 6240, memberSince: since(548), wins: 18 },
    { userId: 'sample-public-juniper', username: 'juniper', momentumScore: 2180, memberSince: since(334), wins: 7 },
    { userId: 'sample-public-rina', username: 'rina.sol', momentumScore: 860, memberSince: since(152), wins: 2 },
    { userId: 'sample-public-theo', username: 'theo', momentumScore: 140, memberSince: since(21), wins: 0 },
  ];
  const crowd: PublicPlayer[] = Array.from({ length: 96 }, (_, index) => {
    const stem = CROWD_STEMS[index % CROWD_STEMS.length];
    const suffix = Math.floor(index / CROWD_STEMS.length);
    const score = Math.max(18, Math.round(15000 * Math.pow(0.95, index)));
    const days = Math.max(12, Math.round(score / 18));
    return {
      userId: `sample-public-crowd-${index}`,
      username: suffix ? `${stem}.${suffix}` : `${stem}_q`,
      momentumScore: score,
      memberSince: since(days),
      wins: Math.max(0, Math.round(score / 480)),
    };
  });
  return [...named, ...crowd];
}

export function isSampleId(id: string) {
  return id.startsWith('sample-');
}

export function buildReviewSocial(): ReviewSocial {
  const today = shift(0);
  const inSeven = shift(7);
  const friends: Friend[] = [
    {
      friendshipId: 'sample-friend-nora',
      userId: 'sample-friend-nora',
      username: 'nora_k',
      avatarUrl: null,
      momentumScore: 86,
      currentStreak: 6,
    },
    {
      friendshipId: 'sample-friend-miles',
      userId: 'sample-friend-miles',
      username: 'miles.park',
      avatarUrl: null,
      momentumScore: 74,
      currentStreak: 3,
    },
    {
      friendshipId: 'sample-friend-jules',
      userId: 'sample-friend-jules',
      username: 'jules',
      avatarUrl: null,
      momentumScore: 61,
      currentStreak: 2,
    },
  ];
  const requests: FriendRequest[] = [
    {
      friendshipId: 'sample-request-avery',
      userId: 'sample-request-avery',
      username: 'avery.chen',
      direction: 'incoming',
    },
    {
      friendshipId: 'sample-request-sam',
      userId: 'sample-request-sam',
      username: 'sam_okafor',
      direction: 'outgoing',
    },
  ];
  const duels: Duel[] = [
    {
      id: 'sample-duel-won',
      challengerId: 'you',
      opponentId: 'sample-public-theo',
      challengerName: 'you',
      opponentName: 'theo',
      challengerScore: 250,
      opponentScore: 140,
      challengerVerified: WON_DUEL_YOU.filter((day) => day === 'verified').length,
      opponentVerified: WON_DUEL_THEM.filter((day) => day === 'verified').length,
      challengerDays: WON_DUEL_YOU,
      opponentDays: WON_DUEL_THEM,
      status: 'completed',
      startDate: shift(-3),
      endDate: shift(0),
      durationDays: 3,
      winnerId: 'you',
      createdAt: today,
      youAreOpponent: false,
    },
    {
      id: 'sample-duel-won-jules',
      challengerId: 'you',
      opponentId: 'sample-friend-jules',
      challengerName: 'you',
      opponentName: 'jules',
      challengerScore: 250,
      opponentScore: 61,
      challengerVerified: 2,
      opponentVerified: 1,
      challengerDays: ['verified', 'verified'],
      opponentDays: ['verified'],
      status: 'completed',
      startDate: shift(-18),
      endDate: shift(-16),
      durationDays: 2,
      winnerId: 'you',
      createdAt: today,
      youAreOpponent: false,
    },
    {
      id: 'sample-duel-tie',
      challengerId: 'sample-friend-miles',
      opponentId: 'you',
      challengerName: 'miles.park',
      opponentName: 'you',
      challengerScore: 74,
      opponentScore: 250,
      challengerVerified: 2,
      opponentVerified: 2,
      challengerDays: ['verified', 'verified'],
      opponentDays: ['verified', 'verified'],
      status: 'completed',
      startDate: shift(-12),
      endDate: shift(-10),
      durationDays: 2,
      winnerId: null,
      createdAt: today,
      youAreOpponent: true,
    },
    {
      id: 'sample-duel-loss',
      challengerId: 'you',
      opponentId: 'sample-public-kai',
      challengerName: 'you',
      opponentName: 'kai_m',
      challengerScore: 250,
      opponentScore: 6240,
      challengerVerified: 1,
      opponentVerified: 2,
      challengerDays: ['verified', 'missed'],
      opponentDays: ['verified', 'verified'],
      status: 'completed',
      startDate: shift(-8),
      endDate: shift(-6),
      durationDays: 2,
      winnerId: 'sample-public-kai',
      createdAt: today,
      youAreOpponent: false,
    },
    {
      id: 'sample-duel-active',
      challengerId: 'you',
      opponentId: 'sample-public-ada',
      challengerName: 'you',
      opponentName: 'ada.quinn',
      challengerScore: 250,
      opponentScore: 18420,
      challengerVerified: 2,
      opponentVerified: 1,
      challengerDays: ['verified', 'verified'],
      opponentDays: ['verified', 'missed'],
      status: 'active',
      startDate: shift(-2),
      endDate: shift(5),
      durationDays: 7,
      winnerId: null,
      createdAt: today,
      youAreOpponent: false,
    },
    {
      id: 'sample-duel-pending',
      challengerId: 'sample-friend-miles',
      opponentId: 'you',
      challengerName: 'miles.park',
      opponentName: 'you',
      challengerScore: 74,
      opponentScore: 250,
      challengerVerified: 0,
      opponentVerified: 0,
      status: 'pending',
      startDate: today,
      endDate: inSeven,
      durationDays: 7,
      winnerId: null,
      createdAt: today,
      youAreOpponent: true,
    },
  ];
  const publicPlayers = buildGlobalCrowd(daysAgo);
  return { friends, requests, duels, publicPlayers };
}
