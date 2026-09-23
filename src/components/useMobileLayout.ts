import {useSyncExternalStore} from 'react';

export const MOBILE_LAYOUT_QUERY = '(max-width: 1024px), (orientation: portrait)';
const subscribe = (notify: () => void) => {
  const query = window.matchMedia(MOBILE_LAYOUT_QUERY);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};

export function useMobileLayout() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(MOBILE_LAYOUT_QUERY).matches, () => false);
}
