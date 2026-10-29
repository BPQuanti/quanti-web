export type ArcId = 'RECOVERY' | 'DEEP_WORK' | 'CAPITAL' | 'CLARITY' | 'RHYTHM';

export type Arc = {
  title: string;
  emoji: string;
  action: string;
  impact: string;
  focus: string;
  accent: string;
  glow: string;
  traceData: Record<string, string>;
};

export const ARCS: Record<ArcId, Arc> = {
  RECOVERY: {
    title: 'Recovery Arc',
    emoji: '🧘',
    action: 'Shift last caloric intake 45 mins earlier',
    impact: 'Reclaim 15ms HRV | Cap caffeine at 11:30 AM',
    focus: 'Sleep architecture, HRV restore, parasympathetic recovery.',
    accent: '#10B981',
    glow: 'rgba(16, 185, 129, 0.2)',
    traceData: {
      plaid: 'Plaid Signal: Late delivery ($45.80 at 10:15 PM)',
      health: 'HealthKit: Delayed core body cooling by 2.1 hrs',
      sleep: 'Deep Sleep Impact: -35% reduction',
      arcImpact: 'Arc Impact: Shift meal time earlier tonight to protect HRV restore.',
    },
  },
  DEEP_WORK: {
    title: 'Deep Work Arc',
    emoji: '🧠',
    action: 'Cap screen time at 10:00 PM & limit caffeine to 11:30 AM',
    impact: 'Protect 9:00 AM peak cognitive window',
    focus: 'Peak morning focus windows, cognitive latency reduction.',
    accent: '#00F0FF',
    glow: 'rgba(0, 240, 255, 0.2)',
    traceData: {
      screenTime: 'Screen Time: 1.8 hrs social feeds after 10 PM',
      health: 'HealthKit: Elevated baseline pulse (+8 bpm at onset of sleep)',
      cognitive: 'Cognitive Impact: 42-minute focus latency tomorrow',
      arcImpact: 'Arc Impact: Preventing circadian drift to secure 4 hrs of flow state.',
    },
  },
  CAPITAL: {
    title: 'Capital Arc',
    emoji: '💰',
    action: 'Block high-friction impulse purchases after 9 PM',
    impact: 'Reduce fatigue-driven spending by $120/wk',
    focus: 'Impulse spend mitigation, late-night decision friction.',
    accent: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.2)',
    traceData: {
      plaid: 'Plaid Signal: 3 late-night e-commerce transactions this week',
      health: 'HealthKit: Triggered during low-energy window (HRV < 30ms)',
      financial: 'Financial Impact: $184 total non-essential expenditure',
      arcImpact: 'Arc Impact: Aligning spending friction with fatigue cycles.',
    },
  },
  CLARITY: {
    title: 'Cognitive Clarity Arc',
    emoji: '🧠',
    action: 'Protect morning daylight and cap screens at 10 PM',
    impact: 'Align complex work with the peak cognitive window',
    focus: 'Late-night screen regulation, daylight, deep-work timing.',
    accent: '#818CF8',
    glow: 'rgba(129, 140, 248, 0.2)',
    traceData: {
      screenTime: 'Screen Time: Late-night feeds after 10 PM',
      health: 'HealthKit: Reduced morning daylight minutes',
      cognitive: 'Cognitive Impact: Slower start on high-complexity tasks',
      arcImpact: 'Arc Impact: Morning daylight plus an earlier screen cutoff.',
    },
  },
  RHYTHM: {
    title: 'Sustainable Rhythm Arc',
    emoji: '🔋',
    action: 'Keep a consistent evening shutdown and one social block',
    impact: 'Steady execution without draining evenings',
    focus: 'Work-life balance, energy preservation, shutdown routines.',
    accent: '#34D399',
    glow: 'rgba(52, 211, 153, 0.2)',
    traceData: {
      calendar: 'Calendar: Overlapping evenings after a launch sprint',
      health: 'HealthKit: Uneven sleep timing across the week',
      social: 'Social Impact: Missed connection windows',
      arcImpact: 'Arc Impact: Hold shutdown time so energy lasts the week.',
    },
  },
};

export const ARC_ORDER: ArcId[] = ['RECOVERY', 'DEEP_WORK', 'CAPITAL', 'CLARITY', 'RHYTHM'];

export const ARC_PRESETS: Record<
  ArcId,
  { badge: string; title: string; target: string; body: string }
> = {
  RECOVERY: {
    badge: '🌿',
    title: 'Movement & Recovery',
    target: 'Athletes, burnout recovery, high-stress phases',
    body: 'Prioritizes physiological strain management, HRV restoration, and light activity on low-recovery days to prevent physical burnout.',
  },
  DEEP_WORK: {
    badge: '⚡',
    title: 'Founder & Deep Work',
    target: 'Entrepreneurs, builders, intense launch sprints',
    body: 'Shields focus blocks, limits cognitive context-switching, and enforces hard wind-down boundaries during high-density calendar days.',
  },
  CAPITAL: {
    badge: '💳',
    title: 'Capital & Intent',
    target: 'Financial discipline, impulse spending control',
    body: 'Identifies fatigue-driven impulse spending triggers and adds healthy friction during low-sleep or high-stress purchasing windows.',
  },
  CLARITY: {
    badge: '🧠',
    title: 'Cognitive Clarity & Focus',
    target: 'Knowledge workers, creators, students',
    body: 'Regulates late-night screen time, optimizes morning daylight exposure, and aligns high-complexity work with peak cognitive windows.',
  },
  RHYTHM: {
    badge: '🔋',
    title: 'Sustainable Rhythm',
    target: 'Post-launch stabilization, work-life balance',
    body: 'Balances steady professional execution with energy preservation, social connection, and consistent evening shutdown routines.',
  },
};

let current: ArcId | null = null;
let customContext = '';
const listeners = new Set<(id: ArcId) => void>();
const contextListeners = new Set<(value: string) => void>();

export function resetArcRuntimeState() {
  current = null;
  customContext = '';
  contextListeners.forEach((listener) => listener(''));
}

export function getActiveArc() {
  return current ?? 'DEEP_WORK';
}

export function setActiveArc(id: ArcId) {
  if (current === id) return;
  current = id;
  listeners.forEach((listener) => listener(id));
}

export function subscribeActiveArc(listener: (id: ArcId) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCustomArcContext() {
  return customContext;
}

export function setCustomArcContext(value: string) {
  customContext = value;
  contextListeners.forEach((listener) => listener(customContext));
}

export function subscribeCustomArcContext(listener: (value: string) => void) {
  contextListeners.add(listener);
  return () => {
    contextListeners.delete(listener);
  };
}
