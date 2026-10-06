import { createHash } from 'crypto';
import { normalizeText } from './normalize';

/**
 * Generates the canonical content_fingerprint for a raw evidence record.
 * 
 * Rules (Architecture.md §8.3 & ResearchSchema.md §5):
 * - Hash is computed over normalized text (lowercase, whitespace-collapsed)
 *   to ensure deterministic detection of identical content across runs.
 * - Standard algorithm: SHA-256 formatted as hexadecimal string.
 */
export function generateContentFingerprint(text: string): string {
  const normalized = normalizeText(text).toLowerCase();
  return createHash('sha256').update(normalized, 'utf8').digest('hex');
}
