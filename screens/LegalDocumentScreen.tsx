import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { LegalDocument } from '../constants/legal';
import { fonts } from '../constants/theme';

type LegalNav = {
  goBack: () => void;
  canGoBack: () => boolean;
  navigate: (name: 'Hub') => void;
};

type Props = {
  document: LegalDocument;
};

export default function LegalDocumentScreen({ document }: Props) {
  const navigation = useNavigation() as LegalNav;

  const close = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Hub');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={close} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color="#E2E8F0" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{document.title}</Text>
        <Text style={styles.updated}>Last updated {document.updated}</Text>
        {document.sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.heading}>{section.title}</Text>
            {section.blocks.map((block, index) => {
              if (block.kind === 'ul') {
                return (
                  <View key={`${section.title}-list-${index}`} style={styles.list}>
                    {block.items.map((item) => (
                      <View key={item} style={styles.bulletRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.body}>{item}</Text>
                      </View>
                    ))}
                  </View>
                );
              }
              return (
                <Text key={`${section.title}-p-${index}`} style={styles.body}>
                  {block.text}
                </Text>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: { color: '#E2E8F0', fontFamily: fonts.semibold, fontSize: 16 },
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 48 },
  title: { color: '#F1F5F9', fontFamily: fonts.bold, fontSize: 28 },
  updated: { color: '#64748B', fontFamily: fonts.regular, fontSize: 13, marginTop: 6, marginBottom: 8 },
  section: { marginTop: 18 },
  heading: { color: '#F1F5F9', fontFamily: fonts.bold, fontSize: 18, marginBottom: 8 },
  body: { color: '#CBD5E1', fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, flex: 1 },
  list: { gap: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: { color: '#94A3B8', fontSize: 16, lineHeight: 22 },
});
