import { useSyncExternalStore } from 'react';
import { buildRoute, parseRoute, type Section } from '../utils/hash-route';

const subscribe = (notify: () => void) => {
  window.addEventListener('hashchange', notify);
  return () => window.removeEventListener('hashchange', notify);
};
const getSnapshot = () => window.location.hash;

export function useHashRoute() {
  return parseRoute(useSyncExternalStore(subscribe, getSnapshot, () => ''));
}

export function navigateRoute(section: Section, segments: string[] = [], params: Record<string, string> = {}, replace = false) {
  const hash = buildRoute(section, segments, params);
  if (window.location.hash === hash) return;
  if (replace) {
    window.history.replaceState(window.history.state, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = hash;
  }
}
