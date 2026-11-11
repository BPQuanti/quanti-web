import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, surfaces } from '../../constants/theme';
import { formatLogDate, type DirectiveLog } from '../../src/services/directiveHistory';

const MARK_LABEL = {
  executed: 'Done',
  partial: 'Missed',
  shifted: 'Missed',
  unknown: 'Not marked',
} as const;

type Props = {
  logs: DirectiveLog[];
};

export default function OnePercentLog({ logs }: Props) {
  if (!logs.length) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>1% log</Text>
      <Text style={styles.title}>What you did, night by night.</Text>
      {logs.map((log) => (
        <View key={log.date} style={styles.row}>
          <View style={styles.meta}>
            <Text style={styles.date}>{formatLogDate(log.date)}</Text>
            <Text style={[styles.mark, (!log.status || log.status === 'unknown') && styles.markOpen]}>
              {log.status ? MARK_LABEL[log.status] : 'Not marked'}
            </Text>
          </View>
          <Text style={styles.directive} numberOfLines={3}>
            {log.primary_directive}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...surfaces.glass,
    marginTop: 8,
    padding: 16,
  },
  kicker: {
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
  title: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 16,
    marginTop: 6,
  },
  row: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  date: {
    color: colors.inactive,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  mark: {
    color: colors.emerald,
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  markOpen: {
    color: colors.amber,
  },
  directive: {
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
});
