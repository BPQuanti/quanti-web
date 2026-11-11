import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { currentUserId } from './sessionIsolation';
import { asPhysicsMemory, type DestinationPhysicsMemory } from './destinationPhysics';
import { asQuestionAngle, type QuestionAngle } from './voiceCheckPrompt';

type CloudDestination = {
  id: string;
  name: string;
  now: string;
  setAt: string;
  status: 'active' | 'queued' | 'archived';
  stallPattern?: string | null;
  doneWhen?: string | null;
  constraints?: string | null;
  currentBottleneck?: string | null;
  lastQuestionAngle?: QuestionAngle;
  lastMark?: unknown;
  nextQuestion?: string | null;
  physicsMemory?: DestinationPhysicsMemory;
};

type CloudBoard = {
  activeId: string | null;
  items: CloudDestination[];
};

export type RemoteDestinationRow = {
  id: string;
  user_id: string;
  title: string;
  stale_pattern: string | null;
  status: 'active' | 'queued' | 'archived';
  last_question_angle: QuestionAngle | string | null;
  physics_memory?: DestinationPhysicsMemory | null;
  done_when?: string | null;
  constraints?: string | null;
  current_bottleneck?: string | null;
  created_at: string;
  updated_at: string;
};

const DESTINATION_COLUMNS =
  'id, user_id, title, stale_pattern, status, last_question_angle, physics_memory, done_when, constraints, current_bottleneck, created_at, updated_at';

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function asAngle(value: unknown): QuestionAngle {
  return asQuestionAngle(value);
}

function rowToDestination(row: RemoteDestinationRow): CloudDestination {
  return {
    id: row.id,
    name: row.title,
    now: 'here',
    setAt: row.created_at,
    status: row.status,
    stallPattern: row.stale_pattern,
    doneWhen: row.done_when ?? null,
    constraints: row.constraints ?? null,
    currentBottleneck: row.current_bottleneck ?? row.stale_pattern ?? null,
    lastQuestionAngle: asAngle(row.last_question_angle),
    lastMark: null,
    nextQuestion: null,
    physicsMemory: asPhysicsMemory(row.physics_memory),
  };
}

export async function pullRemoteDestinations(): Promise<CloudBoard | null> {
  try {
    if (!isSupabaseConfigured) {
      return null;
    }
    const userId = await currentUserId();
    if (!userId) {
      return null;
    }
    const { data, error } = await supabase
      .from('user_destinations')
      .select(DESTINATION_COLUMNS)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error || !data?.length) {
      return null;
    }
    const items = (data as RemoteDestinationRow[]).map(rowToDestination);
    const activeId = items.find((item) => item.status === 'active')?.id ?? null;
    return { activeId, items };
  } catch (caught) {
    console.warn('[Destinations] remote pull failed', caught);
    return null;
  }
}

export async function pushDestination(item: CloudDestination): Promise<CloudDestination | null> {
  if (!isSupabaseConfigured) {
    return null;
  }
  const userId = await currentUserId();
  if (!userId) {
    return null;
  }
  const payload = {
    user_id: userId,
    title: item.name.slice(0, 280),
    stale_pattern: item.stallPattern ?? null,
    done_when: item.doneWhen ?? null,
    constraints: item.constraints ?? null,
    current_bottleneck: item.currentBottleneck ?? item.stallPattern ?? null,
    status: item.status,
    last_question_angle: item.lastQuestionAngle ?? 'BOTTLENECK',
    physics_memory: asPhysicsMemory(item.physicsMemory),
    updated_at: new Date().toISOString(),
  };
  if (isUuid(item.id)) {
    const { data, error } = await supabase
      .from('user_destinations')
      .upsert({ id: item.id, ...payload }, { onConflict: 'id' })
      .select(DESTINATION_COLUMNS)
      .maybeSingle();
    if (error || !data) {
      console.warn('[Destinations] upsert failed', error?.message);
      return null;
    }
    return rowToDestination(data as RemoteDestinationRow);
  }
  const { data, error } = await supabase
    .from('user_destinations')
    .insert(payload)
    .select(DESTINATION_COLUMNS)
    .maybeSingle();
  if (error || !data) {
    console.warn('[Destinations] insert failed', error?.message);
    return null;
  }
  return {
    ...rowToDestination(data as RemoteDestinationRow),
    lastMark: item.lastMark,
    nextQuestion: item.nextQuestion,
    stallPattern: item.stallPattern,
    physicsMemory: item.physicsMemory ?? asPhysicsMemory(null),
  };
}

export async function pushDestinationBoard(board: CloudBoard): Promise<CloudBoard> {
  const remapped: CloudDestination[] = [];
  const ordered = [...board.items].sort((a, b) => {
    if (a.status === 'active') {
      return 1;
    }
    if (b.status === 'active') {
      return -1;
    }
    return 0;
  });
  for (const item of ordered) {
    const saved = await pushDestination(item);
    remapped.push(
      saved
        ? {
            ...item,
            ...saved,
            lastMark: item.lastMark,
            nextQuestion: item.nextQuestion,
            physicsMemory: item.physicsMemory ?? saved.physicsMemory,
          }
        : item,
    );
  }
  const active =
    remapped.find((item) => item.status === 'active') ??
    remapped.find((item) => item.id === board.activeId) ??
    null;
  if (active && isUuid(active.id)) {
    const userId = await currentUserId();
    if (userId) {
      await supabase
        .from('profiles')
        .update({ active_destination_id: active.id, updated_at: new Date().toISOString() })
        .eq('id', userId);
    }
  }
  return { activeId: active?.id ?? null, items: remapped };
}

export async function swapRemoteDestination(destinationId: string) {
  if (!isSupabaseConfigured || !isUuid(destinationId)) {
    return false;
  }
  const { error } = await supabase.rpc('swap_active_destination', {
    p_destination_id: destinationId,
  });
  if (error) {
    console.warn('[Destinations] swap rpc failed', error.message);
    return false;
  }
  return true;
}

export async function readRemoteVision(): Promise<{
  northStar: string | null;
  nextMorningQuestion: string | null;
  activeDestinationId: string | null;
} | null> {
  if (!isSupabaseConfigured) {
    return null;
  }
  const userId = await currentUserId();
  if (!userId) {
    return null;
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('north_star, next_morning_question, active_destination_id')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  const row = data as {
    north_star?: string | null;
    next_morning_question?: string | null;
    active_destination_id?: string | null;
  };
  return {
    northStar: row.north_star?.trim() || null,
    nextMorningQuestion: row.next_morning_question?.trim() || null,
    activeDestinationId: row.active_destination_id ?? null,
  };
}

export async function writeRemoteVision(text: string | null) {
  if (!isSupabaseConfigured) {
    return;
  }
  const userId = await currentUserId();
  if (!userId) {
    return;
  }
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      north_star: text?.trim().slice(0, 280) || null,
      updated_at: new Date().toISOString(),
    });
  if (error) {
    console.warn('[Destinations] vision persist failed', error.message);
  }
}

export async function writeRemoteMorningQuestion(question: string | null) {
  if (!isSupabaseConfigured) {
    return;
  }
  const userId = await currentUserId();
  if (!userId) {
    return;
  }
  const { error } = await supabase
    .from('profiles')
    .update({
      next_morning_question: question?.trim().slice(0, 220) || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (error) {
    console.warn('[Destinations] morning question persist failed', error.message);
  }
}
