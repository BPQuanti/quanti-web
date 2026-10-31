import { Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, surfaces } from '../../constants/theme';

export const LEGAL_DISCLAIMER =
  'Quanti is a self-directed execution tool, not a medical, psychiatric, financial, or legal provider. Daily action cards are algorithmically generated micro-moves for focus management and do not constitute clinical, professional, or therapeutic advice.';

export const CRISIS_COPY =
  'If you are in immediate distress or experiencing a mental health crisis, please dial or text 988 (Suicide & Crisis Lifeline) or contact your local emergency services.';

type Props = {
  visible: boolean;
  onClose: () => void;
};

async function openHelp(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    // Device may not support tel/sms; copy still names 988.
  }
}

export default function LegalSafetyDrawer({ visible, onClose }: Props) {
  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
      transparent={Platform.OS !== 'ios'}
    >
      <View style={Platform.OS === 'ios' ? styles.iosRoot : styles.overlay}>
        {Platform.OS !== 'ios' ? <Pressable style={styles.scrim} onPress={onClose} /> : null}
        <SafeAreaView style={Platform.OS === 'ios' ? styles.iosSheet : styles.sheet} edges={['bottom']}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <Text style={styles.kicker}>LEGAL & SAFETY</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Done">
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Execution disclaimer</Text>
            <View style={styles.card}>
              <Text style={styles.cardBody}>{LEGAL_DISCLAIMER}</Text>
            </View>
            <Text style={styles.section}>CRISIS RESOURCES</Text>
            <View style={[styles.card, styles.crisisCard]}>
              <Text style={styles.crisisBody}>{CRISIS_COPY}</Text>
              <View style={styles.helpRow}>
                <Pressable
                  onPress={() => {
                    openHelp('tel:988').catch(() => {});
                  }}
                  style={styles.helpChip}
                  accessibilityRole="link"
                  accessibilityLabel="Call 988"
                >
                  <Text style={styles.helpChipText}>Call 988</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    openHelp('sms:988').catch(() => {});
                  }}
                  style={styles.helpChip}
                  accessibilityRole="link"
                  accessibilityLabel="Text 988"
                >
                  <Text style={styles.helpChipText}>Text 988</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  iosRoot: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  scrim: { flex: 1 },
  sheet: {
    backgroundColor: colors.bg,
    borderTopColor: colors.border,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '86%',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iosSheet: {
    backgroundColor: colors.bg,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.borderHover,
    borderRadius: 99,
    height: 4,
    marginBottom: 12,
    width: 40,
  },
  head: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: {
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.6,
  },
  done: {
    color: colors.accentSoft,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  body: {
    gap: 12,
    paddingBottom: 28,
    paddingTop: 8,
  },
  title: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 24,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  section: {
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.6,
    marginTop: 8,
  },
  card: {
    ...surfaces.glass,
    padding: 16,
  },
  cardBody: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  crisisCard: {
    borderColor: colors.amberBorder,
  },
  crisisBody: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  helpRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  helpChip: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  helpChipText: {
    color: colors.heading,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
