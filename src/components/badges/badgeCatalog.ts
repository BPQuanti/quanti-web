export type BadgeGlyph = 'golf' | 'package' | 'flame' | 'takeout';

export type BadgeModel = {
  id: string;
  name: string;
  glyph: BadgeGlyph;
  frontKicker: string;
  frontTitle: string;
  backHeadline: string;
  backDetail: string;
  backKicker: string;
};

export const EARNED_BADGES: BadgeModel[] = [
  {
    id: 'golf',
    name: 'Golf Obsessed',
    glyph: 'golf',
    frontKicker: 'YEAR IN REVIEW',
    frontTitle: '2026 GOLF OBSESSED',
    backHeadline: '73 ROUNDS PLAYED',
    backDetail: '$12,450 Spent • 1.2M Steps',
    backKicker: 'PLAID + HEALTHKIT',
  },
  {
    id: 'amazon',
    name: 'Top 1% Amazonian',
    glyph: 'package',
    frontKicker: 'AMAZON SYNC',
    frontTitle: 'TOP 1% AMAZONIAN',
    backHeadline: '148 PACKAGES',
    backDetail: '$4,820 Spent • 1 order / 2.4 days',
    backKicker: 'PLAID VERIFIED',
  },
  {
    id: 'marathon',
    name: 'Desert Marathoner',
    glyph: 'flame',
    frontKicker: 'STEPS SYNC',
    frontTitle: 'DESERT MARATHONER',
    backHeadline: '2.84M STEPS',
    backDetail: '214 Workouts • Phoenix to Tucson 11x',
    backKicker: 'HEALTHKIT VERIFIED',
  },
  {
    id: 'doordash',
    name: 'VIP Delivery Sponsor',
    glyph: 'takeout',
    frontKicker: 'DOORDASH SYNC',
    frontTitle: 'VIP DELIVERY SPONSOR',
    backHeadline: '186 ORDERS',
    backDetail: '$5,210 Spent • $940 in Fees',
    backKicker: 'PLAID + HEALTHKIT',
  },
];

export function getBadge(badgeId: string) {
  return EARNED_BADGES.find((badge) => badge.id === badgeId) || null;
}
