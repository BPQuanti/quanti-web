type AuthLike = {
  user_metadata?: Record<string, unknown> | null;
  identities?: Array<{ identity_data?: Record<string, unknown> | null }> | null;
} | null;

function firstString(...values: unknown[]) {
  for (const value of values) {
    const text = String(value ?? '').trim();
    if (text) {
      return text;
    }
  }
  return '';
}

function composedName(record: Record<string, unknown> | null | undefined) {
  if (!record) {
    return '';
  }
  return [record.given_name, record.family_name].filter(Boolean).join(' ').trim();
}

export function displayNameFromAuthUser(user: AuthLike) {
  const meta = user?.user_metadata ?? {};
  const identity = user?.identities?.[0]?.identity_data ?? {};
  return firstString(
    meta.full_name,
    meta.name,
    composedName(meta),
    identity.full_name,
    identity.name,
    composedName(identity),
  );
}

export function firstNameFromDisplay(name: string | null | undefined, fallback = 'there') {
  return String(name || '').trim().split(/\s+/).filter(Boolean)[0] || fallback;
}
