import AsyncStorage from '@react-native-async-storage/async-storage';
import { scopedAsyncKey } from './sessionIsolation';
import {
  asNorthStar,
  readLegacyNorthStar,
  writeLegacyNorthStar,
  type NorthStar,
} from './northStar';
import {
  getPriorExecution,
  getTodayLog,
  localDateStamp,
  upsertDirectiveLog,
  type ExecutionStatus,
} from './directiveHistory';
import { clearStoredDirective, loadStoredDirective } from './dailyDirectiveStore';
import {
  pullRemoteDestinations,
  pushDestinationBoard,
  swapRemoteDestination,
  writeRemoteMorningQuestion,
} from './destinationsCloud';
import {
  applyMarkToPhysics,
  asPhysicsMemory,
  emptyPhysics,
  type DestinationPhysicsMemory,
} from './destinationPhysics';
import { asBriefField } from './destinationBrief';
import { asQuestionAngle, composeGuidedQuestion, rotateQuestionAngle, type QuestionAngle } from './voiceCheckPrompt';

const STORAGE_KEY = '@quanti_destination_board';

export type ArchiveReason = 'achieved' | 'abandoned';

export type Destination = {
  id: string;
  name: string;
  now: string;
  setAt: string;
  status: 'active' | 'queued' | 'archived';
  archivedAt?: string;
  archiveReason?: ArchiveReason;
  stallPattern?: string | null;
  doneWhen?: string | null;
  constraints?: string | null;
  currentBottleneck?: string | null;
  lastQuestionAngle?: QuestionAngle;
  lastMark?: {
    date: string;
    status: ExecutionStatus;
    primary_directive: string;
  } | null;
  nextQuestion?: string | null;
  physicsMemory?: DestinationPhysicsMemory;
};

export type DestinationBoard = {
  activeId: string | null;
  items: Destination[];
};

export type SwapResult = {
  board: DestinationBoard;
  regenerateToday: boolean;
  needsStall: boolean;
};

const boardListeners = new Set<() => void>();

function notifyBoard() {
  boardListeners.forEach((listener) => listener());
}

export function subscribeDestinationBoard(listener: () => void) {
  boardListeners.add(listener);
  return () => boardListeners.delete(listener);
}

function newId() {
  const cryptoObj = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (typeof cryptoObj?.randomUUID === 'function') {
    return `dest_${cryptoObj.randomUUID()}`;
  }
  return `dest_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 10)}`;
}

function clipName(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 280);
}

function emptyBoard(): DestinationBoard {
  return { activeId: null, items: [] };
}

function asDestination(value: unknown): Destination | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Partial<Destination>;
  const name = typeof record.name === 'string' ? clipName(record.name) : '';
  const id = typeof record.id === 'string' ? record.id : '';
  if (!name || !id) {
    return null;
  }
  const status =
    record.status === 'queued' || record.status === 'archived' || record.status === 'active'
      ? record.status
      : 'queued';
  return {
    id,
    name,
    now: typeof record.now === 'string' && record.now.trim() ? record.now.trim().slice(0, 280) : 'here',
    setAt: typeof record.setAt === 'string' && record.setAt ? record.setAt : new Date().toISOString(),
    status,
    archivedAt: typeof record.archivedAt === 'string' ? record.archivedAt : undefined,
    archiveReason: record.archiveReason === 'achieved' || record.archiveReason === 'abandoned'
      ? record.archiveReason
      : undefined,
    stallPattern: typeof record.stallPattern === 'string' ? record.stallPattern.slice(0, 600) : record.stallPattern ?? null,
    doneWhen: asBriefField(record.doneWhen),
    constraints: asBriefField(record.constraints),
    currentBottleneck: asBriefField(record.currentBottleneck) ?? (typeof record.stallPattern === 'string' ? record.stallPattern.slice(0, 280) : null),
    lastQuestionAngle: asQuestionAngle(record.lastQuestionAngle),
    lastMark: record.lastMark && typeof record.lastMark === 'object' ? record.lastMark : null,
    nextQuestion: typeof record.nextQuestion === 'string' ? record.nextQuestion : record.nextQuestion ?? null,
    physicsMemory: asPhysicsMemory(record.physicsMemory),
  };
}

