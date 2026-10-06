import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { DeduplicationEngine } from './deduplicate';
import { generateContentFingerprint } from './fingerprint';
import { normalizeIsoDate, normalizeText, normalizeUrl } from './normalize';
import {
  CanonicalRawEvidence,
  CollectionBatchStatus,
  CorpusType,
  IngestionBatchSummary,
  RawEvidenceInput,
} from './types';
import { canonicalEvidenceSchema, rawEvidenceInputSchema } from './validation';

export interface IngestBatchOptions {
  client: SupabaseClient;
  source_id: string;
  batch_id?: string;
  batch_purpose?: string;
  records: RawEvidenceInput[];
}

export async function ingestEvidenceBatch(
  options: IngestBatchOptions
): Promise<IngestionBatchSummary> {
  const { client, source_id, records, batch_purpose } = options;
  const startedAt = new Date().toISOString();

  // 1. Verify source exists in source_registry
  const { data: source, error: sourceErr } = await client
    .from('source_registry')
    .select('source_id, source_platform, corpus_type, access_status')
    .eq('source_id', source_id)
    .single();

  if (sourceErr || !source) {
    throw new Error(`Invalid source_id: Source ${source_id} not found in source_registry.`);
  }

  if (source.access_status === 'UNAVAILABLE') {
    throw new Error(`Cannot ingest evidence: Source ${source_id} has access_status UNAVAILABLE.`);
  }

  // 2. Create or verify collection batch
  let batchId = options.batch_id;
  if (!batchId) {
    batchId = randomUUID();
    const { error: batchInsertErr } = await client.from('collection_batches').insert({
      batch_id: batchId,
      source_id: source.source_id,
      corpus_type: source.corpus_type,
      product_name: records[0]?.product_name || 'Google Photos',
      collection_method: records[0]?.collection_method || 'MANUAL_STRUCTURED_IMPORT',
      status: 'RUNNING',
      records_fetched: records.length,
      records_stored: 0,
      records_duplicate: 0,
      records_failed: 0,
      config_snapshot: {
        purpose: batch_purpose || 'Phase 2 — 10-record vertical slice',
        source_platform: source.source_platform,
      },
      checkpoint_state: {
        phase: 'Phase 2',
        initial_record_count: records.length,
      },
      started_at: startedAt,
    });

    if (batchInsertErr) {
      throw new Error(`Failed to create collection_batches record: ${batchInsertErr.message}`);
    }
  }

  const dedupEngine = new DeduplicationEngine();
  const summary: IngestionBatchSummary = {
    batch_id: batchId,
    source_id: source.source_id,
    status: 'RUNNING',
    records_considered: records.length,
    records_stored: 0,
    records_duplicate: 0,
    records_failed: 0,
    errors: [],
    started_at: startedAt,
    completed_at: '',
  };

  // 3. Process records sequentially for strong deduplication and ordering
  for (let i = 0; i < records.length; i++) {
    const rawInput = records[i];
    if (!rawInput) continue;

    try {
      // Normalization
      const normalizedText = normalizeText(rawInput.original_text);
      const cleanSourceUrl = rawInput.source_url?.trim() || '';
      const cleanCanonicalUrl = normalizeUrl(rawInput.canonical_url || cleanSourceUrl);
      const cleanPublishedAt = normalizeIsoDate(rawInput.published_at);

      const normalizedInput = {
        ...rawInput,
        original_text: normalizedText,
        source_url: cleanSourceUrl,
        canonical_url: cleanCanonicalUrl || null,
        published_at: cleanPublishedAt,
      };

      // Validation
      const inputValidation = rawEvidenceInputSchema.safeParse(normalizedInput);
      if (!inputValidation.success) {
        summary.records_failed++;
        summary.errors.push({
          index: i,
          reason: `Input validation failed: ${inputValidation.error.issues.map((e: { message: string }) => e.message).join('; ')}`,
        });
        continue;
      }

      // Fingerprint generation
      const fingerprint = generateContentFingerprint(normalizedText);

      // Deduplication check
      const dedupCheck = await dedupEngine.checkDuplicate(client, {
        content_fingerprint: fingerprint,
        source_record_id: normalizedInput.source_record_id,
        canonical_url: normalizedInput.canonical_url,
        source_platform: normalizedInput.source_platform,
      });

      const isCanonical = !dedupCheck.isDuplicate;
      const duplicateGroupId = dedupCheck.duplicateGroupId || null;
      const duplicateStatus = dedupCheck.isDuplicate ? 'DUPLICATE' : null;
      const duplicateReason = dedupCheck.duplicateReason || null;

      if (dedupCheck.isDuplicate) {
        summary.records_duplicate++;
      }

      const canonicalPayload: CanonicalRawEvidence = {
        evidence_id: randomUUID(),
        corpus_type: (normalizedInput.corpus_type || 'USER_EVIDENCE') as CorpusType,
        source_id: source.source_id,
        collection_batch_id: batchId,
        thread_id: null,
        message_id: null,
        parent_message_id: null,
        source_platform: normalizedInput.source_platform || 'Reddit',
        source_type: normalizedInput.source_type || 'PUBLIC_FORUM',
        product_name: normalizedInput.product_name ?? null,
        product_id: normalizedInput.product_id ?? null,
        source_record_id: normalizedInput.source_record_id ?? null,
        source_url: normalizedInput.source_url,
        canonical_url: normalizedInput.canonical_url ?? null,
        original_url: normalizedInput.original_url ?? null,
        parent_thread_url: normalizedInput.parent_thread_url ?? null,
        sequence_in_thread: normalizedInput.sequence_in_thread ?? null,
        title: normalizedInput.title ?? null,
        original_text: normalizedText,
        language: normalizedInput.language ?? 'en',
        country_market: normalizedInput.country_market ?? null,
        rating: normalizedInput.rating ?? null,
        helpful_score: normalizedInput.helpful_score ?? null,
        published_at: cleanPublishedAt,
        collected_at: new Date().toISOString(),
        collection_method: normalizedInput.collection_method || 'MANUAL_STRUCTURED_IMPORT',
        verification_status: normalizedInput.verification_status || 'SOURCE_VERIFIED',
        source_access_notes: normalizedInput.source_access_notes ?? null,
        content_fingerprint: fingerprint,
        duplicate_group_id: duplicateGroupId,
        duplicate_status: duplicateStatus,
        duplicate_reason: duplicateReason,
        is_canonical: isCanonical,
        withdrawn: false,
        withdrawn_at: null,
        withdrawal_reason: null,
      };

      // Validate full canonical record
      const canonicalValidation = canonicalEvidenceSchema.safeParse(canonicalPayload);
      if (!canonicalValidation.success) {
        summary.records_failed++;
        summary.errors.push({
          index: i,
          reason: `Canonical validation failed: ${canonicalValidation.error.issues.map((e: { message: string }) => e.message).join('; ')}`,
        });
        continue;
      }

      // Insert into raw_evidence
      const { error: insertErr } = await client.from('raw_evidence').insert(canonicalPayload);

      if (insertErr) {
        summary.records_failed++;
        summary.errors.push({
          index: i,
          reason: `Database insert failed: ${insertErr.message}`,
        });
      } else {
        summary.records_stored++;
        dedupEngine.registerProcessed({
          evidenceId: canonicalPayload.evidence_id,
          content_fingerprint: fingerprint,
          source_record_id: normalizedInput.source_record_id,
          canonical_url: normalizedInput.canonical_url,
          source_platform: normalizedInput.source_platform,
          groupId: duplicateGroupId,
        });
      }
    } catch (err: unknown) {
      summary.records_failed++;
      summary.errors.push({
        index: i,
        reason: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  // 4. Update batch record
  const completedAt = new Date().toISOString();
  let finalStatus: CollectionBatchStatus = 'COMPLETE';
  if (summary.records_failed > 0 && summary.records_stored === 0) {
    finalStatus = 'FAILED';
  } else if (summary.records_failed > 0) {
    finalStatus = 'PARTIAL';
  }

  summary.status = finalStatus;
  summary.completed_at = completedAt;

  await client
    .from('collection_batches')
    .update({
      status: finalStatus,
      records_stored: summary.records_stored,
      records_duplicate: summary.records_duplicate,
      records_failed: summary.records_failed,
      completed_at: completedAt,
      error_summary:
        summary.errors.length > 0 ? JSON.stringify(summary.errors.slice(0, 5)) : null,
    })
    .eq('batch_id', batchId);

  return summary;
}
