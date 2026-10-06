import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ForYouView from '../src/components/fyp/ForYouView';
import { colors } from './theme';

export default function ForYouScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ForYouView />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
});
