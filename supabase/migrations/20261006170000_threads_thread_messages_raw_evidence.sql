-- Migration 003: Threads, Thread Messages, and Raw Evidence
-- Description: Establishes conversational grouping (threads, thread_messages) and immutable source captures (raw_evidence).
-- Conforms to: ResearchSchema.md §1, §5, §6, §7, §15, §16; Architecture.md §7, §8; Decisions.md D023; EdgeCases.md §1.2, §1.5, §2.1

-- ============================================================================
-- 0. Prerequisite Schema Alignment: collection_batches composite uniqueness
-- Enables composite foreign keys ensuring strong source/batch provenance.
-- ============================================================================
ALTER TABLE public.collection_batches
    ADD CONSTRAINT uq_collection_batches_source_batch UNIQUE (source_id, batch_id);

-- ============================================================================
-- 1. Table: threads
-- Canonical conversation and thread container for multi-message discussions.
-- ============================================================================
CREATE TABLE public.threads (
    thread_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.source_registry(source_id) ON DELETE RESTRICT,
    collection_batch_id UUID REFERENCES public.collection_batches(batch_id) ON DELETE RESTRICT,
    source_platform TEXT NOT NULL,
    corpus_type TEXT NOT NULL,
    external_thread_id TEXT,
    source_thread_id TEXT,
    thread_url TEXT NOT NULL,
    parent_thread_url TEXT,
    title TEXT,
    product_name TEXT,
    message_count INTEGER DEFAULT 0,
    is_complete BOOLEAN DEFAULT TRUE,
    missing_coverage_note TEXT,
    earliest_message_at TIMESTAMPTZ,
    latest_message_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),

    -- Taxonomy check constraints (D023: TEXT + CHECK over native PostgreSQL ENUM)
    CONSTRAINT chk_threads_corpus_type CHECK (
        corpus_type IN ('USER_EVIDENCE', 'PRODUCT_REFERENCE', 'COGNITIVE_REFERENCE')
    ),

    -- Data quality constraints
    CONSTRAINT chk_threads_message_count CHECK (
        message_count IS NULL OR message_count >= 0
    ),
    CONSTRAINT chk_threads_timeline CHECK (
        latest_message_at IS NULL OR earliest_message_at IS NULL OR latest_message_at >= earliest_message_at
    ),

    -- Source / Batch consistency: if collection_batch_id is populated, it must belong to source_id
    CONSTRAINT fk_threads_source_batch FOREIGN KEY (source_id, collection_batch_id)
        REFERENCES public.collection_batches(source_id, batch_id) ON DELETE RESTRICT
);

COMMENT ON TABLE public.threads IS 
'Canonical conversation containers grouping related messages from community discussions, forums, and comment sections.';

-- Trigger: auto-update updated_at on modification
CREATE TRIGGER trg_threads_updated_at
    BEFORE UPDATE ON public.threads
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 2. Table: thread_messages
-- Individual messages/replies within a thread, preserving speaker roles and sequence.
-- Enforces same-thread parent constraint via composite foreign key.
-- ============================================================================
CREATE TABLE public.thread_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.threads(thread_id) ON DELETE RESTRICT,
    parent_message_id UUID,
    external_message_id TEXT,
    sequence_number INTEGER,
    sequence_in_thread INTEGER,
    depth INTEGER DEFAULT 0,
    speaker_type TEXT,
    speaker_label TEXT,
    author_role TEXT,
    is_original_poster BOOLEAN DEFAULT FALSE,
    message_role TEXT,
    original_text TEXT,
    message_text TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),

    -- Composite uniqueness to support composite foreign key enforcement
    CONSTRAINT uq_thread_messages_thread_message UNIQUE (thread_id, message_id),

    -- Same-thread parent message enforcement: parent_message_id MUST belong to the exact same thread_id
    CONSTRAINT fk_thread_messages_same_thread_parent FOREIGN KEY (thread_id, parent_message_id)
        REFERENCES public.thread_messages(thread_id, message_id) ON DELETE RESTRICT,

    -- Taxonomy check constraints
    CONSTRAINT chk_thread_messages_message_role CHECK (
        message_role IS NULL OR message_role IN (
            'ORIGINAL_POST',
            'OP_FOLLOWUP',
            'OTHER_USER_COMMENT',
            'SUGGESTED_WORKAROUND',
            'OUTCOME_UPDATE',
            'REVIEW'
        )
    ),
    CONSTRAINT chk_thread_messages_speaker_type CHECK (
        speaker_type IS NULL OR speaker_type IN (
            'OP',
            'RESPONDER',
            'MODERATOR',
            'DEVELOPER',
            'UNKNOWN'
        )
    ),

    -- Data quality constraints
    CONSTRAINT chk_thread_messages_sequence CHECK (
        (sequence_number IS NULL OR sequence_number >= 0) AND
        (sequence_in_thread IS NULL OR sequence_in_thread >= 0)
    ),
    CONSTRAINT chk_thread_messages_depth CHECK (
        depth IS NULL OR depth >= 0
    )
);

