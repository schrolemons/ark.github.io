export const IDENTITY_KEY = 'schnie.identity.v1';
export type Identity = { version: 1; kind: 'guest' } | { version: 1; kind: 'member'; name: string };

// Add aliases here to extend the special-name display. This is a local preference, not authentication.
export const SPECIAL_IDENTITIES: {aliases: string[]; name: string; english: string; code?: string; signature?: string}[] = [
  { aliases: ['MOXUE', '墨薛'], name: '墨薛', english: 'MO XUE', code: '009',signature:'大尾巴狼' },
  { aliases: ['RUI', '瑞'], name: '瑞', english: 'RUI',signature:'神秘小狐狸' },
  { aliases: ['LI FENG', '璃风'], name: '璃风', english: 'LI FENG',signature:'我是白咪咪喵喵猫' },
  { aliases: ['FAN XIN', '樊昕'], name: '樊昕', english: 'FAN XIN',signature:'我最爱看擦边' },
];

export function specialIdentity(name: string) {
  const entry = SPECIAL_IDENTITIES.find(item => item.aliases.some(alias => alias.toLocaleUpperCase() === name.trim().toLocaleUpperCase()));
  if (!entry) return undefined;
  const {aliases, ...profile} = entry;
  return profile;
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