export function destinationToStar(item: Destination | null): NorthStar | null {
  if (!item) {
    return null;
  }
  return asNorthStar({
    now: item.now,
    next: item.name,
    outcomes: [item.name.slice(0, 120)],
    setAt: item.setAt,
  });
}

function fromStar(star: NorthStar, status: Destination['status'], id?: string): Destination {
  const name = clipName(star.next || star.now);
  return {
    id: id || newId(),
    name,
    now: star.now?.trim() || 'here',
    setAt: star.setAt || new Date().toISOString(),
    status,
    stallPattern: null,
    lastQuestionAngle: 'BOTTLENECK',
    lastMark: null,
    nextQuestion: null,
    physicsMemory: emptyPhysics(),
  };
}

async function readBoardRaw(): Promise<DestinationBoard | null> {
  try {
    const raw = await AsyncStorage.getItem(await scopedAsyncKey(STORAGE_KEY));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<DestinationBoard>;
    const items = Array.isArray(parsed.items)
      ? parsed.items.map(asDestination).filter((item): item is Destination => Boolean(item))
      : [];
    const activeId = typeof parsed.activeId === 'string' ? parsed.activeId : null;
    return { activeId, items };
  } catch {
    return null;
  }
}

async function writeBoard(board: DestinationBoard) {
  const actives = board.items.filter((item) => item.status === 'active');
  let activeId = board.activeId;
  if (activeId && !actives.some((item) => item.id === activeId)) {
    activeId = actives[0]?.id ?? null;
  }
  if (!activeId && actives[0]) {
    activeId = actives[0].id;
  }
  const next: DestinationBoard = { activeId, items: board.items };
  try {
    await pushDestinationBoard(next);
  } catch (caught) {
    console.warn('[Destinations] cloud push failed', caught);
  }
  await AsyncStorage.setItem(await scopedAsyncKey(STORAGE_KEY), JSON.stringify(next));
  const active = next.items.find((item) => item.id === next.activeId && item.status === 'active') ?? null;
  await writeLegacyNorthStar(destinationToStar(active));
  notifyBoard();
  return next;
}

async function hydrateFromLegacy(): Promise<DestinationBoard> {
  const star = await readLegacyNorthStar();
  if (!star?.next && !star?.now) {
    return emptyBoard();
  }
  const item = fromStar(star, 'active');
  const board = { activeId: item.id, items: [item] };
  await AsyncStorage.setItem(await scopedAsyncKey(STORAGE_KEY), JSON.stringify(board));
  return board;
}

export async function clearDestinationBoard() {
  await AsyncStorage.removeItem(await scopedAsyncKey(STORAGE_KEY));
  notifyBoard();
}

export async function getDestinationBoard(): Promise<DestinationBoard> {
  const existing = await readBoardRaw();
  if (existing?.items.length) {
    return existing;
  }
  const remote = await pullRemoteDestinations().catch(() => null);
  if (remote?.items.length) {
    const merged: DestinationBoard = {
      activeId: remote.activeId,
      items: remote.items.map((item) => asDestination(item)).filter((item): item is Destination => Boolean(item)),
    };
    await AsyncStorage.setItem(await scopedAsyncKey(STORAGE_KEY), JSON.stringify(merged)).catch(() => {});
    return merged;
  }
  return hydrateFromLegacy();
}

export async function getActiveDestination(): Promise<Destination | null> {
  const board = await getDestinationBoard();
  if (!board.activeId) {
    return null;
  }
  return board.items.find((item) => item.id === board.activeId && item.status === 'active') ?? null;
}

export function queuedDestinations(board: DestinationBoard) {
  return board.items.filter((item) => item.status === 'queued');
}

export function archivedDestinations(board: DestinationBoard) {
  return board.items.filter((item) => item.status === 'archived').slice(-8).reverse();
}

async function freezeDestination(item: Destination, today = localDateStamp()): Promise<Destination> {
  const prior = await getPriorExecution(today, item.id);
  const todayLog = await getTodayLog(today);
  const last =
    todayLog?.destination_id === item.id && todayLog.status
      ? todayLog
      : prior;
  return {
    ...item,
    lastMark: last?.status
      ? {
          date: last.date,
          status: last.status,
          primary_directive: last.primary_directive.slice(0, 280),
        }
      : item.lastMark ?? null,
  };
}

