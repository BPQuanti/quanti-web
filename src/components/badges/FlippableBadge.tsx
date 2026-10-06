import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fonts } from '../../../constants/theme';
import type { BadgeGlyph, BadgeModel } from './badgeCatalog';

type Props = {
  badge: BadgeModel;
  flipped: boolean;
  onToggle: () => void;
  width: number;
  height?: number;
  locked?: boolean;
};

function Glyph({ glyph }: { glyph: BadgeGlyph }) {
  const common = { stroke: '#7C3AED', strokeWidth: 1.8, fill: 'none' as const };
  if (glyph === 'golf') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M7 21h10M12 21V8" stroke="#7C3AED" strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M12 5.5 19 8.2 12 11V5.5Z" fill="#7C3AED" />
        <Circle cx={8.2} cy={17.2} r={1.35} fill="#7C3AED" />
      </Svg>
    );
  }
  if (glyph === 'takeout') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M5 9.5h14l-1.2 9.2a1.6 1.6 0 0 1-1.6 1.3H7.8a1.6 1.6 0 0 1-1.6-1.3L5 9.5Z" {...common} />
        <Path d="M8 9.5 9.4 4.8h5.2L16 9.5M9 13.5h6" {...common} strokeLinecap="round" />
      </Svg>
    );
  }
  if (glyph === 'package') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M12 3 20 7.5V16.5L12 21 4 16.5V7.5L12 3Z" {...common} />
        <Path d="M12 12 20 7.5M12 12V21M12 12 4 7.5" {...common} />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M12 3s2 3.2 2 5.2a2 2 0 1 1-4 0C10 6.2 12 3 12 3Zm-3.2 7.2c.4 2.2 1.8 3.6 3.2 4.4 1.4-.8 2.8-2.2 3.2-4.4-1 .8-2.1 1.2-3.2 1.2s-2.2-.4-3.2-1.2Z"
        fill="#7C3AED"
      />
      <Path d="M8.2 14.2c-1.6 1.2-2.7 3-2.7 5h13c0-2-1.1-3.8-2.7-5" {...common} strokeLinecap="round" />
    </Svg>
  );
}

function Face({
  badge,
  side,
}: {
  badge: BadgeModel;
  side: 'front' | 'back';
}) {
  const back = side === 'back';
  return (
    <View style={styles.rim}>
      <View style={styles.glass}>
        <View style={styles.sheen} />
        <Text style={styles.kicker}>{back ? badge.backKicker : badge.frontKicker}</Text>
        <View style={styles.center}>
          {back ? (
            <>
              <Text style={styles.backHeadline}>{badge.backHeadline}</Text>
              <Text style={styles.backDetail}>{badge.backDetail}</Text>
            </>
          ) : (
            <>
              <View style={styles.iconHalo}>
                <View style={styles.iconDisc}>
                  <Glyph glyph={badge.glyph} />
                </View>
              </View>
              <Text style={styles.frontTitle}>{badge.frontTitle}</Text>
            </>
          )}
        </View>
        {back ? (
          <View style={styles.chip}>
            <Text style={styles.chipText}>PERK ELIGIBLE</Text>
          </View>
        ) : null}
        <Text style={[styles.rimLabel, back && styles.rimLabelBack]}>
          {back ? 'SYNC VERIFIED' : 'QUANTI VERIFIED BADGE'}
        </Text>
      </View>
    </View>
  );
}

export default function FlippableBadge({ badge, flipped, onToggle, width, height = 210, locked = false }: Props) {
  const spin = useRef(new Animated.Value(flipped ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(spin, {
      toValue: locked ? 0 : flipped ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
  }, [flipped, locked, spin]);

  const frontRotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <Pressable
      onPress={locked ? undefined : onToggle}
      accessibilityRole="button"
      accessibilityLabel={locked ? `${badge.name}, private` : `${badge.name}, ${flipped ? 'recap side' : 'title side'}`}
      style={{ width, height }}
    >
      <Animated.View
        style={[styles.face, { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] }]}
      >
        <Face badge={badge} side="front" />
      </Animated.View>
      <Animated.View
        style={[styles.face, { transform: [{ perspective: 1000 }, { rotateY: backRotate }] }]}
      >
        <Face badge={badge} side="back" />
      </Animated.View>
      {locked ? (
        <View style={styles.lock}>
          <Text style={styles.lockText}>Followers only</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backfaceVisibility: 'hidden',
  },
  rim: {
    flex: 1,
    borderRadius: 16,
    padding: 2,
    backgroundColor: '#3F3F46',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.55)',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  glass: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(24, 24, 27, 0.94)',
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  kicker: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 9,
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconHalo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.22)',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  iconDisc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4D4D8',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.7)',
  },
  frontTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 11,
    textAlign: 'center',
  },
  backHeadline: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    textAlign: 'center',
  },
  backDetail: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  chipText: {
    color: '#DDD6FE',
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 0.6,
  },
  rimLabel: {
    color: 'rgba(167, 139, 250, 0.85)',
    fontFamily: fonts.medium,
    fontSize: 8,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  rimLabelBack: { color: '#71717A' },
  lock: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 16,
    backgroundColor: 'rgba(9, 9, 11, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
});
