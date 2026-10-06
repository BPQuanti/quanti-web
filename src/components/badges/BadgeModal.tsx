import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, radii } from '../../../constants/theme';
import type { BadgeModel } from './badgeCatalog';
import FlippableBadge from './FlippableBadge';

type Props = {
  badge: BadgeModel | null;
  locked?: boolean;
  onClose: () => void;
  onBadgeShared: (badgeId: string) => { anonymous?: boolean } | void;
};

export default function BadgeModal({ badge, locked = false, onClose, onBadgeShared }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [note, setNote] = useState('');

  const close = () => {
    setFlipped(false);
    setNote('');
    onClose();
  };

  const share = () => {
    if (!badge || locked) return;
    const result = onBadgeShared(badge.id);
    const anonymous = Boolean(result?.anonymous);
    setNote(anonymous ? 'Shared to For You as a private member.' : 'Shared to For You.');
  };

  return (
    <Modal visible={Boolean(badge)} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {badge ? (
            <>
              <Text style={styles.title}>{badge.name}</Text>
              <Text style={styles.hint}>
                {locked ? 'Badge details are hidden while this profile is private.' : 'Tap the badge to flip Side B.'}
              </Text>
              <View style={styles.stage}>
                <FlippableBadge
                  badge={badge}
                  flipped={flipped}
                  locked={locked}
                  width={200}
                  height={248}
                  onToggle={() => setFlipped((current) => !current)}
                />
              </View>
              {locked ? null : (
                <TouchableOpacity style={styles.share} onPress={share}>
                  <Text style={styles.shareText}>Share to Instagram</Text>
                </TouchableOpacity>
              )}
              {note ? <Text style={styles.note}>{note}</Text> : null}
              <TouchableOpacity onPress={close} hitSlop={8}>
                <Text style={styles.close}>Close</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(9, 9, 11, 0.94)',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  hint: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  stage: { alignItems: 'center' },
  share: {
    marginTop: 18,
    backgroundColor: '#7C3AED',
    borderRadius: radii.md,
    minHeight: 46,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  shareText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  note: {
    color: colors.accentSoft,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  close: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 14,
    marginTop: 14,
  },
});
