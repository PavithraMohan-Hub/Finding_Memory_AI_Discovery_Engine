-- Migration 006: Human Annotations and Review Audit Trail
-- Description: Establishes a complete, auditable record for human researcher reviews, corrections, and gold-standard labels.
-- Conforms to: ResearchSchema.md §1, §12, §15, §16; Architecture.md §11; Decisions.md D023; EdgeCases.md §1.1, §1.2, §1.3

-- ============================================================================
-- 1. Table: human_annotations
-- Full audit trail for researcher actions. Never mutates raw source evidence.
-- ============================================================================
CREATE TABLE public.human_annotations (
    annotation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID NOT NULL REFERENCES public.raw_evidence(evidence_id) ON DELETE RESTRICT,
    analysis_id UUID REFERENCES public.evidence_analysis(analysis_id) ON DELETE RESTRICT,
    cluster_id UUID REFERENCES public.research_clusters(cluster_id) ON DELETE RESTRICT,
    annotation_type TEXT NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    reason TEXT,
    reviewer TEXT NOT NULL,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    is_gold_standard BOOLEAN DEFAULT FALSE,
    gold_standard_label TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),

    -- Taxonomy check constraints (D023: TEXT + CHECK over native PostgreSQL ENUM)
    CONSTRAINT chk_human_annotations_annotation_type CHECK (
        annotation_type IN (
            'ELIGIBILITY_REVIEW',
            'EXTRACTION_CORRECTION',
            'OUTCOME_CORRECTION',
            'CLUSTER_REVIEW',
            'GOLD_STANDARD',
            'EXCLUSION',
            'CONTRADICTION_FLAG',
            'PIN',
            'NOTE'
        )
    )
);

COMMENT ON TABLE public.human_annotations IS 
'Audit trail for researcher evaluations, corrections, and gold-standard annotations. Never alters immutable raw evidence.';

-- Trigger: auto-update updated_at on modification
CREATE TRIGGER trg_human_annotations_updated_at
    BEFORE UPDATE ON public.human_annotations
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
