import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '../../../constants/theme';

type Props = {
  name?: string | null;
  score: number;
};

function greeting(name?: string | null) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first = String(name || '').trim().split(/\s+/)[0];
  return first ? `${hello}, ${first}` : hello;
}

function scoreTone(score: number) {
  if (score >= 80) return { label: 'On track', color: '#34D399', wash: 'rgba(16, 185, 129, 0.14)' };
  if (score >= 50) return { label: 'Building', color: '#FBBF24', wash: 'rgba(245, 158, 11, 0.14)' };
  return { label: 'At risk', color: '#FB7185', wash: 'rgba(244, 63, 94, 0.14)' };
}

export default function MomentumHeader({ name, score }: Props) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
  const tone = scoreTone(safeScore);
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.date}>{dateLabel}</Text>
        <Text style={styles.greeting}>{greeting(name)}</Text>
      </View>
      <View style={[styles.badge, { borderColor: tone.color, backgroundColor: tone.wash }]}>
        <Text style={styles.badgeLabel}>Momentum</Text>
        <Text style={[styles.score, { color: tone.color }]}>{safeScore}</Text>
        <View style={styles.gaugeTrack}>
          <View style={[styles.gaugeFill, { width: `${safeScore}%`, backgroundColor: tone.color }]} />
        </View>
        <Text style={[styles.status, { color: tone.color }]}>{tone.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  copy: { flex: 1, paddingTop: 4 },
  date: { color: '#94A3B8', fontFamily: fonts.medium, fontSize: 13 },
  greeting: { color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 26, marginTop: 4, lineHeight: 32 },
  badge: {
    minWidth: 108,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  badgeLabel: {
    color: '#94A3B8',
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  score: { fontFamily: fonts.bold, fontSize: 28, marginTop: 2 },
  gaugeTrack: {
    width: '100%',
    height: 4,
    borderRadius: 99,
    backgroundColor: '#1E293B',
    marginTop: 6,
    overflow: 'hidden',
  },
  gaugeFill: { height: '100%', borderRadius: 99 },
  status: { fontFamily: fonts.semibold, fontSize: 11, marginTop: 6 },
});
