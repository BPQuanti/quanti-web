import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

type Props = {
  children: ReactNode;
};

export default function ObsidianScreen({ children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safe}>
      <View pointerEvents="none" style={styles.glow} />
      <View style={[styles.body, { paddingTop: insets.top }]}>
        <View style={styles.panel}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
    overflow: 'hidden',
  },
  glow: {
    backgroundColor: 'rgba(38, 38, 38, 0.28)',
    height: 140,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  body: {
    flex: 1,
    zIndex: 1,
  },
  panel: {
    flex: 1,
    width: '100%',
  },
});
