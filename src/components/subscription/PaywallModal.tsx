import { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors, fonts, radii } from '../../../constants/theme';

const PRIVACY_URL = 'https://quanti-app.com/privacy';
const TERMS_URL = 'https://quanti-app.com/terms';

const TERMS_COPY =
  'Payment will be charged to your Apple ID account at confirmation of purchase. Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.';

export type PaywallTierId = 'free' | 'pro' | 'og';
export type BillingInterval = 'monthly' | 'annual';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectTier: (tierId: PaywallTierId, billingInterval: BillingInterval) => void;
};

type Tier = {
  id: PaywallTierId;
  name: string;
  target: string;
  badge?: string;
  badgeTone?: 'violet' | 'amber';
  features: string[];
  cta: string;
  prices: Record<BillingInterval, string>;
};

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Quanti Free',
    target: 'HealthKit Only',
    features: ['Unlimited HealthKit processing', '1 Basic Fitness Badge', 'Weekly basic insights'],
    cta: 'Continue with Free',
    prices: { monthly: '$0', annual: '$0' },
  },
  {
    id: 'pro',
    name: 'Quanti Pro',
    target: 'Full Personal Intelligence & Financial Recaps',
    badge: 'RECOMMENDED',
    badgeTone: 'violet',
    features: [
      'All HealthKit + Plaid Bank Connections (up to 3 accounts)',
      'All 4 3D Product Recap Badges (Golf, Amazon, Fitness, DoorDash)',
      'Cross-data AI synthesis',
    ],
    cta: 'Start Pro Trial',
    prices: { monthly: '$9.99/mo', annual: '$79.99/yr' },
  },
  {
    id: 'og',
    name: 'OG Founder Pass',
    target: 'First 500 Founding Members',
    badge: 'EXCLUSIVE',
    badgeTone: 'amber',
    features: [
      'Everything in Pro',
      'Standalone 3D OG Badge Token',
      '0.5% Revenue Dividend Pool eligibility',
      'VIP Brand Perk Priority',
    ],
    cta: 'Claim OG Founder Pass',
    prices: { monthly: '$14.99/mo', annual: '$149.99/yr' },
  },
];

async function openUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.log('Unable to open link', url, error);
  }
}

function restorePurchases() {
  Alert.alert('Restore Purchases', 'No previous purchases were found for this Apple ID.');
}

