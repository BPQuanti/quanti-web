import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts } from '../../../constants/theme';

const PRIVACY_URL = 'https://quanti-app.com/privacy';
const TERMS_URL = 'https://quanti-app.com/terms';

type Props = {
  onRestore?: () => void;
};

async function openUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.log('Unable to open link', url, error);
  }
}

export default function PaywallFooter({ onRestore }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.terms}>$10.00/month. Auto-renews until canceled in App Store Settings.</Text>
      <View style={styles.links}>
        <TouchableOpacity onPress={() => openUrl(PRIVACY_URL)} hitSlop={8}>
          <Text style={styles.link}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={styles.dot}>·</Text>
        <TouchableOpacity onPress={() => openUrl(TERMS_URL)} hitSlop={8}>
          <Text style={styles.link}>Terms of Use (EULA)</Text>
        </TouchableOpacity>
        <Text style={styles.dot}>·</Text>
        <TouchableOpacity onPress={onRestore} hitSlop={8}>
          <Text style={styles.link}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 14 },
  terms: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  link: {
    color: colors.accentSoft,
    fontFamily: fonts.semibold,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  dot: { color: colors.inactive, fontSize: 12 },
});
