import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { colors } from '../screens/theme';

const BG = colors.bg;
const SURFACE = colors.card;
const DIVIDER = colors.border;
const MUTED = colors.muted;
const WHITE = colors.text;
const ACCENT = colors.accent;

function initialsFromName(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) {
    return 'Q';
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function EditProfileModal({ visible, profile, onClose, onSave }) {
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    if (visible) {
      setDraft({
        name: profile?.name || '',
        username: profile?.username || '',
        bio: profile?.bio || '',
        avatarUri: profile?.avatarUri || null,
      });
    }
  }, [visible, profile]);

  const updateField = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const changePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Allow photo library access to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        updateField('avatarUri', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Photo picker failed', error?.message ? String(error.message) : 'Unable to open your library.');
    }
  };

  const save = () => {
    const username = String(draft.username || '')
      .replace(/^@/, '')
      .trim();
    onSave?.({
      name: String(draft.name || '').trim() || 'Brian Parr',
      username: username || 'brian_quanti',
      bio: String(draft.bio || '').trim(),
      avatarUri: draft.avatarUri || null,
      avatar_url: draft.avatarUri || null,
    });
    onClose?.();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Text style={styles.headerSide}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={save} hitSlop={10}>
              <Text style={styles.save}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.avatarWrap}>
              {draft.avatarUri ? (
                <Image source={{ uri: draft.avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{initialsFromName(draft.name)}</Text>
                </View>
              )}
              <TouchableOpacity onPress={changePhoto}>
                <Text style={styles.changePhoto}>Change Profile Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={draft.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder="Name"
                placeholderTextColor={MUTED}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={draft.username}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(value) => updateField('username', value.replace(/^@/, ''))}
                placeholder="username"
                placeholderTextColor={MUTED}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={draft.bio}
                onChangeText={(value) => updateField('bio', value)}
                placeholder="Tell people what you quantify"
                placeholderTextColor={MUTED}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  headerSide: { color: WHITE, fontSize: 16, width: 64 },
  title: { color: WHITE, fontSize: 16, fontWeight: '800' },
  save: { color: ACCENT, fontSize: 16, fontWeight: '800', width: 64, textAlign: 'right' },
  body: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  avatarWrap: { alignItems: 'center', marginBottom: 28 },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: DIVIDER,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: SURFACE,
    borderWidth: 2,
    borderColor: DIVIDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: WHITE, fontSize: 28, fontWeight: '700' },
  changePhoto: { color: ACCENT, fontSize: 15, fontWeight: '700', marginTop: 12 },
  field: { marginBottom: 8 },
  label: { color: MUTED, fontSize: 12, marginBottom: 6 },
  input: {
    color: WHITE,
    fontSize: 16,
    backgroundColor: colors.input,
    borderRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: DIVIDER,
    borderBottomColor: DIVIDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bioInput: { minHeight: 88, paddingTop: 10 },
});
