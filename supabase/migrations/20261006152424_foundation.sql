-- Migration 001: Foundation
-- Description: Foundational utility functions, immutability enforcement, and schema configuration.
-- Conforms to: ResearchSchema.md §1, §15, §16; Architecture.md §7; Decisions.md D023, D024

-- 1. Shared trigger function to update updated_at timestamp
-- Explicitly locks search_path to prevent mutable search-path vulnerabilities (Supabase linter 0011).
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = pg_catalog.now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS 
'Automatically updates the updated_at timestamp column to the current transaction time on row update.';

-- 2. Immutability trigger function for raw_evidence.original_text (Schema Invariant 1)
-- Invariant: "raw_evidence.original_text is never modified after insert"
-- Note: This migration defines only the trigger function.
-- The actual trigger attachment (BEFORE UPDATE ON public.raw_evidence) will be executed in Migration 003
-- when the raw_evidence table is defined.
CREATE OR REPLACE FUNCTION public.prevent_raw_evidence_original_text_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF OLD.original_text IS DISTINCT FROM NEW.original_text THEN
        RAISE EXCEPTION 'raw_evidence.original_text is strictly immutable and cannot be modified once inserted (Schema Invariant 1)';
    END IF;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.prevent_raw_evidence_original_text_update() IS 
'Enforces Schema Invariant 1: raw_evidence.original_text cannot be updated after initial insert. Attached in Migration 003.';
