const RETURN_KEY = 'schnie.navigation.return';
type ReturnEntry = {from: string; to: string; parent?: ReturnEntry};
const SCROLL_KEY = 'schnie.navigation.positions';
const scrollSelectors = ['.operator-view', '.information-view', '[data-world-overview]', '.media-overview', '.gallery-view', '[data-more-page]', '#info-layout-main-slot', '#docs-content', '#world-container', '#operator-container'];
const pageKey = (url: URL) => url.pathname.replace(/\/$/, '') + url.search;

function localURL(value: unknown): URL | null {
  if (typeof value !== 'string') return null;
  try { const url = new URL(value, location.href); return url.origin === location.origin ? url : null; } catch { return null; }
}

export function previousPage(fallback: string) {
  const entry = history.state?.archiveReturn as ReturnEntry | undefined;
  const from = localURL(entry?.from);
  return from && entry?.to === pageKey(new URL(location.href)) ? from.href : fallback;
}

export function rememberNavigation() {
  // Attach the return URL to this entry, retaining its hash and filters after reload.
  try {
    const entry = JSON.parse(sessionStorage.getItem(RETURN_KEY) ?? 'null') as ReturnEntry | null;
    sessionStorage.removeItem(RETURN_KEY);
    if (entry && localURL(entry.from) && entry.to === pageKey(new URL(location.href))) {
      history.replaceState({...history.state, archiveReturn: entry}, '');
    }
  } catch { /* Navigation remains available when browser storage is disabled. */ }
  // Native heading links create fresh history entries with null state.
  // Carry the document's parent forward, including when reloading a heading.
  const documentReturn = history.state?.archiveReturn;
  window.addEventListener('hashchange', () => {
    if (documentReturn && !history.state?.archiveReturn) history.replaceState({...history.state, archiveReturn: documentReturn}, '');
  });
  try {
    const positions = JSON.parse(sessionStorage.getItem(SCROLL_KEY) ?? '{}')[location.href] as Record<string, number> | undefined;
    if (positions) {
      const deadline = performance.now() + 4000;
      const restore = () => {
        const pending = Object.entries(positions).filter(([selector, top]) => {
          const element = document.querySelector(selector);
          if (!element) return true;
          element.scrollTop = top;
          return Math.abs(element.scrollTop - top) > 2;
        });
        if (pending.length && performance.now() < deadline) requestAnimationFrame(restore);
      };
      requestAnimationFrame(restore);
    }
  } catch { /* Scroll restoration is optional. */ }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element)?.closest<HTMLAnchorElement>('a[href]');
    if (!anchor || anchor.hasAttribute('download')) return;
    const target = anchor.getAttribute('target') ?? document.querySelector('base')?.target ?? '_self';
    if (target !== '_self') return;
    const url = localURL(anchor.href);
    if (!url || pageKey(url) === pageKey(new URL(location.href))) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(SCROLL_KEY) ?? '{}');
      const positions = Object.fromEntries(scrollSelectors.map(selector => [selector, document.querySelector(selector)?.scrollTop ?? 0]).filter(([, top]) => Number(top) > 0));
      const recent = Object.entries(saved).slice(-9);
      sessionStorage.setItem(SCROLL_KEY, JSON.stringify({...Object.fromEntries(recent), [location.href]: positions}));
      const entry = anchor.classList.contains('go-back-tool')
        ? history.state?.archiveReturn?.parent ?? null
        : {from: location.href, to: pageKey(url), parent: history.state?.archiveReturn};
      sessionStorage.setItem(RETURN_KEY, JSON.stringify(entry));
    } catch { /* Optional persistence. */ }
  });
}
