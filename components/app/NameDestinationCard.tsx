import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, surfaces } from '../../constants/theme';
import { setCustomArcContext } from '../../src/lib/arcs';
import { assessDestination } from '../../src/services/destinationQuality';
import {
  DESTINATION_PLACEHOLDER,
  activeTargetFromText,
  saveNorthStar,
  type NorthStar,
} from '../../src/services/northStar';

type Props = {
  previous?: NorthStar | null;
  submitLabel?: string;
  onSaved: (star: NorthStar) => void;
};

export default function NameDestinationCard({
  previous,
  submitLabel = 'Use this',
  onSaved,
}: Props) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const check = assessDestination(draft);
  const hint = !check.ok && draft.trim() ? check.hint : null;

  async function save() {
    if (!check.ok && !check.lenientOk) {
      setError(check.hint || check.reason || 'Write your current priority.');
      return;
    }
    const next = activeTargetFromText(draft, previous);
    setCustomArcContext(next.next.trim());
    try {
      await saveNorthStar(next);
    } catch {
      setError('Could not save that sentence. Try again.');
      return;
    }
    setError(null);
    onSaved(next);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Current priority</Text>
      <Text style={styles.title}>What’s your current priority?</Text>
      <Text style={styles.body}>
        One thing you’re working on now. Someone else could mark yes or no. Today’s 1% comes from this.
      </Text>
      <TextInput
        value={draft}
        onChangeText={(value) => {
          setDraft(value);
          if (error) {
            setError(null);
          }
        }}
        placeholder={DESTINATION_PLACEHOLDER}
        placeholderTextColor={colors.inactive}
        multiline
        textAlignVertical="top"
        style={styles.input}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.examples}>
        <Text style={styles.exampleLine}>
          <Text style={styles.exampleWeak}>Weak: </Text>
          &quot;Get in shape&quot; / &quot;Be productive&quot;
        </Text>
        <Text style={styles.exampleLine}>
          <Text style={styles.exampleStrong}>Strong: </Text>
          &quot;Draft landing page copy&quot; / &quot;Ship TestFlight to 10 testers&quot;
        </Text>
      </View>
      <Pressable onPress={() => save().catch(() => {})} style={styles.submit}>
        <Text style={styles.submitText}>{submitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...surfaces.glass,
    padding: 16,
  },
  kicker: {
    color: colors.amber,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.6,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  body: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'rgba(23, 23, 23, 0.6)',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
    minHeight: 96,
    padding: 14,
  },
  hint: {
    color: colors.amber,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  error: {
    color: colors.amber,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 8,
  },
  examples: {
    gap: 6,
    marginTop: 12,
  },
  exampleLine: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  exampleWeak: {
    color: colors.amber,
    fontFamily: fonts.semibold,
  },
  exampleStrong: {
    color: colors.emerald,
    fontFamily: fonts.semibold,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 16,
    paddingVertical: 14,
  },
  submitText: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
});
