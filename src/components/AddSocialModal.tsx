import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Check, Search, Share2, Swords, UserPlus, X } from 'lucide-react-native';
import { fonts } from '../../constants/theme';
import { useAppContext } from '../../context/AppContext';
import { type DuelDuration, useDuels } from '../../hooks/useDuels';
import { type Friend, useFriends } from '../../hooks/useFriends';

type Mode = 'friend' | 'duel';
type Busy = 'request' | 'share' | 'duel' | null;

type Props = {
  visible: boolean;
  onClose: () => void;
  onChanged?: () => void;
};

const DURATIONS: DuelDuration[] = [3, 7, 14];

function messageFrom(error: unknown) {
  return error instanceof Error && error.message ? error.message : 'Something went wrong.';
}

export default function AddSocialModal({ visible, onClose, onChanged }: Props) {
  const insets = useSafeAreaInsets();
  const { userProfile } = useAppContext() as {
    userProfile?: { username?: string | null } | null;
  };
  const { friends, loading: friendsLoading, sendFriendRequest } = useFriends();
  const { createDuel } = useDuels();
  const [mode, setMode] = useState<Mode>('friend');
  const [username, setUsername] = useState('');
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [duration, setDuration] = useState<DuelDuration>(7);
  const [busy, setBusy] = useState<Busy>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handle = String(userProfile?.username || 'you').replace(/^@+/, '');

  useEffect(() => {
    if (!visible) {
      setBusy(null);
      setNotice(null);
      setUsername('');
    }
  }, [visible]);

  async function onSendRequest() {
    setBusy('request');
    setNotice(null);
    try {
      await sendFriendRequest(username);
      const sentTo = username.trim().replace(/^@+/, '');
      setUsername('');
      setNotice(`Request sent to @${sentTo}.`);
      onChanged?.();
    } catch (error) {
      Alert.alert('Could not send request', messageFrom(error));
    } finally {
      setBusy(null);
    }
  }

  async function onShareInvite() {
    const url = `https://quanti.app/i/@${handle}`;
    setBusy('share');
    try {
      const result = await Share.share({
        message: `Add me on Quanti: ${url}`,
        url,
      });
      if (result.action === Share.sharedAction) {
        setNotice('Invite link shared.');
      }
    } catch (error) {
      Alert.alert('Could not share invite', messageFrom(error));
    } finally {
      setBusy(null);
    }
  }

  async function onIssueChallenge() {
    if (!opponentId) {
      Alert.alert('Choose a friend', 'Select someone from your accepted friends list.');
      return;
    }
    setBusy('duel');
    setNotice(null);
    try {
      await createDuel(opponentId, duration);
      setNotice(`Challenge issued for ${duration} days.`);
      onChanged?.();
    } catch (error) {
      Alert.alert('Could not issue challenge', messageFrom(error));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close social actions" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.grabber} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{mode === 'friend' ? 'Add a friend' : 'Create a duel'}</Text>
              <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close">
                <X color="#94A3B8" size={18} />
              </Pressable>
            </View>

            <View style={styles.toggle}>
              <Pressable
                style={[styles.toggleItem, mode === 'friend' && styles.toggleOn]}
                onPress={() => {
                  setMode('friend');
                  setNotice(null);
                }}
              >
                <UserPlus color={mode === 'friend' ? '#E0E7FF' : '#64748B'} size={16} />
                <Text style={[styles.toggleText, mode === 'friend' && styles.toggleTextOn]}>Add Friend</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleItem, mode === 'duel' && styles.toggleOnRose]}
                onPress={() => {
                  setMode('duel');
                  setNotice(null);
                }}
              >
                <Swords color={mode === 'duel' ? '#FFE4E6' : '#64748B'} size={16} />
                <Text style={[styles.toggleText, mode === 'duel' && styles.toggleTextOn]}>Create Duel</Text>
              </Pressable>
            </View>

            {notice ? (
              <View style={styles.banner}>
                <Check color="#818CF8" size={16} />
                <Text style={styles.bannerText}>{notice}</Text>
              </View>
            ) : null}

            {mode === 'friend' ? (
              <View>
                <View style={styles.field}>
                  <Search color="#64748B" size={16} />
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="@username"
                    placeholderTextColor="#64748B"
                    style={styles.input}
                    returnKeyType="send"
                    onSubmitEditing={() => {
                      if (!busy) void onSendRequest();
                    }}
                  />
                </View>
                <Pressable
                  style={[styles.primary, busy === 'request' && styles.disabled]}
                  onPress={() => void onSendRequest()}
                  disabled={busy !== null}
                >
                  {busy === 'request' ? (
                    <ActivityIndicator color="#020617" />
                  ) : (
                    <Text style={styles.primaryText}>Send Request</Text>
                  )}
                </Pressable>
                <Pressable
                  style={[styles.secondary, busy === 'share' && styles.disabled]}
                  onPress={() => void onShareInvite()}
                  disabled={busy !== null}
                >
                  {busy === 'share' ? (
                    <ActivityIndicator color="#E0E7FF" />
                  ) : (
                    <>
                      <Share2 color="#E0E7FF" size={16} />
                      <Text style={styles.secondaryText}>Share Invite Link</Text>
                    </>
                  )}
                </Pressable>
              </View>
            ) : (
              <View>
                {friendsLoading ? (
                  <ActivityIndicator color="#818CF8" style={styles.listLoading} />
                ) : (
                  <FlatList
                    data={friends}
                    keyExtractor={(item) => item.userId}
                    style={styles.list}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={<Text style={styles.empty}>No accepted friends yet.</Text>}
                    renderItem={({ item }) => (
                      <FriendChoice
                        friend={item}
                        selected={item.userId === opponentId}
                        onPress={() => setOpponentId(item.userId)}
                      />
                    )}
                  />
                )}
                <View style={styles.durationRow}>
                  {DURATIONS.map((days) => {
                    const selected = duration === days;
                    return (
                      <Pressable
                        key={days}
                        style={[styles.duration, selected && styles.durationOn]}
                        onPress={() => setDuration(days)}
                      >
                        <Calendar color={selected ? '#FFE4E6' : '#64748B'} size={14} />
                        <Text style={[styles.durationText, selected && styles.durationTextOn]}>{days} days</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable
                  style={[styles.challenge, busy === 'duel' && styles.disabled]}
                  onPress={() => void onIssueChallenge()}
                  disabled={busy !== null}
                >
                  {busy === 'duel' ? (
                    <ActivityIndicator color="#FFF1F2" />
                  ) : (
                    <Text style={styles.challengeText}>Issue Challenge</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function FriendChoice({
  friend,
  selected,
  onPress,
}: {
  friend: Friend;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.friend, selected && styles.friendOn]} onPress={onPress}>
      <View style={styles.friendCopy}>
        <Text style={styles.friendName}>@{friend.username || 'friend'}</Text>
        <Text style={styles.friendMeta}>Momentum {friend.momentumScore}</Text>
      </View>
      {selected ? <Check color="#818CF8" size={18} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(2, 6, 23, 0.72)' },
  sheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '88%',
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#334155',
    marginBottom: 14,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sheetTitle: { flex: 1, color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 20 },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 4,
    marginBottom: 14,
  },
  toggleItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 999, paddingVertical: 8 },
  toggleOn: { backgroundColor: '#312E81' },
  toggleOnRose: { backgroundColor: '#9F1239' },
  toggleText: { color: '#64748B', fontFamily: fonts.medium, fontSize: 14 },
  toggleTextOn: { color: '#F8FAFC', fontFamily: fonts.semibold },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#818CF8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  bannerText: { flex: 1, color: '#E0E7FF', fontFamily: fonts.medium, fontSize: 13 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: { flex: 1, color: '#F8FAFC', fontFamily: fonts.regular, fontSize: 16, paddingVertical: 12 },
  primary: {
    backgroundColor: '#818CF8',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginBottom: 10,
  },
  primaryText: { color: '#020617', fontFamily: fonts.bold, fontSize: 15 },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#020617',
  },
  secondaryText: { color: '#E0E7FF', fontFamily: fonts.semibold, fontSize: 15 },
  disabled: { opacity: 0.7 },
  list: { maxHeight: 240, marginBottom: 12 },
  listLoading: { marginVertical: 24 },
  empty: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 14, paddingVertical: 12 },
  friend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  friendOn: { borderColor: '#818CF8' },
  friendCopy: { flex: 1 },
  friendName: { color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 15 },
  friendMeta: { color: '#64748B', fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  durationRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  duration: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#020617',
    paddingVertical: 10,
  },
  durationOn: { borderColor: '#F43F5E', backgroundColor: '#4C0519' },
  durationText: { color: '#94A3B8', fontFamily: fonts.medium, fontSize: 13 },
  durationTextOn: { color: '#FFE4E6', fontFamily: fonts.semibold },
  challenge: {
    backgroundColor: '#F43F5E',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  challengeText: { color: '#FFF1F2', fontFamily: fonts.bold, fontSize: 15 },
});
