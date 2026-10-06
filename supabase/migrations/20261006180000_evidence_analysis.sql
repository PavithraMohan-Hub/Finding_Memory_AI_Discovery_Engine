-- Migration 004: Evidence Analysis
-- Description: Establishes the versioned AI interpretation layer for raw evidence.
-- Conforms to: ResearchSchema.md §1, §8, §15, §16; Architecture.md §7, §9; Decisions.md D008, D023, D025

-- ============================================================================
-- 1. Table: evidence_analysis
-- Versioned AI analysis linked to raw_evidence. Never overwrites raw evidence.
-- Multiple analysis runs coexist historically without blocking reruns or mutual overwrite.
-- ============================================================================
CREATE TABLE public.evidence_analysis (
    -- Identity & Provenance
    analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID NOT NULL REFERENCES public.raw_evidence(evidence_id) ON DELETE RESTRICT,

    -- Versioning & Audit Metadata (Supports coexistence of historical analysis runs)
    analysis_version TEXT NOT NULL,
    model_name TEXT NOT NULL,
    model_version TEXT,
    analysis_prompt_version TEXT NOT NULL,
    schema_version TEXT,
    analysed_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    is_latest BOOLEAN NOT NULL DEFAULT TRUE,
    processing_status TEXT NOT NULL DEFAULT 'PENDING',
    human_review_status TEXT DEFAULT 'UNREVIEWED',
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),

    -- Scope: Decoupled Relevance Tier & Retrieval Case Classification
    retrieval_relevance TEXT,
    relevance_category TEXT,
    relevance_score NUMERIC,
    relevance_rationale TEXT,
    relevance_source_spans JSONB,
    target_media_type TEXT[],
    what_user_wanted_to_find TEXT,
    user_believes_item_exists BOOLEAN,

    -- Canonical Memory Cues (Single Source of Truth JSONB structure)
    cues JSONB,

    -- Cue Evolution
    initially_accessible_cues UUID[],
    newly_recalled_cues UUID[],
    cue_evolution_sequence JSONB,
    new_cue_trigger TEXT,
    did_recognition_trigger_recall TEXT,
    recognition_trigger_evidence_label TEXT,
    external_cue_trigger TEXT,

    -- Search Behaviour & Actions
    initial_query TEXT,
    initial_query_label TEXT,
    search_strategy TEXT,
    subsequent_actions JSONB,
    workaround TEXT,
    workaround_label TEXT,

    -- Retrieval Journey & Outcomes
    journey_steps JSONB,
    journey_completeness TEXT,
    retrieval_outcome TEXT,
    outcome_label TEXT,
    outcome_notes TEXT,

    -- Problem Coding & Root Causes
    failure_point TEXT,
    problem_code TEXT,
    problem_codes TEXT[],
    problem_code_version TEXT,
    root_cause_hypothesis TEXT,
    root_cause_evidence_label TEXT,

    -- Reported Impact
    effort_signal TEXT,
    effort_numeric NUMERIC,
    severity_signal TEXT,
    effort_label TEXT,

    -- Support, Uncertainty & Epistemic Labeling
    evidence_type TEXT,
    confidence TEXT,
    confidence_basis TEXT,
    alternative_interpretations TEXT,
    extraction_rationale TEXT,

    -- Taxonomy check constraints (D023: TEXT + CHECK over native PostgreSQL ENUM)
    CONSTRAINT chk_evidence_analysis_processing_status CHECK (
        processing_status IN ('PENDING', 'RUNNING', 'COMPLETE', 'FAILED', 'REJECTED_BY_HUMAN')
    ),
    CONSTRAINT chk_evidence_analysis_human_review_status CHECK (
        human_review_status IS NULL OR human_review_status IN ('UNREVIEWED', 'APPROVED', 'REJECTED', 'CORRECTED')
    ),

    -- Distinct Relevance Tier (Priority: High / Medium / Low / Irrelevant)
    CONSTRAINT chk_evidence_analysis_retrieval_relevance CHECK (
        retrieval_relevance IS NULL OR retrieval_relevance IN ('HIGH', 'MEDIUM', 'LOW', 'IRRELEVANT')
    ),

    -- Distinct Case Classification (Scope & Control group categorization)
    CONSTRAINT chk_evidence_analysis_relevance_category CHECK (
        relevance_category IS NULL OR relevance_category IN (
            'MAIN_INCOMPLETE_MEMORY',
            'PRECISE_MEMORY_SYSTEM_FAILURE',
            'CONTEXT_ONLY',
            'EXCLUDED',
            'NEEDS_REVIEW'
        )
    ),

    -- Epistemic Evidence Type Labels
    CONSTRAINT chk_evidence_analysis_evidence_type CHECK (
        evidence_type IS NULL OR evidence_type IN (
            'DIRECT_STATEMENT',
            'STRONGLY_IMPLIED_BEHAVIOUR',
            'AI_INTERPRETATION',
            'RESEARCH_HYPOTHESIS'
        )
    ),
    CONSTRAINT chk_evidence_analysis_retrieval_outcome CHECK (
        retrieval_outcome IS NULL OR retrieval_outcome IN (
            'FOUND',
            'PARTIAL',
            'FAILED',
            'ABANDONED',
            'NOT_REPORTED',
            'UNCLEAR'
        )
    ),
    CONSTRAINT chk_evidence_analysis_confidence CHECK (
        confidence IS NULL OR confidence IN ('HIGH', 'MEDIUM', 'LOW')
    ),
    CONSTRAINT chk_evidence_analysis_journey_completeness CHECK (
        journey_completeness IS NULL OR journey_completeness IN ('COMPLETE', 'PARTIAL', 'SINGLE_STEP', 'UNKNOWN')
    ),
    CONSTRAINT chk_evidence_analysis_did_recognition_trigger_recall CHECK (
        did_recognition_trigger_recall IS NULL OR did_recognition_trigger_recall IN ('YES', 'NO', 'UNKNOWN')
    ),

    -- Label checks enforcing provenance epistemology (ResearchSchema.md §8, §15)
    CONSTRAINT chk_evidence_analysis_initial_query_label CHECK (
        initial_query_label IS NULL OR initial_query_label IN ('DIRECT_STATEMENT', 'NOT_REPORTED', 'AI_INTERPRETATION')
    ),
    CONSTRAINT chk_evidence_analysis_workaround_label CHECK (
        workaround_label IS NULL OR workaround_label IN ('DIRECT_STATEMENT', 'STRONGLY_IMPLIED_BEHAVIOUR')
    ),
    CONSTRAINT chk_evidence_analysis_outcome_label CHECK (
        outcome_label IS NULL OR outcome_label IN ('DIRECT_STATEMENT', 'STRONGLY_IMPLIED_BEHAVIOUR', 'AI_INTERPRETATION')
    ),
    CONSTRAINT chk_evidence_analysis_effort_label CHECK (
        effort_label IS NULL OR effort_label IN ('DIRECT_STATEMENT', 'AI_INTERPRETATION')
    ),
    CONSTRAINT chk_evidence_analysis_root_cause_evidence_label CHECK (
        root_cause_evidence_label IS NULL OR root_cause_evidence_label IN ('AI_INTERPRETATION', 'RESEARCH_HYPOTHESIS')
    ),
    CONSTRAINT chk_evidence_analysis_recognition_trigger_evidence_label CHECK (
        recognition_trigger_evidence_label IS NULL OR recognition_trigger_evidence_label IN ('DIRECT_STATEMENT', 'STRONGLY_IMPLIED_BEHAVIOUR', 'AI_INTERPRETATION')
    )
);

COMMENT ON TABLE public.evidence_analysis IS 
'Versioned AI interpretations, memory cues, journeys, and problem codes linked to raw_evidence. Multiple historical analysis runs coexist without overwriting raw source data.';

-- Trigger: auto-update updated_at on modification
CREATE TRIGGER trg_evidence_analysis_updated_at
    BEFORE UPDATE ON public.evidence_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
