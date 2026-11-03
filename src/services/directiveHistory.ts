import AsyncStorage from '@react-native-async-storage/async-storage';
import { scopedAsyncKey } from './sessionIsolation';

export type ExecutionStatus = 'executed' | 'partial' | 'shifted';

export interface DirectiveLog {
  date: string;
  primary_directive: string;
  agency_arc: string;
  status?: ExecutionStatus;
  feedback_note?: string;
  destination_id?: string;
  swap_audit?: string;
}

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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(stamp: string, days: number) {
  const [year, month, day] = stamp.slice(0, 10).split('-').map(Number);
  const next = new Date(year, (month || 1) - 1, day || 1);
  next.setDate(next.getDate() + days);
  return localDateStamp(next);
}

function isStatus(value: unknown): value is ExecutionStatus {
  return value === 'executed' || value === 'partial' || value === 'shifted';
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
      if (log.date >= today || !log.status) {
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
    logs[index] = { ...logs[index], ...next };
  } else {
    logs.push(next);
  }
  await writeLogs(logs);
  return index >= 0 ? logs[index] : next;
}

export async function setTodayExecution(input: {
  date?: string;
  primary_directive: string;
  agency_arc: string;
  status: ExecutionStatus;
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
    feedback_note: input.feedback_note ?? current?.feedback_note,
    destination_id: input.destination_id ?? current?.destination_id,
    swap_audit: current?.swap_audit,
  });
}
