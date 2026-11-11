export const CARD_VERBS = [
  'Build',
  'Draft',
  'Deploy',
  'Ship',
  'Write',
  'Fix',
  'Send',
  'Call',
  'Schedule',
  'Open',
  'Record',
  'Cut',
  'Print',
  'File',
  'Review',
  'Name',
] as const;

const VERB_SET = new Set(CARD_VERBS.map((verb) => verb.toLowerCase()));

const GENERIC = /\b(next section|the next step|make progress|work on it|keep going|do the work)\b/i;

const GUILT = /\b(you failed|failed again|missed again|streak lost|behind schedule|you didn'?t|guilt)\b/i;

export function wordCount(text: string) {
  return text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

export function firstToken(text: string) {
  return text.replace(/\s+/g, ' ').trim().split(' ')[0] || '';
}

export function isAllowedVerb(token: string) {
  return VERB_SET.has(token.toLowerCase());
}

/** One verb-first phrase: no coordinating second action. */
export function hasSingleVerbPhrase(text: string) {
  return !/\band\b/i.test(text.replace(/\s+/g, ' ').trim());
}

export function hasUntilCondition(text: string) {
  return /\buntil\b/i.test(text);
}

export function isGenericCard(text: string) {
  return GENERIC.test(text);
}

export function hasGuiltCopy(text: string) {
  return GUILT.test(text);
}

export function assertCardContract(cardText: string) {
  const text = cardText.replace(/\s+/g, ' ').trim();
  const words = wordCount(text);
  const verb = firstToken(text);
  const errors: string[] = [];
  if (words < 15 || words > 20) {
    errors.push(`word count ${words}`);
  }
  if (!isAllowedVerb(verb)) {
    errors.push(`first token ${verb}`);
  }
  if (!hasSingleVerbPhrase(text)) {
    errors.push('multiple verb phrases');
  }
  if (!hasUntilCondition(text)) {
    errors.push('missing until');
  }
  if (isGenericCard(text)) {
    errors.push('generic card');
  }
  return { ok: errors.length === 0, errors, text, words, verb };
}
