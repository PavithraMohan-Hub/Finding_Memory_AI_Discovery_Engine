import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { DeduplicationCheckResult } from './types';

export class DeduplicationEngine {
  private inBatchFingerprints = new Map<string, { evidenceId?: string | null; groupId: string }>();
  private inBatchSourceRecordIds = new Map<string, { evidenceId?: string | null; groupId: string }>();
  private inBatchCanonicalUrls = new Map<string, { evidenceId?: string | null; groupId: string }>();

  /**
   * Checks whether a candidate record is a duplicate against in-batch items and
   * database records.
   */
  async checkDuplicate(
    client: SupabaseClient,
    candidate: {
      content_fingerprint: string;
      source_record_id?: string | null | undefined;
      canonical_url?: string | null | undefined;
      source_platform: string;
    }
  ): Promise<DeduplicationCheckResult> {
    const { content_fingerprint, source_record_id, canonical_url, source_platform } = candidate;

    // 1. Check in-batch cache first
    if (this.inBatchFingerprints.has(content_fingerprint)) {
      const match = this.inBatchFingerprints.get(content_fingerprint)!;
      return {
        isDuplicate: true,
        duplicateReason: 'IN_BATCH_EXACT_FINGERPRINT',
        duplicateGroupId: match.groupId,
        existingEvidenceId: match.evidenceId ?? null,
      };
    }

    if (source_record_id) {
      const key = `${source_platform}:${source_record_id}`;
      if (this.inBatchSourceRecordIds.has(key)) {
        const match = this.inBatchSourceRecordIds.get(key)!;
        return {
          isDuplicate: true,
          duplicateReason: 'IN_BATCH_SOURCE_RECORD_ID',
          duplicateGroupId: match.groupId,
          existingEvidenceId: match.evidenceId ?? null,
        };
      }
    }

    if (canonical_url) {
      if (this.inBatchCanonicalUrls.has(canonical_url)) {
        const match = this.inBatchCanonicalUrls.get(canonical_url)!;
        return {
          isDuplicate: true,
          duplicateReason: 'IN_BATCH_CANONICAL_URL',
          duplicateGroupId: match.groupId,
          existingEvidenceId: match.evidenceId ?? null,
        };
      }
    }

    // 2. Query database for existing matches
    // A. Check content_fingerprint
    const { data: fpMatch, error: fpErr } = await client
      .from('raw_evidence')
      .select('evidence_id, duplicate_group_id, content_fingerprint, source_record_id, canonical_url')
      .eq('content_fingerprint', content_fingerprint)
      .limit(1)
      .maybeSingle();

    if (!fpErr && fpMatch) {
      const groupId = fpMatch.duplicate_group_id || randomUUID();
      return {
        isDuplicate: true,
        duplicateReason: 'DB_EXACT_CONTENT_FINGERPRINT',
        duplicateGroupId: groupId,
        existingEvidenceId: fpMatch.evidence_id,
      };
    }

    // B. Check source_record_id (scoped to source_platform)
    if (source_record_id) {
      const { data: idMatch, error: idErr } = await client
        .from('raw_evidence')
        .select('evidence_id, duplicate_group_id')
        .eq('source_platform', source_platform)
        .eq('source_record_id', source_record_id)
        .limit(1)
        .maybeSingle();

      if (!idErr && idMatch) {
        const groupId = idMatch.duplicate_group_id || randomUUID();
        return {
          isDuplicate: true,
          duplicateReason: 'DB_SOURCE_RECORD_ID_MATCH',
          duplicateGroupId: groupId,
          existingEvidenceId: idMatch.evidence_id,
        };
      }
    }

    // C. Check canonical_url
    if (canonical_url) {
      const { data: urlMatch, error: urlErr } = await client
        .from('raw_evidence')
        .select('evidence_id, duplicate_group_id')
        .eq('canonical_url', canonical_url)
        .limit(1)
        .maybeSingle();

      if (!urlErr && urlMatch) {
        const groupId = urlMatch.duplicate_group_id || randomUUID();
        return {
          isDuplicate: true,
          duplicateReason: 'DB_CANONICAL_URL_MATCH',
          duplicateGroupId: groupId,
          existingEvidenceId: urlMatch.evidence_id,
        };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Registers a processed record into in-batch deduplication tracking.
   */
  registerProcessed(
    candidate: {
      evidenceId?: string | null | undefined;
      content_fingerprint: string;
      source_record_id?: string | null | undefined;
      canonical_url?: string | null | undefined;
      source_platform: string;
      groupId?: string | null | undefined;
    }
  ) {
    const groupId = candidate.groupId || randomUUID();

    this.inBatchFingerprints.set(candidate.content_fingerprint, {
      evidenceId: candidate.evidenceId ?? null,
      groupId,
    });

    if (candidate.source_record_id) {
      const key = `${candidate.source_platform}:${candidate.source_record_id}`;
      this.inBatchSourceRecordIds.set(key, {
        evidenceId: candidate.evidenceId ?? null,
        groupId,
      });
    }

    if (candidate.canonical_url) {
      this.inBatchCanonicalUrls.set(candidate.canonical_url, {
        evidenceId: candidate.evidenceId ?? null,
        groupId,
      });
    }
  }
}
