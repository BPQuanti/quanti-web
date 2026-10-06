import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { deleteAccount } from '../../../lib/accountDeletion';
import { colors, fonts, radii } from '../../../constants/theme';

const CONFIRM_WORD = 'DELETE';

type DeleteResult = {
  success?: boolean;
  message?: string;
};

type Props = {
  visible: boolean;
  accessToken?: string | null;
  onClose: () => void;
  onDeleted: (result: DeleteResult) => void;
};

export default function DeleteAccountModal({ visible, accessToken, onClose, onDeleted }: Props) {
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const canDelete = confirmation.trim().toUpperCase() === CONFIRM_WORD && !busy;

  const close = () => {
    if (busy) return;
    setConfirmation('');
    setError('');
    onClose();
  };

  const confirmDelete = async () => {
    if (!canDelete) return;
    setBusy(true);
    setError('');
    try {
      const result = await deleteAccount(accessToken);
      setConfirmation('');
      onDeleted(result || { success: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Account deletion failed.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Delete account</Text>
          <Text style={styles.warning}>
            This will permanently delete your Quanti profile, revoke Plaid bank connections, and erase all
            cached badges.
          </Text>
          <Text style={styles.label}>Type DELETE to confirm</Text>
          <TextInput
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!busy}
            placeholder="DELETE"
            placeholderTextColor={colors.inactive}
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.destroy, !canDelete && styles.destroyDisabled]}
            disabled={!canDelete}
            onPress={confirmDelete}
          >
            {busy ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.destroyText}>Delete account</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancel} onPress={close} disabled={busy}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderViolet,
    padding: 20,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '700',
  },
  warning: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  label: {
    color: colors.accentSoft,
    fontFamily: fonts.semibold,
    fontSize: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    color: '#FCA5A5',
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 8,
  },
  destroy: {
    marginTop: 16,
    backgroundColor: '#7F1D1D',
    borderRadius: radii.md,
    alignItems: 'center',
    paddingVertical: 14,
  },
  destroyDisabled: { opacity: 0.45 },
  destroyText: {
    color: '#FECACA',
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
  },
  cancel: { alignItems: 'center', paddingVertical: 12 },
  cancelText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
});
