import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoFull } from '../components/Logo';
import { useAppContext } from '../context/AppContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

import { colors, fonts, glow, radii } from './theme';

const CHAT_BG = colors.bg;
const USER_BUBBLE = colors.accent;
const AI_BUBBLE = colors.cardGlass;
const AI_BORDER = colors.borderViolet;
const TEXT = colors.text;
const MUTED = colors.muted;

const QUICK_PROMPTS = [
  'Analyze my daily health stats 📊',
  'How is my step count percentile calculated? 🏃',
  'Suggest a workout near my location 📍',
  'Summarize my health budget 💳',
];

function formatTime(timestamp) {
  try {
    return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

const WELCOME_MESSAGE = {
  id: 'welcome',
  text: "I'm Quanti AI. Ask about your steps, local workouts, or health spending — I'll use the data synced on Profile.",
  sender: 'assistant',
  timestamp: Date.now(),
};

function mapHistoryRow(row) {
  return {
    id: String(row.id ?? `${row.sender}-${row.created_at}`),
    text: row.message || '',
    sender: row.sender === 'user' ? 'user' : 'assistant',
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function looksLikeMetricReply(text) {
  return /\d|%|top\s+\d|steps|golf|mile|coffee|kcal|percentile/i.test(String(text || ''));
}

function extractEmoji(text) {
  const match = String(text).match(/[\u{1F300}-\u{1FAFF}]/u);
  return match?.[0] || '✨';
}

function titleFromReply(text) {
  const line = String(text || '')
    .split('\n')
    .map((part) => part.trim())
    .find(Boolean);
  return (line || 'Verified Quanti stat').slice(0, 80);
}

function getErrorMessage(error) {
  if (!error) {
    return 'Quanti AI is unavailable right now.';
  }
  if (typeof error === 'string') {
    return error;
  }
  return error.message || error.error || 'Quanti AI is unavailable right now.';
}

export default function QuantiAiScreen() {
  const { healthData, locationData, plaidData, saveAiStatToForMe, savedStats } = useAppContext();
  const listRef = useRef(null);
  const toastTimer = useRef(null);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [toast, setToast] = useState('');
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);

  const hasUserMessages = useMemo(
    () => messages.some((message) => message.sender === 'user'),
    [messages]
  );

  const showToast = (message) => {
    setToast(message);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isSupabaseConfigured) {
        return;
      }
      try {
        const { data, error } = await supabase
          .from('ai_chat_history')
          .select('*')
          .order('created_at', { ascending: true });
        if (cancelled) {
          return;
        }
        if (error) {
          showToast(getErrorMessage(error));
          return;
        }
        if (data?.length) {
          setMessages(data.map(mapHistoryRow));
        }
      } catch (error) {
        if (!cancelled) {
          showToast(getErrorMessage(error));
        }
      }
    })();

    return () => {
      cancelled = true;
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const sendMessage = async (rawText) => {
    const text = String(rawText || '').trim();
    if (!text || isThinking) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsThinking(true);
    scrollToEnd();

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Add your Supabase URL and anon key in .env, then reload.');
      }

      const { data, error } = await supabase.functions.invoke('quanti-ai', {
        body: {
          userMessage: text,
          contextSnapshot: {
            steps: healthData.steps,
            activeCalories: healthData.activeCalories,
            city: locationData.city,
            isBankConnected: plaidData.isConnected,
          },
        },
      });

      if (error) {
        throw error;
      }

      const reply = data?.reply || "Sorry, I couldn't process your metrics right now.";
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          text: reply,
          sender: 'assistant',
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setIsThinking(false);
      scrollToEnd();
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    const canSave =
      !isUser &&
      item.id !== 'welcome' &&
      looksLikeMetricReply(item.text);
    const alreadySaved = savedStats.some(
      (stamp) => stamp.sourceMessageId === item.id || stamp.title === titleFromReply(item.text)
    );
    return (
      <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {!isUser ? <Text style={styles.assistantLabel}>Quanti AI</Text> : null}
          <Text style={styles.bubbleText}>{item.text}</Text>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          {canSave ? (
            <TouchableOpacity
              style={styles.addToForMe}
              disabled={alreadySaved}
              onPress={() => {
                saveAiStatToForMe({
                  id: `ai-${item.id}`,
                  sourceMessageId: item.id,
                  emoji: extractEmoji(item.text),
                  title: titleFromReply(item.text),
                  subtitle: 'Saved from Quanti AI',
                });
                showToast('Added to For Me');
              }}
            >
              <Text style={styles.addToForMeText}>
                {alreadySaved ? 'Saved to For Me' : 'Add to For Me'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.header}>
          <LogoFull width={150} />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          onContentSizeChange={scrollToEnd}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            isThinking ? (
              <View style={[styles.row, styles.rowAssistant]}>
                <View style={[styles.bubble, styles.aiBubble, styles.thinkingBubble]}>
                  <Text style={styles.thinking}>Quanti AI is analyzing...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {!hasUserMessages ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            keyboardShouldPersistTaps="handled"
          >
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={styles.chip}
                onPress={() => sendMessage(prompt)}
                disabled={isThinking}
              >
                <Text style={styles.chipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Ask Quanti AI..."
            placeholderTextColor={MUTED}
            value={input}
            onChangeText={setInput}
            editable={!isThinking}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.send, isThinking && styles.sendDisabled]}
            onPress={() => sendMessage(input)}
            disabled={isThinking}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
        {toast ? (
          <View style={styles.toast} pointerEvents="none">
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CHAT_BG },
  flex: { flex: 1, backgroundColor: CHAT_BG },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  row: { marginBottom: 10, maxWidth: '88%' },
  rowUser: { alignSelf: 'flex-end' },
  rowAssistant: { alignSelf: 'flex-start' },
  bubble: {
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: USER_BUBBLE,
    borderRadius: radii.md,
    borderBottomRightRadius: 6,
    ...glow,
  },
  aiBubble: {
    backgroundColor: AI_BUBBLE,
    borderColor: AI_BORDER,
    borderWidth: 1,
    borderRadius: radii.md,
    borderBottomLeftRadius: 6,
  },
  thinkingBubble: { opacity: 0.85 },
  assistantLabel: {
    color: colors.glow,
    fontFamily: fonts.semibold,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  bubbleText: { color: TEXT, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  timestamp: { color: MUTED, fontFamily: fonts.regular, fontSize: 10, marginTop: 6 },
  addToForMe: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.glow,
    backgroundColor: colors.borderGlow,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addToForMeText: { color: colors.accentSoft, fontFamily: fonts.semibold, fontSize: 11, fontWeight: '600' },
  thinking: { color: colors.glow, fontFamily: fonts.medium, fontSize: 13, fontStyle: 'italic' },
  chipRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  chip: {
    backgroundColor: colors.card,
    borderColor: colors.borderViolet,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipText: { color: TEXT, fontFamily: fonts.medium, fontSize: 12 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: CHAT_BG,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.input,
    color: TEXT,
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  send: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...glow,
  },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: colors.text, fontFamily: fonts.bold, fontWeight: '700' },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 72,
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toastText: { color: '#FECACA', fontFamily: fonts.medium, fontSize: 13, textAlign: 'center' },
});
