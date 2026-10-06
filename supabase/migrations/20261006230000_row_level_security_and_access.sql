-- Migration 009: Row Level Security, Grants, and Access Policies
-- Description: Enforces least-privilege access control, public write prevention, and service-role isolation.
-- Conforms to: Architecture.md §7, §13, §14; Decisions.md D023; ResearchSchema.md §18

-- ============================================================================
-- 1. Explicit Role Privilege Restrictions
-- Anonymous and public client roles must never perform mutations on research tables.
-- ============================================================================

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Ensure future tables created by migrations also default to least privilege
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- ============================================================================
-- 2. Enable Row Level Security (RLS) on all public research tables
-- ============================================================================

ALTER TABLE public.source_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cluster_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.human_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_runs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. Service Role Policies (Privileged Server-Side Pipelines via SUPABASE_SECRET_KEY)
-- ============================================================================

CREATE POLICY "service_role_source_registry_all" 
    ON public.source_registry FOR ALL TO service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_collection_batches_all" 
    ON public.collection_batches FOR ALL TO service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_threads_all" 
    ON public.threads FOR ALL TO service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_thread_messages_all" 
    ON public.thread_messages FOR ALL TO service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_raw_evidence_all" 
    ON public.raw_evidence FOR ALL TO service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_evidence_analysis_all" 
    ON public.evidence_analysis FOR ALL TO service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_research_clusters_all" 
    ON public.research_clusters FOR ALL TO service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_cluster_members_all" 
    ON public.cluster_members FOR ALL TO service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_human_annotations_all" 
    ON public.human_annotations FOR ALL TO service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_analysis_jobs_all" 
    ON public.analysis_jobs FOR ALL TO service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_report_runs_all" 
    ON public.report_runs FOR ALL TO service_role 
    USING (true) WITH CHECK (true);

-- ============================================================================
-- 4. Public / Authenticated Read-Only Policies (Scoped Client Access)
-- Enforces privacy filters: withdrawn records are excluded from client queries.
-- ============================================================================

-- Active research sources
CREATE POLICY "public_read_source_registry" 
    ON public.source_registry FOR SELECT TO anon, authenticated 
    USING (access_status != 'UNAVAILABLE');

-- Completed batch runs
CREATE POLICY "public_read_collection_batches" 
    ON public.collection_batches FOR SELECT TO anon, authenticated 
    USING (status = 'COMPLETE');

-- Conversation threads
CREATE POLICY "public_read_threads" 
    ON public.threads FOR SELECT TO anon, authenticated 
    USING (true);

-- Thread messages
CREATE POLICY "public_read_thread_messages" 
    ON public.thread_messages FOR SELECT TO anon, authenticated 
    USING (true);

-- Non-withdrawn raw evidence (ResearchSchema.md §18, Privacy & Withdrawal)
CREATE POLICY "public_read_raw_evidence" 
    ON public.raw_evidence FOR SELECT TO anon, authenticated 
    USING (withdrawn = FALSE);

-- Completed AI analyses
CREATE POLICY "public_read_evidence_analysis" 
    ON public.evidence_analysis FOR SELECT TO anon, authenticated 
    USING (processing_status = 'COMPLETE');

-- Active research clusters
CREATE POLICY "public_read_research_clusters" 
    ON public.research_clusters FOR SELECT TO anon, authenticated 
    USING (review_status != 'DEPRECATED');

-- Cluster memberships
CREATE POLICY "public_read_cluster_members" 
    ON public.cluster_members FOR SELECT TO anon, authenticated 
    USING (true);

-- Completed human annotations & gold standards
CREATE POLICY "public_read_human_annotations" 
    ON public.human_annotations FOR SELECT TO anon, authenticated 
    USING (true);

-- Completed background jobs
CREATE POLICY "public_read_analysis_jobs" 
    ON public.analysis_jobs FOR SELECT TO anon, authenticated 
    USING (status = 'COMPLETE');

-- Completed research reports
CREATE POLICY "public_read_report_runs" 
    ON public.report_runs FOR SELECT TO anon, authenticated 
    USING (status = 'COMPLETE');
