import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LogoMark } from './Logo';
import { colors } from '../constants/theme';

export default function BootScreen() {
  return (
    <View style={styles.boot}>
      <LogoMark width={120} glowing />
      <ActivityIndicator color={colors.accent} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: { marginTop: 28 },
});
