import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, surfaces, typography } from '../../constants/theme';
import { sendInAppFeedback } from '../services/sendFeedback';

type Props = {
  visible: boolean;
  userId?: string | null;
  onClose: () => void;
};

export default function FeedbackModal({ visible, userId, onClose }: Props) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function close() {
    if (busy) {
      return;
    }
    setText('');
    setError('');
    onClose();
  }

  async function submit() {
    if (busy) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      await sendInAppFeedback({ text, userId });
      setText('');
      onClose();
      Alert.alert('Sent', 'Feedback sent directly to the team.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send feedback. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={styles.scrim} onPress={close} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.handle} />
            <View style={styles.head}>
              <Text style={styles.kicker}>Alpha</Text>
              <Pressable onPress={close} disabled={busy} hitSlop={10}>
                <Text style={styles.close}>Close</Text>
              </Pressable>
            </View>
            <Text style={styles.title}>Send feedback</Text>
            <Text style={styles.lede}>A bug, a miss, or what the 1% got right. Goes straight to the team.</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              editable={!busy}
              multiline
              placeholder="What should we know?"
              placeholderTextColor={colors.inactive}
              style={styles.input}
              textAlignVertical="top"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              onPress={() => {
                submit().catch(() => {});
              }}
              disabled={busy || !text.trim()}
              style={[styles.submit, (busy || !text.trim()) && styles.submitDisabled]}
            >
              {busy ? (
                <ActivityIndicator color={colors.heading} />
              ) : (
                <Text style={styles.submitText}>Send to the team</Text>
              )}
            </Pressable>
          </SafeAreaView>
        </KeyboardAvoidingView>
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
  scrim: { flex: 1 },
  sheet: {
    backgroundColor: colors.bg,
    borderTopColor: colors.border,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
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
  kicker: typography.kicker,
  close: {
    color: colors.accentSoft,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  title: {
    ...typography.heading,
    fontSize: 24,
    marginTop: 8,
  },
  lede: {
    ...typography.body,
    marginTop: 8,
  },
  input: {
    ...surfaces.glass,
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 16,
    minHeight: 120,
    padding: 14,
  },
  error: {
    color: '#FCA5A5',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: colors.accentDeep,
    borderRadius: 14,
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 16,
    minHeight: 48,
  },
  submitDisabled: { opacity: 0.45 },
  submitText: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
});