export async function upsertActiveFromStar(star: NorthStar, stallPattern?: string | null) {
  const nextStar = asNorthStar(star);
  if (!nextStar) {
    return;
  }
  const board = await getDestinationBoard();
  const active = board.items.find((item) => item.id === board.activeId && item.status === 'active');
  if (active) {
    const renamed = clipName(nextStar.next) !== clipName(active.name);
    const updated: Destination = {
      ...active,
      name: clipName(nextStar.next),
      now: nextStar.now || active.now,
      setAt: renamed ? new Date().toISOString() : active.setAt,
      stallPattern: stallPattern ?? active.stallPattern,
      status: 'active',
    };
    const items = board.items.map((item) => (item.id === active.id ? updated : item));
    await writeBoard({ ...board, items, activeId: active.id });
    return updated;
  }
  const created = fromStar(nextStar, 'active');
  if (stallPattern) {
    created.stallPattern = stallPattern;
  }
  await writeBoard({ activeId: created.id, items: [...board.items, created] });
  return created;
}

export async function enqueueDestination(rawName: string) {
  const name = clipName(rawName);
  if (!name) {
    throw new Error('Name the queued destination.');
  }
  const board = await getDestinationBoard();
  const queued = queuedDestinations(board);
  if (queued.length >= 12) {
    throw new Error('Queue is full. Cut one before adding another.');
  }
  const duplicate = board.items.some(
    (item) => item.status !== 'archived' && item.name.toLowerCase() === name.toLowerCase(),
  );
  if (duplicate) {
    throw new Error('That name is already first or parked.');
  }
  const item = fromStar({ now: 'here', next: name, outcomes: [name.slice(0, 120)], setAt: new Date().toISOString() }, 'queued');
  item.status = 'queued';
  await writeBoard({ ...board, items: [...board.items, item] });
  return item;
}

export async function setDestinationStall(destinationId: string, transcript: string) {
  const text = transcript.replace(/\s+/g, ' ').trim().slice(0, 600);
  if (!text) {
    return;
  }
  const board = await getDestinationBoard();
  const items = board.items.map((item) =>
    item.id === destinationId
      ? {
          ...item,
          stallPattern: text,
          physicsMemory: asPhysicsMemory({
            ...item.physicsMemory,
            last_stall_reason: text.slice(0, 120),
          }),
        }
      : item,
  );
  await writeBoard({ ...board, items });
}

export async function rememberDestinationQuestion(
  destinationId: string,
  question: string | null,
  angle?: QuestionAngle,
) {
  const board = await getDestinationBoard();
  const items = board.items.map((item) =>
    item.id === destinationId
      ? {
          ...item,
          nextQuestion: question,
          lastQuestionAngle: angle ?? item.lastQuestionAngle,
        }
      : item,
  );
  await writeBoard({ ...board, items });
}

export async function rememberDestinationMark(
  destinationId: string,
  mark: { date: string; status: ExecutionStatus; primary_directive: string },
  transcript?: string | null,
) {
  const board = await getDestinationBoard();
  const items = board.items.map((item) =>
    item.id === destinationId
      ? {
          ...item,
          lastMark: mark,
          physicsMemory:
            mark.status === 'executed' || mark.status === 'partial' || mark.status === 'shifted'
              ? applyMarkToPhysics(item.physicsMemory, {
                  status: mark.status,
                  primary_directive: mark.primary_directive,
                  transcript,
                  stallPattern: item.stallPattern,
                  destinationNext: item.name,
                })
              : item.physicsMemory,
        }
      : item,
  );
  await writeBoard({ ...board, items });
}

