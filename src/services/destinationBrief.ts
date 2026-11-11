export type DestinationBrief = {
  done_when: string | null;
  constraints: string | null;
  current_bottleneck: string | null;
};

export function emptyBrief(): DestinationBrief {
  return { done_when: null, constraints: null, current_bottleneck: null };
}

export function asBriefField(value: unknown, max = 280): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const text = value.replace(/\s+/g, ' ').trim().slice(0, max);
  return text || null;
}

export function asDestinationBrief(value: unknown): DestinationBrief {
  if (!value || typeof value !== 'object') {
    return emptyBrief();
  }
  const record = value as Record<string, unknown>;
  return {
    done_when: asBriefField(record.done_when),
    constraints: asBriefField(record.constraints),
    current_bottleneck: asBriefField(record.current_bottleneck),
  };
}
