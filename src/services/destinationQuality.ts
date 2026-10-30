const VAGUE_DESTINATION = [
  /^(be|get|become|stay)\s+(more\s+)?(productive|healthy|fit|happy|disciplined|consistent|focused|better)/i,
  /^(get in shape|grow( the)?( app|business)?|work out more|eat better|hustle|grind|find balance|self[- ]improve)$/i,
  /^(productivity|health|fitness|happiness|success|wellness)$/i,
];

const TOO_BIG = [
  /^(launch|build|grow|scale|start)\s+(the\s+)?(company|business|startup|career|brand)(\s|$)/i,
  /^(launch|build|grow)\s+(the\s+)?app$/i,
  /\b(get (my )?life together|change my life|become (a |an )|my life|my career)\b/i,
];

const CONCRETE_VERB =
  /\b(ship|launch|send|finish|run|write|book|close|hire|file|publish|submit|pay|sign|move|call|invite|deploy|merge|record|post|sell|buy|schedule|complete|deliver|apply|pass|quit|start|draft|build|release|walk|lift|list|email|text|ask|meet|pitch|demo|test|fix|open|save|reach|hit|land|invite)\b/i;

const MUSH_BOTTLENECK = [
  /^(i )?(just )?(procrastinate|get distracted|i'?m tired|work('s| is) busy|i don'?t know|idk|nothing|stuff)\.?$/i,
  /^(distracted|tired|busy|stressed|overwhelmed)\.?$/i,
];

function isSingular(text: string) {
  const parts = text.split(/\s+and\s+/i).map((part) => part.trim()).filter((part) => part.length > 8);
  if (parts.length >= 2 && CONCRETE_VERB.test(parts[0]) && CONCRETE_VERB.test(parts[1])) {
    return false;
  }
  return !/[;]| \/ /.test(text);
}

export function assessDestination(raw: string): { ok: boolean; reason?: string } {
  const text = raw.replace(/\s+/g, ' ').trim();
  if (text.length < 12 || text.split(' ').filter(Boolean).length < 4) {
    return { ok: false, reason: 'Name one finish line someone else could check yes or no.' };
  }
  if (VAGUE_DESTINATION.some((pattern) => pattern.test(text))) {
    return { ok: false, reason: 'Too mushy. Try “Ship TestFlight to 5 people,” not “Be productive.”' };
  }
  if (TOO_BIG.some((pattern) => pattern.test(text))) {
    return { ok: false, reason: 'That’s a project. Name the next chapter — one object, not the whole company.' };
  }
  if (!isSingular(text)) {
    return { ok: false, reason: 'One object. Split the rest into the next Active Target when this one is Achieved.' };
  }
  if (!/\d/.test(text) && !CONCRETE_VERB.test(text)) {
    return { ok: false, reason: 'Make it checkable: a named artifact, or a number someone could count.' };
  }
  return { ok: true };
}

export function assessBottleneck(raw: string): { ok: boolean; reason?: string } {
  const text = raw.replace(/\s+/g, ' ').trim();
  if (text.split(/\s+/).filter(Boolean).length < 4) {
    return {
      ok: false,
      reason: 'Name the thing — a person, a missing artifact, a slot in the day, or a tool.',
    };
  }
  if (MUSH_BOTTLENECK.some((pattern) => pattern.test(text))) {
    return { ok: false, reason: 'That’s a mood. Name the stall: person, artifact, time slot, or tool.' };
  }
  return { ok: true };
}

export function heardEcho(transcript: string, maxWords = 8): string {
  const words = transcript.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (!words.length) {
    return '';
  }
  return words.slice(0, maxWords).join(' ');
}
