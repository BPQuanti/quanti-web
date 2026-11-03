import AsyncStorage from '@react-native-async-storage/async-storage';
import { addCalendarDays, localDateStamp, type ExecutionStatus } from './directiveHistory';
import { getActiveDestination, rememberDestinationQuestion, setDestinationStall } from './destinationBoard';
import { writeRemoteMorningQuestion } from './destinationsCloud';
import { getNorthStar } from './northStar';
import { asQuestionAngle, composeGuidedQuestion, rotateQuestionAngle } from './voiceCheckPrompt';
import { scopedAsyncKey } from './sessionIsolation';

const STALL_KEY = '@quanti_stall_pattern';
const QUESTIONS_KEY = '@quanti_guided_questions';

export type GuidedQuestionRecord = {
  date: string;
  question: string;
  source: 'onboarding' | 'mark' | 'synth' | 'fallback';
  answered?: boolean;
  destinationId?: string;
};

type QuestionMap = Record<string, GuidedQuestionRecord>;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeGuidedQuestions(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function readMap(): Promise<QuestionMap> {
  try {
    const raw = await AsyncStorage.getItem(await scopedAsyncKey(QUESTIONS_KEY));
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    return parsed as QuestionMap;
  } catch {
    return {};
  }
}

async function writeMap(map: QuestionMap) {
  const dates = Object.keys(map).sort();
  const trimmed: QuestionMap = {};
  for (const date of dates.slice(-21)) {
    trimmed[date] = map[date];
  }
  await AsyncStorage.setItem(await scopedAsyncKey(QUESTIONS_KEY), JSON.stringify(trimmed));
  notify();
}

export async function getStallPattern(): Promise<string | null> {
  try {
    const active = await getActiveDestination();
    if (active?.stallPattern?.trim()) {
      return active.stallPattern.trim().slice(0, 600);
    }
    const raw = await AsyncStorage.getItem(await scopedAsyncKey(STALL_KEY));
    const text = raw?.replace(/\s+/g, ' ').trim() || '';
    return text ? text.slice(0, 600) : null;
  } catch {
    return null;
  }
}

export async function setStallPattern(transcript: string) {
  const text = transcript.replace(/\s+/g, ' ').trim().slice(0, 600);
  if (!text) {
    return;
  }
  await AsyncStorage.setItem(await scopedAsyncKey(STALL_KEY), text);
  const active = await getActiveDestination();
  if (active) {
    await setDestinationStall(active.id, text);
  }
  notify();
}

export async function getGuidedQuestion(
  date = localDateStamp(),
  destinationId?: string | null,
): Promise<GuidedQuestionRecord | null> {
  const map = await readMap();
  const record = map[date];
  if (record && (!destinationId || !record.destinationId || record.destinationId === destinationId)) {
    return record;
  }
  const active = await getActiveDestination();
  if (active && (!destinationId || active.id === destinationId) && active.nextQuestion?.trim()) {
    return {
      date,
      question: active.nextQuestion.trim(),
      source: 'fallback',
      destinationId: active.id,
    };
  }
  return null;
}

export async function saveGuidedQuestion(entry: GuidedQuestionRecord) {
  const map = await readMap();
  const date = entry.date.slice(0, 10);
  map[date] = {
    ...map[date],
    ...entry,
    date,
    question: entry.question.replace(/\s+/g, ' ').trim().slice(0, 220),
    destinationId: entry.destinationId ?? map[date]?.destinationId,
  };
  await writeMap(map);
}

export async function markGuidedQuestionAnswered(date = localDateStamp()) {
  const map = await readMap();
  if (!map[date]) {
    return;
  }
  map[date] = { ...map[date], answered: true };
  await writeMap(map);
}

export async function ensureGuidedQuestion(input: {
  date?: string;
  destinationNext?: string | null;
  stallPattern?: string | null;
  yesterdayStatus?: ExecutionStatus | null;
  source?: GuidedQuestionRecord['source'];
  destinationId?: string | null;
}): Promise<GuidedQuestionRecord> {
  const date = input.date?.slice(0, 10) || localDateStamp();
  const existing = await getGuidedQuestion(date, input.destinationId);
  if (existing?.question) {
    return existing;
  }
  const stall = input.stallPattern ?? (await getStallPattern());
  const star = input.destinationNext ?? (await getNorthStar())?.next;
  const dest = await getActiveDestination();
  const question = composeGuidedQuestion({
    destinationNext: star,
    stallPattern: stall,
    yesterdayStatus: input.yesterdayStatus ?? null,
    date,
    angle: asQuestionAngle(dest?.lastQuestionAngle),
  });
  const record: GuidedQuestionRecord = {
    date,
    question,
    source: input.source ?? 'fallback',
    destinationId: input.destinationId ?? undefined,
  };
  await saveGuidedQuestion(record);
  return record;
}

export async function writeTomorrowQuestion(input: {
  fromDate?: string;
  destinationNext?: string | null;
  stallPattern?: string | null;
  yesterdayStatus?: ExecutionStatus | null;
  source?: GuidedQuestionRecord['source'];
  question?: string;
  destinationId?: string | null;
}) {
  const from = input.fromDate?.slice(0, 10) || localDateStamp();
  const date = addCalendarDays(from, 1);
  const stall = input.stallPattern ?? (await getStallPattern());
  const star = input.destinationNext ?? (await getNorthStar())?.next;
  const dest = await getActiveDestination();
  const angle = rotateQuestionAngle(dest?.lastQuestionAngle, input.yesterdayStatus ?? null);
  const question = (input.question?.trim() ||
    composeGuidedQuestion({
      destinationNext: star,
      stallPattern: stall,
      yesterdayStatus: input.yesterdayStatus,
      date,
      angle,
    })).slice(0, 220);
  await saveGuidedQuestion({
    date,
    question,
    source: input.source ?? 'mark',
    destinationId: input.destinationId ?? undefined,
  });
  const destId = input.destinationId ?? dest?.id;
  if (destId) {
    await rememberDestinationQuestion(destId, question, angle);
  }
  await writeRemoteMorningQuestion(question).catch(() => {});
  return question;
}
