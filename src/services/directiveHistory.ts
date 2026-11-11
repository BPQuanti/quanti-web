import AsyncStorage from '@react-native-async-storage/async-storage';
import { scopedAsyncKey } from './sessionIsolation';

export type ExecutionStatus = 'executed' | 'partial' | 'shifted' | 'unknown';
export type MissReason = 'too_big' | 'wrong_move' | 'exogenous' | 'none';

export interface DirectiveLog {
  date: string;
  primary_directive: string;
  agency_arc: string;
  status?: ExecutionStatus;
  miss_reason?: MissReason;
  feedback_note?: string;
  destination_id?: string;
  swap_audit?: string;
}

/** Local civil day keyed after 04:00. 00:00–03:59 still belong to yesterday. */
const DAY_CUTOVER_HOUR = 4;

const STORAGE_KEY = '@quanti_directive_history';
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeDirectiveHistory(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function localDateStamp(date = new Date()) {
  const shifted = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours() - DAY_CUTOVER_HOUR,
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
  const year = shifted.getFullYear();
  const month = String(shifted.getMonth() + 1).padStart(2, '0');
  const day = String(shifted.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(stamp: string, days: number) {
  const [year, month, day] = stamp.slice(0, 10).split('-').map(Number);
  const next = new Date(year, (month || 1) - 1, day || 1, 12, 0, 0);
  next.setDate(next.getDate() + days);
  return localDateStamp(next);
}

function isStatus(value: unknown): value is ExecutionStatus {
  return value === 'executed' || value === 'partial' || value === 'shifted' || value === 'unknown';
}

function isMissReason(value: unknown): value is MissReason {
  return value === 'too_big' || value === 'wrong_move' || value === 'exogenous' || value === 'none';
}

export function isOpenMark(status?: ExecutionStatus | null) {
  return !status || status === 'unknown';
}

export function missReasonToStatus(reason: MissReason): ExecutionStatus {
  if (reason === 'too_big') {
    return 'partial';
  }
  if (reason === 'wrong_move' || reason === 'exogenous') {
    return 'shifted';
  }
  return 'executed';
}

function asLog(value: unknown): DirectiveLog | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Partial<DirectiveLog>;
  if (typeof record.date !== 'string' || typeof record.primary_directive !== 'string') {
    return null;
  }
  return {
    date: record.date.slice(0, 10),
    primary_directive: record.primary_directive,
    agency_arc: typeof record.agency_arc === 'string' ? record.agency_arc : '',
    status: isStatus(record.status) ? record.status : undefined,
    miss_reason: isMissReason(record.miss_reason) ? record.miss_reason : undefined,
    feedback_note: typeof record.feedback_note === 'string' ? record.feedback_note : undefined,
    destination_id: typeof record.destination_id === 'string' ? record.destination_id : undefined,
    swap_audit: typeof record.swap_audit === 'string' ? record.swap_audit : undefined,
  };
}

async function readLogs(): Promise<DirectiveLog[]> {
  try {
    const raw = await AsyncStorage.getItem(await scopedAsyncKey(STORAGE_KEY));
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(asLog).filter((log): log is DirectiveLog => Boolean(log));
  } catch {
    return [];
  }
}

async function writeLogs(logs: DirectiveLog[]) {
  await AsyncStorage.setItem(await scopedAsyncKey(STORAGE_KEY), JSON.stringify(logs.slice(-90)));
  notify();
}

export async function listDirectiveLogs(): Promise<DirectiveLog[]> {
  const logs = await readLogs();
  return [...logs].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getTodayLog(date = localDateStamp()): Promise<DirectiveLog | null> {
  const logs = await readLogs();
  return logs.find((log) => log.date === date) ?? null;
}

export async function getPriorExecution(
  today = localDateStamp(),
  destinationId?: string | null,
): Promise<DirectiveLog | null> {
  const logs = await listDirectiveLogs();
  return (
    logs.find((log) => {
      if (log.date >= today || isOpenMark(log.status)) {
        return false;
      }
      if (!destinationId) {
        return true;
      }
      return !log.destination_id || log.destination_id === destinationId;
    }) ?? null
  );
}

export async function upsertDirectiveLog(entry: DirectiveLog): Promise<DirectiveLog> {
  const logs = await readLogs();
  const next: DirectiveLog = {
    ...entry,
    date: entry.date.slice(0, 10),
  };
  const index = logs.findIndex((log) => log.date === next.date);
  if (index >= 0) {
    const prev = logs[index];
    logs[index] = {
      ...prev,
      ...next,
      status: next.status ?? prev.status,
      miss_reason: next.miss_reason ?? prev.miss_reason,
      primary_directive: next.primary_directive || prev.primary_directive,
      destination_id: next.destination_id ?? prev.destination_id,
      swap_audit: next.swap_audit ?? prev.swap_audit,
      feedback_note: next.feedback_note ?? prev.feedback_note,
    };
  } else {
    logs.push(next);
  }
  await writeLogs(logs);
  return index >= 0 ? logs[index] : next;
}

export async function rememberDirectiveCard(entry: {
  date: string;
  primary_directive: string;
  agency_arc?: string;
  destination_id?: string;
}): Promise<DirectiveLog> {
  const date = entry.date.slice(0, 10);
  const current = await getTodayLog(date);
  return upsertDirectiveLog({
    date,
    primary_directive: entry.primary_directive,
    agency_arc: entry.agency_arc ?? current?.agency_arc ?? '',
    status: current?.status && !isOpenMark(current.status) ? current.status : 'unknown',
    miss_reason: current?.miss_reason,
    destination_id: entry.destination_id ?? current?.destination_id,
    feedback_note: current?.feedback_note,
    swap_audit: current?.swap_audit,
  });
}

export async function getOpenMark(date: string): Promise<DirectiveLog | null> {
  const log = await getTodayLog(date);
  if (log?.primary_directive?.trim() && isOpenMark(log.status)) {
    return log;
  }
  return null;
}

export function formatLogDate(stamp: string) {
  const [year, month, day] = stamp.slice(0, 10).split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  if (!Number.isFinite(date.getTime())) {
    return stamp.slice(0, 10);
  }
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export async function setTodayExecution(input: {
  date?: string;
  primary_directive: string;
  agency_arc: string;
  status: ExecutionStatus;
  miss_reason?: MissReason;
  feedback_note?: string;
  destination_id?: string;
}): Promise<DirectiveLog> {
  const date = input.date?.slice(0, 10) || localDateStamp();
  const current = await getTodayLog(date);
  return upsertDirectiveLog({
    date,
    primary_directive: input.primary_directive,
    agency_arc: input.agency_arc,
    status: input.status,
    miss_reason: input.miss_reason ?? (input.status === 'executed' ? 'none' : current?.miss_reason),
    feedback_note: input.feedback_note ?? current?.feedback_note,
    destination_id: input.destination_id ?? current?.destination_id,
    swap_audit: current?.swap_audit,
  });
}
