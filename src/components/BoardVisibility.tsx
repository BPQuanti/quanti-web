import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts } from '../../constants/theme';
import { type BoardVisibility, useBoardVisibility } from '../../hooks/useBoardVisibility';

const OPTIONS: { id: BoardVisibility; label: string }[] = [
  { id: 'private', label: 'Private' },
  { id: 'friends', label: 'Friends' },
  { id: 'public', label: 'Public' },
];

const SHARED = 'Bank, health, screen time, and focus cards stay off every board.';

const DETAIL: Record<BoardVisibility, string> = {
  private: 'Only you. You do not appear on a board.',
  friends: 'Accepted friends see your handle, score, member time, and duel wins.',
  public: 'Public shares only your handle, score, member time, and duel wins. Strangers cannot challenge you by name. Duel a stranger pairs you with whoever lined up closest.',
};

export default function BoardVisibilityCard() {
  const { visibility, choose } = useBoardVisibility();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Who can see you</Text>
      <View style={styles.toggle}>
        {OPTIONS.map((option) => {
          const active = visibility === option.id;
          return (
            <Pressable key={option.id} style={[styles.item, active && styles.itemOn]} onPress={() => { void choose(option.id); }}>
              <Text style={[styles.itemText, active && styles.itemTextOn]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.detail, visibility === 'public' && styles.publicDetail]}>{DETAIL[visibility]}</Text>
      <Text style={styles.kept}>{SHARED}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  title: { color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 16 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 4,
    marginTop: 12,
  },
  item: { flex: 1, borderRadius: 999, alignItems: 'center', paddingVertical: 8 },
  itemOn: { backgroundColor: '#312E81' },
  itemText: { color: '#64748B', fontFamily: fonts.medium, fontSize: 14 },
  itemTextOn: { color: '#E0E7FF', fontFamily: fonts.semibold },
  detail: { color: '#CBD5E1', fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, marginTop: 12 },
  publicDetail: { color: '#FDE68A' },
  kept: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, marginTop: 6 },
});
