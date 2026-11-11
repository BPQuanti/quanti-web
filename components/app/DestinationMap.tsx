import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../constants/theme';

type Props = {
  vision?: string;
  priority?: string;
  queued?: string[];
};

function clip(value: string, max = 72) {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 1).trim()}…`;
}

function Layer({
  kicker,
  body,
  hint,
  active,
}: {
  kicker: string;
  body: string;
  hint: string;
  active?: boolean;
}) {
  return (
    <View style={[styles.layer, active && styles.layerActive]}>
      <Text style={[styles.kicker, active && styles.kickerActive]}>{kicker}</Text>
      <Text style={[styles.body, !body && styles.bodyEmpty]}>{body || hint}</Text>
    </View>
  );
}

export default function DestinationMap({ vision, priority, queued = [] }: Props) {
  const later =
    queued.length === 0
      ? ''
      : queued.length === 1
        ? clip(queued[0])
        : `${queued.length} later steps`;

  return (
    <View
      style={styles.wrap}
      accessibilityRole="summary"
      accessibilityLabel="Larger vision is where you’re headed. Current priority is today’s step. Queue is later steps."
    >
      <Layer
        kicker="Larger vision"
        body={vision ? clip(vision) : ''}
        hint="Where you’re headed"
      />
      <Text style={styles.arrow}>↓ today’s step</Text>
      <Layer
        kicker="Current priority"
        body={priority ? clip(priority) : ''}
        hint="The one step you’re on"
        active
      />
      <Text style={styles.arrow}>↓ later</Text>
      <Layer kicker="Queue" body={later} hint="Other steps for later" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  layer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  layerActive: {
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
  },
  kicker: {
    color: colors.inactive,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  kickerActive: {
    color: colors.indigo,
  },
  body: {
    color: colors.heading,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
  },
  bodyEmpty: {
    color: colors.inactive,
    fontFamily: fonts.regular,
  },
  arrow: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 0.4,
    marginVertical: 6,
    textAlign: 'center',
  },
});