export async function swapToDestination(destinationId: string): Promise<SwapResult> {
  const board = await getDestinationBoard();
  const incoming = board.items.find((item) => item.id === destinationId);
  if (!incoming || incoming.status === 'archived') {
    throw new Error('That destination is not in the queue.');
  }
  const today = localDateStamp();
  const stored = await loadStoredDirective(today);
  let items = board.items;
  const outgoingId = board.activeId;
  if (incoming.status === 'active' && board.activeId === destinationId) {
    return {
      board,
      regenerateToday: false,
      needsStall: !incoming.stallPattern?.trim(),
    };
  }
  if (outgoingId && outgoingId !== destinationId) {
    const outgoing = items.find((item) => item.id === outgoingId);
    if (outgoing) {
      const frozen = await freezeDestination({ ...outgoing, status: 'queued' }, today);
      items = items.map((item) => (item.id === outgoingId ? { ...frozen, status: 'queued' } : item));
    }
  }

  const lastMarkStatus =
    incoming.lastMark?.status === 'executed' ||
    incoming.lastMark?.status === 'partial' ||
    incoming.lastMark?.status === 'shifted'
      ? incoming.lastMark.status
      : null;
  const tomorrowAngle = rotateQuestionAngle(incoming.lastQuestionAngle, lastMarkStatus);
  const tomorrowQuestion = composeGuidedQuestion({
    destinationNext: incoming.name,
    stallPattern: incoming.stallPattern,
    yesterdayStatus: lastMarkStatus,
    angle: tomorrowAngle,
  });
  items = items.map((item) =>
    item.id === destinationId
      ? {
          ...item,
          status: 'active',
          lastQuestionAngle: tomorrowAngle,
          nextQuestion: tomorrowQuestion,
        }
      : item.id === outgoingId
        ? { ...item, status: 'queued' }
        : item,
  );

  const outgoingName = board.items.find((item) => item.id === outgoingId)?.name?.trim() || '';
  const incomingName = incoming.name.trim();
  if (outgoingId && outgoingId !== destinationId && outgoingName && incomingName) {
    const storedCard = stored;
    const todayLog = await getTodayLog(today);
    if (storedCard || todayLog?.primary_directive) {
      await upsertDirectiveLog({
        date: today,
        primary_directive: todayLog?.primary_directive || storedCard?.primary_directive || '',
        agency_arc: todayLog?.agency_arc || storedCard?.agency_arc || '',
        status: todayLog?.status,
        feedback_note: todayLog?.feedback_note,
        destination_id: todayLog?.destination_id ?? storedCard?.destination_id,
        swap_audit: `You pointed at ${outgoingName} this morning; now it’s ${incomingName}.`,
      }).catch(() => {});
    }
  }

  await swapRemoteDestination(destinationId).catch(() => {});
  const next = await writeBoard({ activeId: destinationId, items });
  await writeRemoteMorningQuestion(tomorrowQuestion).catch(() => {});
  const active = next.items.find((item) => item.id === destinationId) ?? incoming;
  return {
    board: next,
    regenerateToday: false,
    needsStall: !active.stallPattern?.trim() && !stored,
  };
}

export async function archiveDestination(destinationId: string, reason: ArchiveReason) {
  const board = await getDestinationBoard();
  const today = localDateStamp();
  const target = board.items.find((item) => item.id === destinationId);
  if (!target) {
    return board;
  }
  const frozen = await freezeDestination(target, today);
  const archived: Destination = {
    ...frozen,
    status: 'archived',
    archivedAt: new Date().toISOString(),
    archiveReason: reason,
  };
  let items = board.items.map((item) => (item.id === destinationId ? archived : item));
  let activeId = board.activeId === destinationId ? null : board.activeId;
  if (!activeId) {
    const nextQueued = items.find((item) => item.status === 'queued');
    if (nextQueued) {
      items = items.map((item) => (item.id === nextQueued.id ? { ...item, status: 'active' } : item));
      activeId = nextQueued.id;
      await clearStoredDirective().catch(() => {});
    }
  }
  return writeBoard({ activeId, items });
}

export async function createActiveDestination(rawName: string, stallPattern?: string | null) {
  const star = asNorthStar({
    now: 'here',
    next: clipName(rawName),
    outcomes: [clipName(rawName).slice(0, 120)],
    setAt: new Date().toISOString(),
  });
  if (!star) {
    throw new Error('Name one checkable destination.');
  }
  return upsertActiveFromStar(star, stallPattern);
}