COMMENT ON TABLE public.thread_messages IS 
'Individual ordered messages within threads. Same-thread reply integrity is enforced at the database level.';

-- Trigger: auto-update updated_at on modification
CREATE TRIGGER trg_thread_messages_updated_at
    BEFORE UPDATE ON public.thread_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 3. Table: raw_evidence
-- Immutable source evidence captures. Baseline truth of collected public research data.
-- Enforces source/batch consistency and thread/message consistency.
-- ============================================================================
CREATE TABLE public.raw_evidence (
    evidence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    corpus_type TEXT NOT NULL,
    source_id UUID NOT NULL REFERENCES public.source_registry(source_id) ON DELETE RESTRICT,
    collection_batch_id UUID NOT NULL REFERENCES public.collection_batches(batch_id) ON DELETE RESTRICT,
    thread_id UUID REFERENCES public.threads(thread_id) ON DELETE RESTRICT,
    message_id UUID,
    parent_message_id UUID,
    source_platform TEXT NOT NULL,
    source_type TEXT NOT NULL,
    product_name TEXT,
    product_id TEXT,
    source_record_id TEXT,
    source_url TEXT NOT NULL,
    canonical_url TEXT,
    original_url TEXT,
    parent_thread_url TEXT,
    sequence_in_thread INTEGER,
    title TEXT,
    original_text TEXT NOT NULL,
    language TEXT,
    country_market TEXT,
    rating NUMERIC,
    helpful_score INTEGER,
    published_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    collection_method TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
    source_access_notes TEXT,
    content_fingerprint TEXT,
    duplicate_group_id UUID,
    duplicate_status TEXT,
    duplicate_reason TEXT,
    is_canonical BOOLEAN DEFAULT TRUE,
    withdrawn BOOLEAN DEFAULT FALSE,
    withdrawn_at TIMESTAMPTZ,
    withdrawal_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),

    -- Taxonomy check constraints
    CONSTRAINT chk_raw_evidence_corpus_type CHECK (
        corpus_type IN ('USER_EVIDENCE', 'PRODUCT_REFERENCE', 'COGNITIVE_REFERENCE')
    ),
    CONSTRAINT chk_raw_evidence_verification_status CHECK (
        verification_status IN ('UNVERIFIED', 'SOURCE_VERIFIED', 'HUMAN_REVIEWED')
    ),

    -- Data quality constraints
    CONSTRAINT chk_raw_evidence_helpful_score CHECK (
        helpful_score IS NULL OR helpful_score >= 0
    ),
    CONSTRAINT chk_raw_evidence_sequence_in_thread CHECK (
        sequence_in_thread IS NULL OR sequence_in_thread >= 0
    ),

    -- Source / Batch consistency: raw_evidence.source_id MUST match collection_batches.source_id
    CONSTRAINT fk_raw_evidence_source_batch FOREIGN KEY (source_id, collection_batch_id)
        REFERENCES public.collection_batches(source_id, batch_id) ON DELETE RESTRICT,

    -- Thread / Message pairing and consistency: if message_id is populated, thread_id must be populated and match
    CONSTRAINT chk_raw_evidence_thread_message_pairing CHECK (
        message_id IS NULL OR thread_id IS NOT NULL
    ),
    CONSTRAINT fk_raw_evidence_thread_message FOREIGN KEY (thread_id, message_id)
        REFERENCES public.thread_messages(thread_id, message_id) ON DELETE RESTRICT,

    -- Parent message pairing and consistency: if parent_message_id is populated, thread_id must be populated and match
    CONSTRAINT chk_raw_evidence_thread_parent_message_pairing CHECK (
        parent_message_id IS NULL OR thread_id IS NOT NULL
    ),
    CONSTRAINT fk_raw_evidence_thread_parent_message FOREIGN KEY (thread_id, parent_message_id)
        REFERENCES public.thread_messages(thread_id, message_id) ON DELETE RESTRICT
);

COMMENT ON TABLE public.raw_evidence IS 
'Immutable raw source captures and provenance tracking. Strict provenance consistency enforced against batches and threads.';

-- Trigger: enforce strict immutability of original_text (Schema Invariant 1)
CREATE TRIGGER trg_raw_evidence_original_text_immutable
    BEFORE UPDATE ON public.raw_evidence
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_raw_evidence_original_text_update();

-- Trigger: auto-update updated_at on modification
CREATE TRIGGER trg_raw_evidence_updated_at
    BEFORE UPDATE ON public.raw_evidence
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
