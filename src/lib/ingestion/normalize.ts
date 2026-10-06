/**
 * Normalization utilities for incoming raw research evidence.
 * 
 * Rules:
 * - Do not silently alter or paraphrase original text words.
 * - Normalization is for clean storage, indexing, and deterministic hashing.
 */

/**
 * Normalizes original text for clean storage and deterministic comparison.
 * Preserves verbatim words and case; normalizes Unicode NFKC and extraneous whitespace.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFKC')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Normalizes public URL for canonical deduplication by removing tracking params
 * and normalizing protocol/path formatting.
 */
export function normalizeUrl(urlStr: string): string {
  if (!urlStr || typeof urlStr !== 'string') return '';
  try {
    const parsed = new URL(urlStr.trim());
    
    // Only allow http and https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return urlStr.trim();
    }

    // Strip common tracking and referrer params
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
      'ref_source',
      'share_id',
      'fbclid',
      'gclid',
      'sh',
      'rdt',
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    // Strip trailing slash if path is longer than '/'
    let cleanPath = parsed.pathname;
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }
    parsed.pathname = cleanPath;

    // Remove hash/fragment for canonical deduplication
    parsed.hash = '';

    return parsed.toString();
  } catch {
    // If not a parseable URL, return trimmed original
    return urlStr.trim();
  }
}

/**
 * Normalizes date inputs to valid ISO-8601 strings.
 */
export function normalizeIsoDate(dateVal?: string | Date | null): string | null {
  if (!dateVal) return null;
  try {
    const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}
