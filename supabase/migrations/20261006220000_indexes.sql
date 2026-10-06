-- Migration 008: Indexes
-- Description: Establishes high-priority query performance indexes and foreign-key join path indexes.
-- Conforms to: ResearchSchema.md §17; Architecture.md §7; Decisions.md D024

-- ============================================================================
-- 1. Foreign-Key Reference Indexes (Enables fast joins and prevents lock contention)
-- ============================================================================

-- collection_batches
CREATE INDEX idx_collection_batches_source_id 
    ON public.collection_batches(source_id);

-- threads
CREATE INDEX idx_threads_source_id 
    ON public.threads(source_id);

CREATE INDEX idx_threads_collection_batch_id 
    ON public.threads(collection_batch_id);

-- thread_messages
CREATE INDEX idx_thread_messages_thread_id 
    ON public.thread_messages(thread_id);

CREATE INDEX idx_thread_messages_parent_message_id 
    ON public.thread_messages(parent_message_id)
    WHERE parent_message_id IS NOT NULL;

-- raw_evidence foreign keys
CREATE INDEX idx_raw_evidence_source_id 
    ON public.raw_evidence(source_id);

CREATE INDEX idx_raw_evidence_collection_batch_id 
    ON public.raw_evidence(collection_batch_id);

CREATE INDEX idx_raw_evidence_thread_id 
    ON public.raw_evidence(thread_id)
    WHERE thread_id IS NOT NULL;

CREATE INDEX idx_raw_evidence_message_id 
    ON public.raw_evidence(message_id)
    WHERE message_id IS NOT NULL;

-- evidence_analysis
CREATE INDEX idx_evidence_analysis_evidence_id 
    ON public.evidence_analysis(evidence_id);

-- cluster_members
CREATE INDEX idx_cluster_members_cluster_id 
    ON public.cluster_members(cluster_id);

CREATE INDEX idx_cluster_members_evidence_id 
    ON public.cluster_members(evidence_id);

-- human_annotations
CREATE INDEX idx_human_annotations_evidence_id 
    ON public.human_annotations(evidence_id);

CREATE INDEX idx_human_annotations_analysis_id 
    ON public.human_annotations(analysis_id)
    WHERE analysis_id IS NOT NULL;

CREATE INDEX idx_human_annotations_cluster_id 
    ON public.human_annotations(cluster_id)
    WHERE cluster_id IS NOT NULL;

-- analysis_jobs
CREATE INDEX idx_analysis_jobs_batch_id 
    ON public.analysis_jobs(batch_id)
    WHERE batch_id IS NOT NULL;

-- ============================================================================
-- 2. Deduplication & Content Lookup Indexes
-- ============================================================================

CREATE INDEX idx_raw_evidence_content_fingerprint 
    ON public.raw_evidence(content_fingerprint)
    WHERE content_fingerprint IS NOT NULL;

CREATE INDEX idx_raw_evidence_duplicate_group_id 
    ON public.raw_evidence(duplicate_group_id)
    WHERE duplicate_group_id IS NOT NULL;

-- ============================================================================
-- 3. Core Research Query & Filter Indexes (ResearchSchema.md §17)
-- ============================================================================

-- Primary evidence exploration and filtering index
CREATE INDEX idx_raw_evidence_corpus_filter 
    ON public.raw_evidence(corpus_type, verification_status, is_canonical, withdrawn);

-- Product and platform breakdown index
CREATE INDEX idx_raw_evidence_platform_product 
    ON public.raw_evidence(source_platform, product_name);

-- Temporal ordering index
CREATE INDEX idx_raw_evidence_published_at 
    ON public.raw_evidence(published_at DESC)
    WHERE published_at IS NOT NULL;

-- Analysis version and relevance indexing
CREATE INDEX idx_evidence_analysis_version_lookup 
    ON public.evidence_analysis(evidence_id, analysis_version);

CREATE INDEX idx_evidence_analysis_relevance_category 
    ON public.evidence_analysis(relevance_category, is_latest);

CREATE INDEX idx_evidence_analysis_retrieval_outcome 
    ON public.evidence_analysis(retrieval_outcome, is_latest)
    WHERE retrieval_outcome IS NOT NULL;

-- Background job queue worker index
CREATE INDEX idx_analysis_jobs_status_type 
    ON public.analysis_jobs(status, job_type);

-- Report run lookups
CREATE INDEX idx_report_runs_type_snapshot 
    ON public.report_runs(report_type, corpus_snapshot_date DESC);
