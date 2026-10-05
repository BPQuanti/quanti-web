import { Alert, Platform, Share } from 'react-native';
import * as Sharing from 'expo-sharing';

export async function shareStatCard(cardRef) {
  try {
    if (!cardRef?.current?.capture) {
      throw new Error('This card is not ready to share yet.');
    }
    const uri = await cardRef.current.capture();
    const available = await Sharing.isAvailableAsync();
    if (available) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        UTI: 'public.png',
        dialogTitle: 'Share to Socials',
      });
      return;
    }
    await Share.share(
      Platform.OS === 'ios'
        ? { url: uri, message: 'Verified by Quanti' }
        : { message: 'Verified by Quanti', url: uri }
    );
  } catch (error) {
    Alert.alert('Share failed', error?.message ? String(error.message) : 'Unable to open the share sheet.');
  }
}
