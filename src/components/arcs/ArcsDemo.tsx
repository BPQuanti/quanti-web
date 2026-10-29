import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { fonts } from '../../../constants/theme';
import { ARC_ORDER, ARCS, getActiveArc, setActiveArc, subscribeActiveArc, type ArcId } from '../../lib/arcs';
import { easeLayout } from '../../lib/motion';
const ALIGNMENT = 0.78;
const SPACE = '#050508';
const SURFACE = '#101014';
const LINE = 'rgba(30, 30, 36, 0.5)';
const INK = '#F4F4F5';
const MUTED = '#71717A';
const RING = 116;

function accentGlow(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const WINDOWS: Record<ArcId, string> = {
  RECOVERY: '🧘 RESTORE WINDOW',
  DEEP_WORK: '⚡ PEAK COGNITIVE WINDOW',
  CAPITAL: '💰 CAPITAL WINDOW',
  CLARITY: '🧠 CLARITY WINDOW',
  RHYTHM: '🔋 RHYTHM WINDOW',
};

const FRICTION: Record<ArcId, string> = {
  RECOVERY: '⚠️ BOTTLENECK: Late Caloric Intake',
  DEEP_WORK: '⚠️ BOTTLENECK: Late-Night Circadian Drift',
  CAPITAL: '⚠️ BOTTLENECK: Fatigue-Driven Spend',
  CLARITY: '⚠️ BOTTLENECK: Late-Night Screen Drift',
  RHYTHM: '⚠️ BOTTLENECK: Missed Evening Shutdown',
};

function AlignmentScore({ accent }: { accent: string }) {
  const size = RING;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * (1 - ALIGNMENT);

  return (
    <View style={styles.scoreWrap}>
      <View style={[styles.scoreGlow, { shadowColor: accent }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={LINE}
            strokeWidth={stroke}
            fill={SPACE}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={accentGlow(accent, 0.4)}
            strokeWidth={9}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dash}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={accent}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dash}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.scoreCenter}>
          <Text style={styles.scoreValue}>78%</Text>
        </View>
      </View>
      <Text style={styles.scoreLabel}>ALIGNMENT SCORE</Text>
    </View>
  );
}

export default function ArcsDemo() {
  const [activeId, setActiveId] = useState<ArcId>(getActiveArc());
  const [traceOpen, setTraceOpen] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const arc = ARCS[activeId];

  function playSwap() {
    fade.setValue(0);
    slide.setValue(14);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }

  useEffect(() => subscribeActiveArc((id) => {
    easeLayout();
    setTraceOpen(false);
    setActiveId(id);
    playSwap();
  }), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.72, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  function selectArc(next: ArcId) {
    if (next === activeId) return;
    easeLayout();
    setTraceOpen(false);
    setActiveArc(next);
    setActiveId(next);
  }

  function toggleTrace() {
    easeLayout();
    setTraceOpen((open) => !open);
  }

  const lines = Object.values(arc.traceData);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.identity}>BRIAN // OCT 12</Text>
          <Animated.View style={[styles.windowPill, { opacity: fade }]}>
            <Text numberOfLines={1} style={styles.windowText}>{WINDOWS[activeId]}</Text>
          </Animated.View>
          <Animated.Text numberOfLines={1} style={[styles.sandboxText, { opacity: pulse }]}>
            🟢 On-Device Sandbox
          </Animated.Text>
        </View>
        <AlignmentScore accent={arc.accent} />
      </View>

      <Animated.Text numberOfLines={1} style={[styles.bottleneck, { opacity: fade }]}>
        {FRICTION[activeId]}
      </Animated.Text>

      <View style={styles.pillRow}>
        {ARC_ORDER.map((id) => {
          const item = ARCS[id];
          const selected = id === activeId;
          return (
            <TouchableOpacity
              key={id}
              activeOpacity={0.85}
              onPress={() => selectArc(id)}
              style={[
                styles.pill,
                selected && {
                  borderColor: item.accent,
                  backgroundColor: item.glow,
                },
              ]}
            >
              <Text numberOfLines={1} style={[styles.pillText, selected && { color: item.accent }]}>
                {item.emoji} {item.title.replace(' Arc', '')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        style={styles.yield}
      >
        Yesterday's Protocol: Met (+14ms HRV) • Today's Expected Yield: +35m Focus
      </Text>

      <Animated.View
        style={[
          styles.card,
          {
            opacity: fade,
            transform: [{ translateY: slide }],
          },
        ]}
      >
        <Text style={styles.cardKicker}>DAILY FOCUS CARD // ACTIVE ARC: {arc.title.toUpperCase()}</Text>
        <View style={styles.ruleInset} />
        <Text style={styles.action}>{arc.action}</Text>
        <Text style={[styles.impact, { color: arc.accent }]}>{arc.impact}</Text>
        <TouchableOpacity activeOpacity={0.85} onPress={toggleTrace} style={styles.traceButton}>
          <Text style={styles.traceKicker}>Trace Signal</Text>
          <Text style={[styles.traceHint, { color: arc.accent }]}>
            {traceOpen ? 'Hide pattern' : 'Reveal pattern'}
          </Text>
        </TouchableOpacity>
        {traceOpen ? (
          <View style={styles.traceCard}>
            {lines.map((line, index) => (
              <View key={line}>
                {index > 0 ? <View style={styles.ruleInset} /> : null}
                <Text style={styles.traceLine}>{line}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  headerCopy: { flex: 1, gap: 8 },
  identity: { color: INK, fontFamily: fonts.bold, fontSize: 16, letterSpacing: 0.5 },
  windowPill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  windowText: { color: INK, fontFamily: fonts.medium, fontSize: 10, letterSpacing: 1.2 },
  sandboxText: { color: MUTED, fontFamily: fonts.medium, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
  scoreWrap: { alignItems: 'center' },
  scoreGlow: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.75,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  scoreCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  scoreValue: { color: INK, fontFamily: fonts.bold, fontSize: 32, letterSpacing: 0.5 },
  scoreLabel: { color: MUTED, fontFamily: fonts.medium, fontSize: 9, letterSpacing: 1.2, marginTop: 8 },
  bottleneck: { color: '#C4A46A', fontFamily: fonts.medium, fontSize: 11, letterSpacing: 1.2, marginBottom: 10, textTransform: 'uppercase' },
  yield: {
    color: MUTED,
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 0.3,
    marginTop: 8,
    marginBottom: 8,
  },
  ruleInset: { height: 1, backgroundColor: LINE, marginVertical: 10 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  pill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: SURFACE,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  pillText: { color: MUTED, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 0.2 },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LINE,
    padding: 16,
  },
  cardKicker: {
    color: MUTED,
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  action: {
    color: INK,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  impact: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  traceButton: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: SPACE,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 4,
  },
  traceKicker: { color: MUTED, fontFamily: fonts.medium, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  traceHint: { fontFamily: fonts.semibold, fontSize: 14, letterSpacing: 0.3 },
  traceCard: {
    marginTop: 10,
    backgroundColor: SPACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  traceLine: { color: INK, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, paddingVertical: 6 },
});
