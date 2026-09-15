export const sections = ['index', 'information', 'operator', 'world', 'media', 'more'] as const;
export type Section = typeof sections[number];
export type Route = { section: Section; segments: string[]; params: Record<string, string> };

/** Human-readable names remain one legal URL path segment. */
export function routeSegment(value: string): string {
  return value.trim().replace(/[^\p{L}\p{N}_.-]+/gu, '_').replace(/^[_.-]+|[_.-]+$/g, '');
}

export function parseRoute(hash: string): Route {
  const fallback: Route = { section: 'index', segments: [], params: {} };
  try {
    const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
    const [section, ...parts] = path.split('/');
    if (!sections.includes(section as Section)) return fallback;
    const decoded = parts.map(decodeURIComponent);
    if (decoded.some(part => /[/\\\u0000-\u001f]/.test(part) || !routeSegment(part))) return fallback;
    return { section: section as Section, segments: decoded.map(routeSegment), params: Object.fromEntries(new URLSearchParams(query)) };
  } catch {
    return fallback;
  }
}

export function buildRoute(section: Section, segments: string[] = [], params: Record<string, string> = {}): string {
  const path = [section, ...segments.map(routeSegment).filter(Boolean).map(encodeURIComponent)].join('/');
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '')).toString();
  return `#${path}${query ? `?${query}` : ''}`;
}
