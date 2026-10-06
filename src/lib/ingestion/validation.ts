import { z } from 'zod';

/**
 * Validates URLs against SSRF and non-public protocol vulnerabilities.
 */
function isSafePublicUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    // Block loopback, link-local, private IP and cloud metadata
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      host === '169.254.169.254' ||
      host.endsWith('.internal') ||
      host.endsWith('.local')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const rawEvidenceInputSchema = z.object({
  corpus_type: z.enum(['USER_EVIDENCE', 'PRODUCT_REFERENCE', 'COGNITIVE_REFERENCE'], {
    message: "corpus_type must be 'USER_EVIDENCE', 'PRODUCT_REFERENCE', or 'COGNITIVE_REFERENCE'",
  }),
  source_platform: z.string().min(1, 'source_platform is required'),
  source_type: z.string().min(1, 'source_type is required'),
  product_name: z.string().nullable().optional(),
  product_id: z.string().nullable().optional(),
  source_record_id: z.string().nullable().optional(),
  source_url: z
    .string()
    .url('source_url must be a valid URL')
    .refine(isSafePublicUrl, 'source_url must be a safe public HTTP/HTTPS URL'),
  canonical_url: z.string().url().nullable().optional(),
  original_url: z.string().url().nullable().optional(),
  parent_thread_url: z.string().url().nullable().optional(),
  sequence_in_thread: z.number().int().nonnegative().nullable().optional(),
  title: z.string().nullable().optional(),
  original_text: z
    .string()
    .min(10, 'original_text must contain at least 10 characters')
    .refine((txt) => txt.trim().length > 0, 'original_text cannot be purely whitespace'),
  language: z.string().nullable().optional(),
  country_market: z.string().nullable().optional(),
  rating: z.number().nullable().optional(),
  helpful_score: z.number().int().nonnegative().nullable().optional(),
  published_at: z.string().datetime({ offset: true }).nullable().optional(),
  collection_method: z.string().min(1, 'collection_method is required'),
  verification_status: z
    .enum(['UNVERIFIED', 'SOURCE_VERIFIED', 'HUMAN_REVIEWED'])
    .default('UNVERIFIED'),
  source_access_notes: z.string().nullable().optional(),
});

export const canonicalEvidenceSchema = rawEvidenceInputSchema.extend({
  source_id: z.string().uuid('source_id must be a valid UUID referencing source_registry'),
  collection_batch_id: z.string().uuid('collection_batch_id must be a valid UUID referencing collection_batches'),
  thread_id: z.string().uuid().nullable().optional(),
  message_id: z.string().uuid().nullable().optional(),
  parent_message_id: z.string().uuid().nullable().optional(),
  content_fingerprint: z.string().length(64, 'content_fingerprint must be a 64-character SHA-256 hex string'),
  duplicate_group_id: z.string().uuid().nullable().optional(),
  duplicate_status: z.string().nullable().optional(),
  duplicate_reason: z.string().nullable().optional(),
  is_canonical: z.boolean().default(true),
  withdrawn: z.boolean().default(false),
  withdrawn_at: z.string().datetime({ offset: true }).nullable().optional(),
  withdrawal_reason: z.string().nullable().optional(),
});
