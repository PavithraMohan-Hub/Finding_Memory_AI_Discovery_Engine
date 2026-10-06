-- Migration 005: Research Clusters and Members
-- Description: Establishes semantic and structured groupings of evidence with inspectable membership.
-- Conforms to: ResearchSchema.md §1, §10, §11, §15, §16; Architecture.md §7; Decisions.md D023; EdgeCases.md §3.8, §6.2

-- ============================================================================
-- 1. Table: research_clusters
-- Semantic and structured groupings of evidence. Versioned and auditable.
-- ============================================================================
CREATE TABLE public.research_clusters (
    cluster_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_label TEXT NOT NULL,
    cluster_definition TEXT,
    exclusion_boundary TEXT,
    cluster_type TEXT,
    cluster_version TEXT NOT NULL,
    codebook_version TEXT,
    member_count INTEGER DEFAULT 0,
    source_breadth INTEGER DEFAULT 0,
    product_breadth INTEGER DEFAULT 0,
    review_status TEXT DEFAULT 'PROVISIONAL',
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),

    -- Taxonomy check constraints (D023: TEXT + CHECK over native PostgreSQL ENUM)
    CONSTRAINT chk_research_clusters_cluster_type CHECK (
        cluster_type IS NULL OR cluster_type IN ('SEMANTIC', 'STRUCTURED', 'HYBRID')
    ),
    CONSTRAINT chk_research_clusters_review_status CHECK (
        review_status IS NULL OR review_status IN ('PROVISIONAL', 'REVIEWED', 'APPROVED', 'DEPRECATED')
    ),

    -- Count integrity constraints
    CONSTRAINT chk_research_clusters_member_count CHECK (
        member_count IS NULL OR member_count >= 0
    ),
    CONSTRAINT chk_research_clusters_source_breadth CHECK (
        source_breadth IS NULL OR source_breadth >= 0
    ),
    CONSTRAINT chk_research_clusters_product_breadth CHECK (
        product_breadth IS NULL OR product_breadth >= 0
    )
);

COMMENT ON TABLE public.research_clusters IS 
'Semantic and structured groupings of research evidence. Versioned and traceable to member evidence records.';

-- Trigger: auto-update updated_at on modification
CREATE TRIGGER trg_research_clusters_updated_at
    BEFORE UPDATE ON public.research_clusters
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 2. Table: cluster_members
-- Many-to-many relationship linking research_clusters to raw_evidence.
-- Preserves inspectability of cluster evidence membership.
-- ============================================================================
CREATE TABLE public.cluster_members (
    cluster_id UUID NOT NULL REFERENCES public.research_clusters(cluster_id) ON DELETE RESTRICT,
    evidence_id UUID NOT NULL REFERENCES public.raw_evidence(evidence_id) ON DELETE RESTRICT,
    membership_type TEXT DEFAULT 'CORE',
    membership_basis TEXT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    assigned_by TEXT,

    PRIMARY KEY (cluster_id, evidence_id),

    -- Taxonomy check constraints
    CONSTRAINT chk_cluster_members_membership_type CHECK (
        membership_type IS NULL OR membership_type IN ('CORE', 'PERIPHERAL', 'OUTLIER')
    )
);

COMMENT ON TABLE public.cluster_members IS 
'Inspectable many-to-many membership linking research clusters to raw evidence captures.';
