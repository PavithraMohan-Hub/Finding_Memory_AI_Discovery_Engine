/**
 * Ingestion Layer Type Definitions
 * 
 * Conforms to:
 * - docs/ResearchSchema.md §1, §3, §4, §5, §7
 * - docs/Architecture.md §8 (Ingestion Layer & Connector Interface)
 * - docs/Decisions.md D023
 */

export type CorpusType = 'USER_EVIDENCE' | 'PRODUCT_REFERENCE' | 'COGNITIVE_REFERENCE';

export type VerificationStatus = 'UNVERIFIED' | 'SOURCE_VERIFIED' | 'HUMAN_REVIEWED';

export type CollectionBatchStatus = 'PENDING' | 'RUNNING' | 'PARTIAL' | 'FAILED' | 'COMPLETE';

export type DuplicateStatus = 'UNIQUE' | 'DUPLICATE' | 'SUSPECTED_DUPLICATE';

export interface RawEvidenceInput {
  corpus_type: CorpusType;
  source_platform: string;
  source_type: string;
  product_name?: string | null;
  product_id?: string | null;
  source_record_id?: string | null;
  source_url: string;
  canonical_url?: string | null;
  original_url?: string | null;
  parent_thread_url?: string | null;
  sequence_in_thread?: number | null;
  title?: string | null;
  original_text: string;
  language?: string | null;
  country_market?: string | null;
  rating?: number | null;
  helpful_score?: number | null;
  published_at?: string | null;
  collection_method: string;
  verification_status?: VerificationStatus | null;
  source_access_notes?: string | null;
}

export interface CanonicalRawEvidence {
  evidence_id?: string | null;
  corpus_type: CorpusType;
  source_id: string;
  collection_batch_id: string;
  thread_id?: string | null;
  message_id?: string | null;
  parent_message_id?: string | null;
  source_platform: string;
  source_type: string;
  product_name: string | null;
  product_id: string | null;
  source_record_id: string | null;
  source_url: string;
  canonical_url: string | null;
  original_url: string | null;
  parent_thread_url: string | null;
  sequence_in_thread: number | null;
  title: string | null;
  original_text: string;
  language: string | null;
  country_market: string | null;
  rating: number | null;
  helpful_score: number | null;
  published_at: string | null;
  collected_at: string;
  collection_method: string;
  verification_status: VerificationStatus;
  source_access_notes: string | null;
  content_fingerprint: string;
  duplicate_group_id: string | null;
  duplicate_status: string | null;
  duplicate_reason: string | null;
  is_canonical: boolean;
  withdrawn: boolean;
  withdrawn_at: string | null;
  withdrawal_reason: string | null;
}

export interface DeduplicationCheckResult {
  isDuplicate: boolean;
  duplicateReason?: string | null;
  duplicateGroupId?: string | null;
  existingEvidenceId?: string | null;
}

export interface SourceConnector {
  readonly name: string;
  readonly corpus_type: CorpusType;
  readonly source_platform: string;
  readonly source_type: string;
  readonly permitted_route: string;
  fetchRecords(): Promise<RawEvidenceInput[]>;
}

export interface IngestionBatchSummary {
  batch_id: string;
  source_id: string;
  status: CollectionBatchStatus;
  records_considered: number;
  records_stored: number;
  records_duplicate: number;
  records_failed: number;
  errors: Array<{ index: number; reason: string }>;
  started_at: string;
  completed_at: string;
}
