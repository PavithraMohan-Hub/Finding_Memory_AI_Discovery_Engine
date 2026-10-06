-- Migration 002: Source Registry and Collection Batches
-- Description: Establishes candidate source tracking and ingestion batch run provenance.
-- Conforms to: ResearchSchema.md §3, §4; Architecture.md §7, §8; Decisions.md D023

-- ============================================================================
-- 1. Table: source_registry
-- Tracks candidate and active research evidence sources with access terms.
-- ============================================================================
CREATE TABLE public.source_registry (
    source_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_platform TEXT NOT NULL,
    corpus_type TEXT NOT NULL,
    display_name TEXT NOT NULL,
    product_name TEXT,
    priority INTEGER,
    access_status TEXT NOT NULL,
    permitted_route TEXT NOT NULL,
    terms_reference_url TEXT,
    approval_status TEXT,
    approval_date TIMESTAMPTZ,
    ai_processing_permitted BOOLEAN DEFAULT FALSE,
    display_conditions TEXT,
    rate_limits TEXT,
    retention_conditions TEXT,
    last_checked_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),

    -- Taxonomy check constraints (D023: TEXT + CHECK over native PostgreSQL ENUM)
    CONSTRAINT chk_source_registry_corpus_type CHECK (
        corpus_type IN ('USER_EVIDENCE', 'PRODUCT_REFERENCE', 'COGNITIVE_REFERENCE')
    ),
    CONSTRAINT chk_source_registry_access_status CHECK (
        access_status IN ('ENABLED', 'CONDITIONAL', 'UNAVAILABLE', 'MANUAL_ONLY', 'NOT_VERIFIED')
    )
);

COMMENT ON TABLE public.source_registry IS 
'Registry of candidate and active research data sources, tracking terms, access permissions, and boundaries.';

-- Trigger: auto-update updated_at on modification
CREATE TRIGGER trg_source_registry_updated_at
    BEFORE UPDATE ON public.source_registry
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 2. Table: collection_batches
-- Tracks individual ingestion batch runs and checkpoint states.
-- Provenance deletion behavior: ON DELETE RESTRICT on source_id to prevent
-- accidental deletion of active or historical research provenance.
-- ============================================================================
CREATE TABLE public.collection_batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.source_registry(source_id) ON DELETE RESTRICT,
    corpus_type TEXT NOT NULL,
    product_name TEXT,
    collection_method TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL,
    records_fetched INTEGER NOT NULL DEFAULT 0,
    records_stored INTEGER NOT NULL DEFAULT 0,
    records_duplicate INTEGER NOT NULL DEFAULT 0,
    records_failed INTEGER NOT NULL DEFAULT 0,
    error_summary TEXT,
    config_snapshot JSONB,
    checkpoint_state JSONB,
    country_market TEXT,
    language TEXT,
    date_window_start DATE,
    date_window_end DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),

    -- Taxonomy check constraints
    CONSTRAINT chk_collection_batches_corpus_type CHECK (
        corpus_type IN ('USER_EVIDENCE', 'PRODUCT_REFERENCE', 'COGNITIVE_REFERENCE')
    ),
    CONSTRAINT chk_collection_batches_status CHECK (
        status IN ('PENDING', 'RUNNING', 'PARTIAL', 'FAILED', 'COMPLETE')
    ),

    -- Non-negative count integrity checks
    CONSTRAINT chk_records_fetched_non_negative CHECK (records_fetched >= 0),
    CONSTRAINT chk_records_stored_non_negative CHECK (records_stored >= 0),
    CONSTRAINT chk_records_duplicate_non_negative CHECK (records_duplicate >= 0),
    CONSTRAINT chk_records_failed_non_negative CHECK (records_failed >= 0),

    -- Timestamp and date window integrity checks
    CONSTRAINT chk_collection_batches_completed_at CHECK (
        completed_at IS NULL OR completed_at >= started_at
    ),
    CONSTRAINT chk_collection_batches_date_window CHECK (
        date_window_end IS NULL OR date_window_start IS NULL OR date_window_end >= date_window_start
    )
);

COMMENT ON TABLE public.collection_batches IS 
'Ingestion runs with execution parameters, counts, and pagination checkpoint states for research auditability.';

-- Trigger: auto-update updated_at on modification
CREATE TRIGGER trg_collection_batches_updated_at
    BEFORE UPDATE ON public.collection_batches
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
