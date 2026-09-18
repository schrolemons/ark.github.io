import { atom } from 'nanostores';
import { createIdentity, IDENTITY_KEY, parseIdentity, type Identity } from '../../utils/identity';
export const identity = atom<Identity | null>(null);
export const identityDialogOpen = atom(false);

export function readIdentity() {
  try { return parseIdentity(localStorage.getItem(IDENTITY_KEY)); } catch { return null; }
}

export function saveIdentity(name: string | null) {
  const next = createIdentity(name);
  if (!next) return false;
  try { localStorage.setItem(IDENTITY_KEY, JSON.stringify(next)); } catch { /* Keep the choice for this page if storage is disabled. */ }
  identity.set(next);
  identityDialogOpen.set(false);
  document.documentElement.dataset.identityPending = 'false';
  return true;
}
