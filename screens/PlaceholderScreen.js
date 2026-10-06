import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoFull } from '../components/Logo';
import { colors, fonts, radii } from './theme';

export default function PlaceholderScreen({ title, subtitle }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <LogoFull width={150} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardBody}>
            This tab is ready in Expo Go. Content for this screen will land here without resetting
            your Profile sync state.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  title: { color: colors.white, fontFamily: fonts.bold, fontSize: 28, fontWeight: '700', marginTop: 14 },
  subtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, marginTop: 4 },
  body: { flex: 1, padding: 20 },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.borderViolet,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 16,
  },
  cardTitle: { color: colors.white, fontFamily: fonts.bold, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  cardBody: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
});