function OgCta({ label, onPress }: { label: string; onPress: () => void }) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.ogButton}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width !== size.width || height !== size.height) setSize({ width, height });
      }}
    >
      {size.width > 0 ? (
        <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="ogPass" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#F59E0B" />
              <Stop offset="1" stopColor="#7C3AED" />
            </LinearGradient>
          </Defs>
          <Rect width={size.width} height={size.height} rx={radii.md} fill="url(#ogPass)" />
        </Svg>
      ) : null}
      <Text style={styles.ogButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function PaywallModal({ isOpen, onClose, onSelectTier }: Props) {
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const [billing, setBilling] = useState<BillingInterval>('annual');
  const [selected, setSelected] = useState<PaywallTierId>('pro');

  useEffect(() => {
    if (!isOpen) return;
    setBilling('annual');
    setSelected('pro');
  }, [isOpen]);

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close paywall" />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Pressable
            style={[styles.sheet, wide && styles.sheetWide]}
            onPress={() => {}}
            accessibilityViewIsModal
          >
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.kicker}>QUANTI</Text>
                <Text style={styles.title}>Choose your plan</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Close">
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggle}>
              <Pressable
                style={[styles.toggleItem, billing === 'monthly' && styles.toggleItemOn]}
                onPress={() => setBilling('monthly')}
              >
                <Text style={[styles.toggleText, billing === 'monthly' && styles.toggleTextOn]}>Monthly</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleItem, billing === 'annual' && styles.toggleItemOn]}
                onPress={() => setBilling('annual')}
              >
                <Text style={[styles.toggleText, billing === 'annual' && styles.toggleTextOn]}>Annual</Text>
                <View style={styles.savePill}>
                  <Text style={styles.savePillText}>SAVE 33%</Text>
                </View>
              </Pressable>
            </View>

            <View style={[styles.grid, wide && styles.gridWide]}>
              {TIERS.map((tier) => {
                const active = selected === tier.id;
                return (
                  <Pressable
                    key={tier.id}
                    onPress={() => setSelected(tier.id)}
                    style={[styles.card, wide && styles.cardWide, active && styles.cardActive]}
                  >
                    {tier.badge ? (
                      <View style={[styles.badge, tier.badgeTone === 'amber' ? styles.badgeAmber : styles.badgeViolet]}>
                        <Text
                          style={[
                            styles.badgeText,
                            tier.badgeTone === 'amber' ? styles.badgeTextAmber : styles.badgeTextViolet,
                          ]}
                        >
                          {tier.badge}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.badgeSpacer} />
                    )}
                    <Text style={styles.planName}>{tier.name}</Text>
                    <Text style={styles.price}>{tier.prices[billing]}</Text>
                    <Text style={styles.target}>{tier.target}</Text>
                    {tier.id === 'og' ? (
                      <View style={styles.spots}>
                        <Text style={styles.spotsText}>LIMITED: 124 / 500 SPOTS REMAINING</Text>
                      </View>
                    ) : null}
                    <View style={styles.features}>
                      {tier.features.map((feature) => (
                        <View key={feature} style={styles.featureRow}>
                          <Text style={[styles.check, tier.id === 'og' && styles.checkAmber]}>✓</Text>
                          <Text style={styles.feature}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                    {tier.id === 'free' ? (
                      <TouchableOpacity
                        style={styles.freeButton}
                        onPress={() => onSelectTier('free', billing)}
                      >
                        <Text style={styles.freeButtonText}>{tier.cta}</Text>
                      </TouchableOpacity>
                    ) : null}
                    {tier.id === 'pro' ? (
                      <TouchableOpacity
                        style={styles.proButton}
                        onPress={() => onSelectTier('pro', billing)}
                      >
                        <Text style={styles.proButtonText}>{tier.cta}</Text>
                      </TouchableOpacity>
                    ) : null}
                    {tier.id === 'og' ? <OgCta label={tier.cta} onPress={() => onSelectTier('og', billing)} /> : null}
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.terms}>{TERMS_COPY}</Text>
            <View style={styles.links}>
              <TouchableOpacity onPress={restorePurchases} hitSlop={8}>
                <Text style={styles.link}>Restore Purchases</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openUrl(TERMS_URL)} hitSlop={8}>
                <Text style={styles.link}>Terms of Use (EULA)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openUrl(PRIVACY_URL)} hitSlop={8}>
                <Text style={styles.link}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.72)',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 896,
    backgroundColor: 'rgba(9, 9, 11, 0.94)',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 24,
    padding: 24,
  },
  sheetWide: { padding: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: { flex: 1 },
  kicker: {
    color: colors.glow,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
  close: {
    color: colors.muted,
    fontSize: 18,
    padding: 4,
  },
  toggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#18181B',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 4,
    marginTop: 20,
    gap: 4,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toggleItemOn: { backgroundColor: '#27272A' },
  toggleText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  toggleTextOn: { color: colors.text },
  savePill: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.55)',
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.85,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  savePillText: {
    color: '#DDD6FE',
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: '600',
  },
  grid: { marginTop: 20, gap: 16 },
  gridWide: { flexDirection: 'row', alignItems: 'stretch' },
  card: {
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 20,
    padding: 16,
  },
  cardWide: { flex: 1 },
  cardActive: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeSpacer: { height: 22, marginBottom: 10 },
  badgeViolet: {
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.45)',
  },
  badgeAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  badgeTextViolet: { color: '#DDD6FE' },
  badgeTextAmber: { color: '#FBBF24' },
  planName: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 18,
    fontWeight: '600',
  },
  price: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 6,
  },
  target: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  spots: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  spotsText: {
    color: '#FBBF24',
    fontFamily: fonts.mono,
    fontSize: 10,
  },
  features: { marginTop: 14, gap: 8, flexGrow: 1 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  check: {
    color: '#C084FC',
    fontFamily: fonts.bold,
    fontSize: 13,
    lineHeight: 18,
  },
  checkAmber: { color: '#FBBF24' },
  feature: {
    flex: 1,
    color: '#D4D4D8',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  freeButton: {
    marginTop: 16,
    backgroundColor: '#27272A',
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  freeButtonText: {
    color: '#D4D4D8',
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  proButton: {
    marginTop: 16,
    backgroundColor: '#7C3AED',
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  proButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 15,
    fontWeight: '600',
  },
  ogButton: {
    marginTop: 16,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    overflow: 'hidden',
    backgroundColor: '#7C3AED',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  ogButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 12,
    zIndex: 1,
  },
  terms: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  link: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
