import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../../constants/theme';
import { getBadge, type BadgeModel } from '../badges/badgeCatalog';
import BadgeModal from '../badges/BadgeModal';
import FlippableBadge from '../badges/FlippableBadge';
import { onBadgeShared, useSocialFeed, type FeedPost } from '../../lib/social/feedStore';

function OgToken() {
  return (
    <View style={styles.tokenWrap}>
      <View style={styles.token}>
        <Text style={styles.tokenKicker}>OG FOUNDER</Text>
        <Text style={styles.tokenNumber}>#184</Text>
        <Text style={styles.tokenCity}>CHICAGO, IL</Text>
      </View>
    </View>
  );
}

function PostCard({ post, onOpen }: { post: FeedPost; onOpen: (badge: BadgeModel) => void }) {
  const badge = post.badgeId && !post.anonymous ? getBadge(post.badgeId) : null;
  return (
    <View style={[styles.card, post.ogToken && styles.cardAmber, post.anonymous && styles.cardPrivate]}>
      <Text style={styles.cardTitle}>{post.title}</Text>
      <Text style={styles.cardMeta}>{post.subtitle}</Text>
      {post.ogToken ? <OgToken /> : null}
      {badge ? (
        <View style={styles.preview}>
          <FlippableBadge
            badge={badge}
            width={160}
            height={196}
            flipped={false}
            onToggle={() => onOpen(badge)}
          />
        </View>
      ) : null}
      {post.anonymous ? (
        <View style={styles.anonBadge}>
          <Text style={styles.anonText}>Details hidden</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function ForYouView() {
  const { posts } = useSocialFeed();
  const [openBadge, setOpenBadge] = useState<BadgeModel | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.kicker}>FOR YOU</Text>
      <Text style={styles.title}>Shared ledger</Text>
      <Text style={styles.subtitle}>Public badge shares, founder tokens, and private-member unlocks.</Text>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onOpen={setOpenBadge} />
      ))}
      <BadgeModal badge={openBadge} onClose={() => setOpenBadge(null)} onBadgeShared={onBadgeShared} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  kicker: { color: colors.glow, fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.6 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 28, marginTop: 6 },
  subtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: 16 },
  card: {
    backgroundColor: 'rgba(24, 24, 27, 0.9)',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardAmber: {
    borderColor: 'rgba(245, 158, 11, 0.45)',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  cardPrivate: { borderColor: 'rgba(113, 113, 122, 0.6)' },
  cardTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21 },
  cardMeta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 4 },
  preview: { marginTop: 14, alignItems: 'flex-start' },
  tokenWrap: { marginTop: 14, alignItems: 'flex-start' },
  token: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
    borderWidth: 3,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  tokenKicker: { color: '#FBBF24', fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1 },
  tokenNumber: { color: '#FAFAFA', fontFamily: fonts.bold, fontSize: 28, marginTop: 4 },
  tokenCity: { color: '#FBBF24', fontFamily: fonts.medium, fontSize: 10, marginTop: 4, letterSpacing: 0.6 },
  anonBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3F3F46',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  anonText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12 },
});
