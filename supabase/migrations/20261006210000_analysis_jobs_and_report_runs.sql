-- Migration 007: Analysis Jobs and Report Runs
-- Description: Establishes asynchronous job tracking and auditable research report snapshot execution.
-- Conforms to: ResearchSchema.md §1, §13, §14, §15; Architecture.md §6, §12; Decisions.md D005, D023; EdgeCases.md §2.4, §6.5

-- ============================================================================
-- 1. Table: analysis_jobs
-- Background job tracking for ingestion, classification, extraction, and validation runs.
-- ============================================================================
CREATE TABLE public.analysis_jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.collection_batches(batch_id) ON DELETE RESTRICT,
    job_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    error_summary TEXT,
    retry_count INTEGER DEFAULT 0,
    checkpoint_state JSONB,
    config_snapshot JSONB,
    model_name TEXT,
    prompt_version TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),

    -- Taxonomy check constraints (D023: TEXT + CHECK over native PostgreSQL ENUM)
    CONSTRAINT chk_analysis_jobs_job_type CHECK (
        job_type IN (
            'INGESTION',
            'RELEVANCE_CLASSIFICATION',
            'CUE_EXTRACTION',
            'BEHAVIOUR_EXTRACTION',
            'JOURNEY_RECONSTRUCTION',
            'PROBLEM_CODING',
            'EMBEDDING',
            'CLUSTERING',
            'VALIDATION',
            'REPORT_GENERATION'
        )
    ),
    CONSTRAINT chk_analysis_jobs_status CHECK (
        status IN ('PENDING', 'RUNNING', 'PARTIAL', 'FAILED', 'COMPLETE')
    ),

    -- Count integrity constraints
    CONSTRAINT chk_analysis_jobs_total_records CHECK (
        total_records IS NULL OR total_records >= 0
    ),
    CONSTRAINT chk_analysis_jobs_processed_records CHECK (
        processed_records IS NULL OR processed_records >= 0
    ),
    CONSTRAINT chk_analysis_jobs_failed_records CHECK (
        failed_records IS NULL OR failed_records >= 0
    ),
    CONSTRAINT chk_analysis_jobs_retry_count CHECK (
        retry_count IS NULL OR retry_count >= 0
    ),

    -- Timeline sanity check
    CONSTRAINT chk_analysis_jobs_timeline CHECK (
        completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at
    )
);

COMMENT ON TABLE public.analysis_jobs IS 
'Background job tracking for pipeline execution, resumable checkpoints, and batch analysis audits.';

-- Trigger: auto-update updated_at on modification
CREATE TRIGGER trg_analysis_jobs_updated_at
    BEFORE UPDATE ON public.analysis_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 2. Table: report_runs
-- Research report generation records linking syntheses to exact corpus snapshots.
-- ============================================================================
CREATE TABLE public.report_runs (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type TEXT NOT NULL,
    research_question TEXT,
    corpus_snapshot_date TIMESTAMPTZ NOT NULL,
    analysis_version TEXT NOT NULL,
    total_eligible_records INTEGER NOT NULL DEFAULT 0,
    filters_applied JSONB,
    status TEXT NOT NULL DEFAULT 'GENERATING',
    generated_at TIMESTAMPTZ,
    generated_by TEXT,
    output_location TEXT,
    export_target TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),

    -- Taxonomy check constraints
    CONSTRAINT chk_report_runs_report_type CHECK (
        report_type IN ('OVERVIEW', 'OPPORTUNITY_ANALYSIS', 'RESEARCH_SYNTHESIS', 'CUSTOM')
    ),
    CONSTRAINT chk_report_runs_status CHECK (
        status IN ('GENERATING', 'COMPLETE', 'FAILED')
    ),

    -- Count integrity check
    CONSTRAINT chk_report_runs_total_eligible_records CHECK (
        total_eligible_records >= 0
    )
);

COMMENT ON TABLE public.report_runs IS 
'Auditable research report executions capturing exact corpus snapshots, parameters, and outputs.';

-- Trigger: auto-update updated_at on modification
CREATE TRIGGER trg_report_runs_updated_at
    BEFORE UPDATE ON public.report_runs
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
