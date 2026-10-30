import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts } from '../../constants/theme';
import { formatToward, type NorthStar } from '../../src/services/northStar';
import { scopedAsyncKey } from '../../src/services/sessionIsolation';

const DISMISS_KEY = '@quanti_signal_nudge_dismissed';

function suggestion(healthOn: boolean, micOn: boolean, toward: string | null) {
  if (micOn) {
    return null;
  }
  const aim = toward ? `Toward ${toward},` : '';
  return `${aim} connect the microphone so the morning check can fill what sensors miss. HealthKit is optional.`.trim();
}

type Props = {
  northStar?: NorthStar | null;
  healthOn: boolean;
  micOn: boolean;
  onOpenArcs: () => void;
  onOpenPrivacy: () => void;
};

export default function SignalNudgeCard({ northStar, healthOn, micOn, onOpenArcs, onOpenPrivacy }: Props) {
  const [hidden, setHidden] = useState(true);
  const copy = suggestion(healthOn, micOn, formatToward(northStar ?? null));

  useEffect(() => {
    let live = true;
    scopedAsyncKey(DISMISS_KEY)
      .then((key) => AsyncStorage.getItem(key))
      .then((value) => {
        if (live) {
          setHidden(value === '1');
        }
      })
      .catch(() => {
        if (live) {
          setHidden(false);
        }
      });
    return () => {
      live = false;
    };
  }, []);

  if (hidden || !copy) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.kicker}>Suggested next signal</Text>
        <Pressable
          onPress={() => {
            setHidden(true);
            scopedAsyncKey(DISMISS_KEY)
              .then((key) => AsyncStorage.setItem(key, '1'))
              .catch(() => {});
          }}
          hitSlop={8}
        >
          <Text style={styles.dismiss}>Dismiss</Text>
        </Pressable>
      </View>
      <Text style={styles.body}>{copy}</Text>
      <Pressable onPress={onOpenPrivacy}>
        <Text style={styles.link}>Connect in Privacy</Text>
      </Pressable>
      <Pressable onPress={onOpenArcs}>
        <Text style={styles.fluid}>Active Target can be rewritten anytime.</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
    padding: 16,
  },
  head: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: {
    color: colors.indigo,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  dismiss: {
    color: colors.indigo,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  body: {
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  link: {
    color: colors.indigo,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  fluid: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
});
