export const IDENTITY_KEY = 'schnie.identity.v1';
export type Identity = { version: 1; kind: 'guest' } | { version: 1; kind: 'member'; name: string };

// Add aliases here to extend the special-name display. This is a local preference, not authentication.
export const SPECIAL_IDENTITIES = [
  { aliases: ['MOXUE', '墨薛'], name: '墨薛', english: 'MO XUE' },
];

export function specialIdentity(name: string) {
  const entry = SPECIAL_IDENTITIES.find(item => item.aliases.some(alias => alias.toLocaleUpperCase() === name.trim().toLocaleUpperCase()));
  return entry ? { name: entry.name, english: entry.english } : undefined;
}

export function createIdentity(name: string | null): Identity | null {
  if (name === null) return { version: 1, kind: 'guest' };
  const clean = name.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return clean ? { version: 1, kind: 'member', name: Array.from(clean).slice(0, 80).join('') } : null;
}

export function parseIdentity(raw: string | null): Identity | null {
  try {
    const value = JSON.parse(raw ?? 'null');
    if (value?.version !== 1) return null;
    if (value.kind === 'guest') return createIdentity(null);
    if (value.kind === 'member' && typeof value.name === 'string') return createIdentity(value.name);
  } catch { /* Corrupt or unavailable storage is treated as a first visit. */ }
  return null;
}
