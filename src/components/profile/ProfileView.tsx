import { useEffect, useState } from 'react';
import { Image, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import { colors, fonts } from '../../../constants/theme';
import { EARNED_BADGES, type BadgeModel } from '../badges/badgeCatalog';
import BadgeModal from '../badges/BadgeModal';
import FlippableBadge from '../badges/FlippableBadge';
import { onBadgeShared, setPrivateMode, setShareHandle, useSocialFeed } from '../../lib/social/feedStore';

type Props = {
  name: string;
  handle: string;
  bio: string;
  avatarUri?: string | null;
  isOwner?: boolean;
  isFollower?: boolean;
  onBadgeShared?: (badgeId: string) => { anonymous?: boolean } | void;
};

function initials(name: string) {
  return (
    String(name || 'Q')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'Q'
  );
}

export default function ProfileView({
  name,
  handle,
  bio,
  avatarUri,
  isOwner = true,
  isFollower = false,
  onBadgeShared: onBadgeSharedProp,
}: Props) {
  const { width } = useWindowDimensions();
  const { privateMode } = useSocialFeed();
  const [openBadge, setOpenBadge] = useState<BadgeModel | null>(null);
  const detailsLocked = privateMode && !isOwner && !isFollower;
  const cardWidth = Math.min(180, Math.floor((width - 52) / 2));

  useEffect(() => {
    setShareHandle(handle);
  }, [handle]);

  const share = (badgeId: string) => {
    if (onBadgeSharedProp) return onBadgeSharedProp(badgeId);
    return onBadgeShared(badgeId);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.avatarRing}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(name)}</Text>
            </View>
          )}
        </View>
        <View style={styles.identity}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.handle}>@{String(handle || '').replace(/^@/, '')}</Text>
          <Text style={styles.bio}>{bio}</Text>
        </View>
      </View>

      <View style={styles.privateRow}>
        <View style={styles.privateCopy}>
          <Text style={styles.privateLabel}>Private Mode</Text>
          <Text style={styles.privateHint}>
            {privateMode
              ? 'Non-followers cannot open badge details. Shares to For You are anonymized.'
              : 'Badges and shares stay public on For You.'}
          </Text>
        </View>
        <Switch
          value={privateMode}
          onValueChange={setPrivateMode}
          disabled={!isOwner}
          trackColor={{ false: '#27272A', true: '#7C3AED' }}
          thumbColor={colors.text}
          accessibilityLabel="Private Mode"
        />
      </View>

      {privateMode ? (
        <View style={styles.privatePill}>
          <Text style={styles.privatePillText}>Profile Private</Text>
        </View>
      ) : null}

      <Text style={styles.section}>Collection</Text>
      <View style={styles.grid}>
        {EARNED_BADGES.map((badge) => (
          <FlippableBadge
            key={badge.id}
            badge={badge}
            width={cardWidth}
            locked={detailsLocked}
            flipped={false}
            onToggle={() => setOpenBadge(badge)}
          />
        ))}
      </View>

      <BadgeModal
        badge={openBadge}
        locked={detailsLocked}
        onClose={() => setOpenBadge(null)}
        onBadgeShared={share}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 8 },
  header: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.7)',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  avatar: {
    flex: 1,
    borderRadius: 36,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 36 },
  avatarText: { color: colors.text, fontFamily: fonts.bold, fontSize: 22 },
  identity: { flex: 1 },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 22 },
  handle: { color: colors.glow, fontFamily: fonts.medium, fontSize: 14, marginTop: 2 },
  bio: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, marginTop: 6 },
  privateRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 16,
    padding: 14,
  },
  privateCopy: { flex: 1 },
  privateLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  privateHint: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 4 },
  privatePill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  privatePillText: { color: '#DDD6FE', fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.4 },
  section: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    marginTop: 22,
    marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
