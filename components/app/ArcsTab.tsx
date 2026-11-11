import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import { colors, fonts, surfaces, typography } from '../../constants/theme';
import { setCustomArcContext } from '../../src/lib/arcs';
import { assessDestination } from '../../src/services/destinationQuality';
import DestinationMap from './DestinationMap';
import NameDestinationCard from './NameDestinationCard';
import {
  archiveDestination,
  enqueueDestination,
  getDestinationBoard,
  queuedDestinations,
  setDestinationStall,
  subscribeDestinationBoard,
  swapToDestination,
  type Destination,
  type DestinationBoard,
} from '../../src/services/destinationBoard';
import { setStallPattern } from '../../src/services/guidedQuestion';
import {
  activeTargetFromText,
  daysOnTarget,
  DESTINATION_PLACEHOLDER,
  getNorthStar,
  getVision,
  isTargetStale,
  saveNorthStar,
  saveVision,
  subscribeNorthStar,
  TARGET_STALE_DAYS,
  type NorthStar,
} from '../../src/services/northStar';
import ObsidianScreen from './ObsidianScreen';

function persistTarget(next: NorthStar) {
  setCustomArcContext(next.next.trim());
  saveNorthStar(next).catch(() => {});
}

export default function ArcsTab() {
  const [writeOpen, setWriteOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState<NorthStar | null>(null);
  const [board, setBoard] = useState<DestinationBoard | null>(null);
  const [queueDraft, setQueueDraft] = useState('');
  const [stallDraft, setStallDraft] = useState('');
  const [visionDraft, setVisionDraft] = useState('');
  const [visionSaved, setVisionSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleDismissed, setStaleDismissed] = useState(false);
  const scrollRef = useRef<{ scrollToEnd: (options?: { animated?: boolean }) => void } | null>(null);
  const visionSavedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    getNorthStar().then((star) => {
      if (mounted && star?.next?.trim()) {
        setSaved(star);
      }
    });
    getVision().then((vision) => {
      if (mounted && vision) {
        setVisionDraft(vision);
      }
    });
    getDestinationBoard().then((next) => {
      if (mounted) {
        setBoard(next);
      }
    });
    const unsubStar = subscribeNorthStar(() => {
      getNorthStar().then((star) => {
        if (mounted) {
          setSaved(star?.next?.trim() ? star : null);
        }
      });
    });
    const unsubBoard = subscribeDestinationBoard(() => {
      getDestinationBoard().then((next) => {
        if (mounted) {
          setBoard(next);
        }
      });
    });
    return () => {
      mounted = false;
      unsubStar();
      unsubBoard();
      if (visionSavedTimer.current) {
        clearTimeout(visionSavedTimer.current);
      }
    };
  }, []);

  async function persistNorthStar() {
    Vibration.vibrate(12);
    setVisionSaved(true);
    try {
      await saveVision(visionDraft);
    } catch {
      setVisionSaved(false);
      setError('Could not save North Star.');
      return;
    }
    if (visionSavedTimer.current) {
      clearTimeout(visionSavedTimer.current);
    }
    visionSavedTimer.current = setTimeout(() => setVisionSaved(false), 1600);
  }

  function focusQueueInput() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 320);
  }

  function trySave(raw: string, opts?: { lenient?: boolean }) {
    const check = assessDestination(raw);
    const allow = check.ok || (opts?.lenient && check.lenientOk);
    if (!allow) {
      setError(check.hint || check.reason || 'Write the thing you are finishing.');
      setWriteOpen(true);
      return false;
    }
    const next = activeTargetFromText(raw, saved);
    setSaved(next);
    persistTarget(next);
    setError(null);
    setWriteOpen(false);
    setStaleDismissed(false);
    return true;
  }

  const activeId = board?.activeId ?? null;
  const queue = board ? queuedDestinations(board) : [];

  async function markAchieved() {
    if (!activeId) {
      return;
    }
    setError(null);
    try {
      const next = await archiveDestination(activeId, 'achieved');
      setBoard(next);
      const stillActive = next.items.find((item) => item.id === next.activeId && item.status === 'active');
      if (!stillActive) {
        setSaved(null);
        setDraft('');
        setCustomArcContext('');
        setWriteOpen(true);
      }
      setStaleDismissed(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not archive that destination.');
    }
  }

  async function addToQueue() {
    const check = assessDestination(queueDraft);
    if (!check.ok) {
      setError(check.reason || 'Add one later step to the queue.');
      return;
    }
    try {
      await enqueueDestination(queueDraft);
      setQueueDraft('');
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not add that to the queue.');
    }
  }

  async function swapIn(item: Destination) {
    setError(null);
    try {
      const result = await swapToDestination(item.id);
      setCustomArcContext(item.name);
      setStaleDismissed(false);
      setWriteOpen(false);
      if (result.needsStall) {
        setStallDraft('');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not make that the current priority.');
    }
  }

  async function saveStall() {
    if (!activeId) {
      return;
    }
    const text = stallDraft.trim();
    if (text.split(/\s+/).length < 4) {
      setError('Name what usually kills this destination — a person, artifact, slot, or tool.');
      return;
    }
    await setDestinationStall(activeId, text);
    await setStallPattern(text);
    setStallDraft('');
    setError(null);
  }

  const stale = isTargetStale(saved) && !staleDismissed;
  const age = daysOnTarget(saved);

  return (
    <ObsidianScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
      <ScrollView
        ref={(node) => {
          const scroller = node as { scrollToEnd?: (options?: { animated?: boolean }) => void } | null;
          scrollRef.current = scroller?.scrollToEnd
            ? { scrollToEnd: (options) => scroller.scrollToEnd?.(options) }
            : null;
        }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageKicker}>Your map</Text>
        <Text style={styles.pageTitle}>Vision, this step, later</Text>
        {error && !writeOpen ? <Text style={styles.error}>{error}</Text> : null}

        <DestinationMap
          vision={visionDraft.trim()}
          priority={saved?.next}
          queued={queue.map((item) => item.name)}
        />

        {saved ? (
        <View style={styles.alignCard}>
          <Text style={styles.seasonTag}>Larger vision</Text>
          <Text style={styles.alignSub}>
            Where you’re headed. Not today’s step. The daily 1% does not compute from this.
          </Text>
          <TextInput
            value={visionDraft}
            onChangeText={setVisionDraft}
            placeholder="e.g., Become the default execution OS for founders"
            placeholderTextColor="#737373"
            style={styles.queueInput}
          />
          <Pressable
            onPress={() => persistNorthStar().catch(() => {})}
            style={[styles.ghost, visionSaved && styles.ghostSaved]}
            accessibilityRole="button"
            accessibilityLabel={visionSaved ? 'Saved' : 'Save vision'}
          >
            <Text style={[styles.updateText, visionSaved && styles.savedText]}>
              {visionSaved ? 'Saved ✓' : 'Save vision'}
            </Text>
          </Pressable>
        </View>
        ) : null}

        {saved ? (
          <View style={styles.alignCard}>
            <Text style={styles.seasonTag}>Current priority</Text>
            <Text style={styles.alignSub}>The step you’re on now. Today’s 1% comes from this — nothing else.</Text>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryBody}>{saved.next}</Text>
              {age != null ? (
                <Text style={styles.alignSub}>
                  {age === 0 ? 'Chosen today' : `${age} day${age === 1 ? '' : 's'} on this`}
                </Text>
              ) : null}
            </View>
            {stale ? (
              <View style={styles.staleBox}>
                <Text style={styles.alignPrompt}>
                  This has been your current priority for {TARGET_STALE_DAYS}+ days. Keep it, shrink the sentence, or finish it.
                </Text>
                <View style={styles.row}>
                  <Pressable onPress={() => setStaleDismissed(true)} style={styles.submit}>
                    <Text style={styles.submitText}>Keep this</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setDraft(saved.next);
                      setWriteOpen(true);
                      setStaleDismissed(true);
                    }}
                    style={styles.ghost}
                  >
                    <Text style={styles.updateText}>Rewrite</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
            {board?.items.find((item) => item.id === activeId && !item.stallPattern?.trim()) ? (
              <View style={styles.staleBox}>
                <Text style={styles.alignSub}>What usually kills this? Person, artifact, or tool.</Text>
                <TextInput
                  value={stallDraft}
                  onChangeText={setStallDraft}
                  placeholder="Last time this stalled — name the thing."
                  placeholderTextColor="#737373"
                  style={styles.queueInput}
                />
                <Pressable onPress={() => saveStall().catch(() => {})} style={styles.submit}>
                  <Text style={styles.submitText}>Save stall</Text>
                </Pressable>
              </View>
            ) : null}
            <Pressable onPress={() => markAchieved().catch(() => {})} style={styles.achieveBtn}>
              <Text style={styles.achieveText}>Done — this is finished</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setDraft(saved.next);
                setWriteOpen(true);
              }}
              style={styles.updateBtn}
            >
              <Text style={styles.updateText}>Rewrite the sentence</Text>
            </Pressable>
          </View>
        ) : (
          <NameDestinationCard
            previous={saved}
            onSaved={(next) => {
              setSaved(next);
              setError(null);
              setWriteOpen(false);
              setStaleDismissed(false);
            }}
          />
        )}

        {saved ? (
          <View style={styles.alignCard}>
            <Text style={styles.seasonTag}>Queue</Text>
            <Text style={styles.alignSub}>
              Later steps. Not today’s work. Make current only if you’re switching off the one above.
            </Text>
            {queue.map((item) => (
              <View key={item.id} style={styles.queueRow}>
                <Text style={styles.queueName}>{item.name}</Text>
                <Pressable onPress={() => swapIn(item).catch(() => {})} hitSlop={8}>
                  <Text style={styles.queueAction}>Make current</Text>
                </Pressable>
                <Pressable
                  onPress={() => archiveDestination(item.id, 'abandoned').catch(() => {})}
                  hitSlop={8}
                >
                  <Text style={styles.queueMute}>Cut</Text>
                </Pressable>
              </View>
            ))}
            <TextInput
              value={queueDraft}
              onChangeText={(value) => {
                setQueueDraft(value);
                if (error) {
                  setError(null);
                }
              }}
              onFocus={focusQueueInput}
              placeholder="A later step, not today’s"
              placeholderTextColor="#737373"
              style={styles.queueInput}
            />
            <Pressable onPress={() => addToQueue().catch(() => {})} style={styles.ghost}>
              <Text style={styles.updateText}>Add to queue</Text>
            </Pressable>
          </View>
        ) : null}

        {saved && writeOpen ? (
          <View style={styles.writeBox}>
            <TextInput
              value={draft}
              onChangeText={(value) => {
                setDraft(value);
                if (error) {
                  setError(null);
                }
              }}
              placeholder={DESTINATION_PLACEHOLDER}
              placeholderTextColor="#737373"
              multiline
              textAlignVertical="top"
              style={styles.input}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable onPress={() => trySave(draft, { lenient: true })} style={styles.submit}>
              <Text style={styles.submitText}>Use this</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
      </KeyboardAvoidingView>
    </ObsidianScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 140, paddingHorizontal: 20, paddingTop: 16 },
  pageKicker: typography.kicker,
  pageTitle: { ...typography.heading, fontSize: 24, marginBottom: 18, marginTop: 8 },
  alignCard: {
    ...surfaces.glass,
    marginBottom: 16,
    padding: 16,
  },
  seasonTag: {
    ...typography.badgeText,
    color: colors.amber,
    marginBottom: 8,
  },
  alignTitle: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 20,
    letterSpacing: -0.4,
    marginTop: 8,
  },
  alignPrompt: {
    color: colors.heading,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  alignSub: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  writeBox: { marginTop: 4, width: '100%' },
  input: {
    backgroundColor: 'rgba(23, 23, 23, 0.6)',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    minHeight: 120,
    padding: 14,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    marginTop: 12,
    paddingVertical: 12,
  },
  submitText: { color: colors.heading, fontFamily: fonts.semibold, fontSize: 14 },
  ghost: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
  },
  ghostSaved: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: colors.emeraldBorder,
    borderRadius: 999,
    borderWidth: 1,
  },
  savedText: { color: colors.emerald, fontFamily: fonts.semibold },
  row: { flexDirection: 'row', gap: 10 },
  summaryBox: {
    backgroundColor: 'rgba(23, 23, 23, 0.6)',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  summaryBody: {
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  updateBtn: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 4 },
  updateText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
  achieveBtn: {
    alignItems: 'center',
    backgroundColor: colors.emeraldBg,
    borderColor: colors.emeraldBorder,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 16,
    paddingVertical: 12,
  },
  achieveText: { color: colors.emerald, fontFamily: fonts.semibold, fontSize: 14 },
  staleBox: { marginTop: 8 },
  queueRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  queueName: {
    color: colors.heading,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  queueAction: { color: colors.amber, fontFamily: fonts.semibold, fontSize: 13 },
  queueMute: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
  queueInput: {
    backgroundColor: 'rgba(23, 23, 23, 0.6)',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 15,
    marginTop: 12,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  error: {
    color: colors.amber,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 8,
  },
});
