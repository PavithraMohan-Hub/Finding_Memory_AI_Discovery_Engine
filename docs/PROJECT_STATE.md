# PROJECT_STATE — Finding Memory

**Last updated:** 2026-10-06
**Current phase:** Phase 2 — First Real Evidence Ingestion (VERIFIED)
**Status:** PHASE 2 — VERIFIED

---

## 1. Overview

| Field | Value |
|---|---|
| Project | Finding Memory — AI Discovery Engine for Incomplete-Memory Visual Retrieval |
| Primary product investigated | Google Photos (with comparison products) |
| Research goal | Understand how people attempt to retrieve photos when their memory of them is incomplete |
| Target corpus | ~2,000 qualifying USER_EVIDENCE records (incremental: 10 → 100 → 500 → 2,000+) |
| Architecture | Next.js/TypeScript (Vercel) + Supabase PostgreSQL + pgvector + Gemini API + GitHub Actions |
| Current implementation state | Phase 2 First Real Evidence Vertical Slice Complete & Verified |

### Phase 2 Verification Record
- **Verification status:** PHASE 2 — VERIFIED
- **Sample size:** 10 UNIQUE, REAL, VERIFIED `USER_EVIDENCE` records (0 synthetic records)
- **Sources used:** `source_registry` record for Reddit Public Discussions (r/googlephotos & r/GooglePixel)
- **Collection batch:** `collection_batches` ID `e6fe8a4b-b13e-45db-bea7-f067f296e094` (Status: `COMPLETE`, Stored: 10, Dups: 0, Failed: 0)
- **Ingestion architecture:** `src/lib/ingestion/` (types, validation, normalize, fingerprint, deduplicate, connectors/manual-import, ingest)
- **Connectors supported:** Manual structured import via JSON (`data/phase2_vertical_slice_evidence.json`) and CSV (`data/phase2_vertical_slice_evidence.csv`)
- **Deduplication:** Content fingerprint (SHA-256) + in-batch & database duplicate detection (`is_canonical` tracking without dropping records)
- **Server secret isolation:** `SUPABASE_SECRET_KEY` strictly isolated to server runtime via `src/lib/db/supabase-server.ts`
- **Internal Evidence Explorer:** Live at `/evidence` (`src/app/evidence/page.tsx`), server-rendered with XSS protection and verifiable source links
- **Automated test suite (`tests/phase2_vertical_slice.test.ts`):** 13/13 PASS (7 positive, 6 negative / boundary tests)
- **Lint / Typecheck / Build:** 100% PASS with zero warnings or errors

### Phase 1 Verification Record
- **Verification status:** PHASE 1 — VERIFIED
- **Migrations applied (001–009):**
  - `20261006152424_foundation.sql` (001)
  - `20261006160000_source_registry_and_collection_batches.sql` (002)
  - `20261006170000_threads_thread_messages_raw_evidence.sql` (003)
  - `20261006180000_evidence_analysis.sql` (004)
  - `20261006190000_research_clusters_and_members.sql` (005)
  - `20261006200000_human_annotations.sql` (006)
  - `20261006210000_analysis_jobs_and_report_runs.sql` (007)
  - `20261006220000_indexes.sql` (008)
  - `20261006230000_row_level_security_and_access.sql` (009)
- **Hosted database deployment:** 100% applied cleanly via `supabase db push`
- **Migration history result:** Perfectly synchronized (local and remote align on all 9 migrations; dry run confirms up to date)
- **DB lint result:** Passed cleanly (`supabase db lint --linked --schema public --fail-on error` reported 0 schema errors)
- **Schema objects verified:** 11 public tables, 2 functions, 11 triggers, all primary keys, composite foreign keys, and indexes active
- **RLS status:** Enabled on all 11 public tables; `REVOKE` write privileges from `anon` & `authenticated`; scoped `SELECT` policies active
- **Vector isolation:** pgvector extension NOT enabled; `evidence_embeddings` table does NOT exist (deferred to Phase 7 per D024)
- **Positive evaluation tests (P1-POS-01 to P1-POS-10):** 10/10 PASS
- **Negative evaluation tests (P1-NEG-01 to P1-NEG-08):** 8/8 FAIL AS EXPECTED
- **Access control & RLS tests (P1-NEG-09 to P1-NEG-10):** 2/2 PASS (anonymous writes denied with `insufficient_privilege`; withdrawn evidence & incomplete analyses properly hidden from public scope)
- **Database state:** 0 residual rows across all tables (pristine development DB)
- **Last verified commit:** de7ac6f

### Phase 0 Verification Record
- **Verification status:** PHASE 0 — VERIFIED
- **Node version:** v24.21.0
- **npm version:** 11.19.0
- **Next.js version:** 15.5.27
- **TypeScript version:** 5.8.2
- **ESLint version:** 9.21.0
- **Dev server:** Verified (Started in 2.9s, served HTTP 200 OK at http://localhost:3000)
- **Lint result:** Verified (`npm.cmd run lint` passed with 0 errors/warnings)
- **Typecheck result:** Verified (`npm.cmd run typecheck` passed cleanly)
- **Production build:** Verified (`npm.cmd run build` compiled successfully in 11.3s)
- **CI state:** Configured & matching (`.github/workflows/ci.yml` runs typecheck, lint, and build)
- **Secrets check:** Verified (0 keys/tokens committed, .env ignored, .env.example contains placeholders only)
- **Last safe commit:** f2d6edc (feat(phase-0): complete and verify executable Next.js TypeScript foundation)

---

## 2. Documentation Status

| Document | Status | Location |
|---|---|---|
| docs/ProblemStatement_Finding_Memory.txt | EXISTS (source of truth) | docs/ |
| AntigravityMasterPrompt.txt | EXISTS (operating rules) | docs/ |
| Architecture.md | APPROVED | docs/ |
| DataSources.md | APPROVED | docs/ |
| ResearchSchema.md | APPROVED | docs/ |
| ImplementationPlan.md | APPROVED | docs/ |
| Conventions.md | APPROVED | docs/ |
| EdgeCases.md | APPROVED | docs/ |
| Evals.md | APPROVED | docs/ |
| Decisions.md | APPROVED | docs/ |
| PROJECT_STATE.md | THIS FILE | docs/ |
| USER_ACTIONS.md | CREATED | docs/ |
| EXTERNAL_SERVICES.md | CREATED | docs/ |
| KNOWN_ISSUES.md | CREATED | docs/ |
| FUTURE_IDEAS.md | CREATED | docs/ |
| .env.example | CREATED | project root |
| README.md | NOT STARTED — Phase 14 | project root |

---

## 3. Phase Status

| Phase | Name | Status |
|---|---|---|
| PLANNING | Documentation | APPROVED |
| 0 | Project Foundation | VERIFIED |
| 1 | Database + Research Schema | VERIFIED |
| 2 | First Real Evidence Ingestion | VERIFIED |
| 3 | Cleaning + Normalization + Dedup | INTEGRATED IN PHASE 2 (Formalized in Phase 3) |
| 4 | Relevance Classifier | NOT STARTED |
| 5 | Structured AI Extraction | NOT STARTED |
| 6 | Thread / Journey Reconstruction | NOT STARTED |
| 7 | Embeddings + Pattern Clustering | NOT STARTED |
| 8 | RAG + Citations | NOT STARTED |
| 9 | Research UI | NOT STARTED |
| 10 | Human Review Workflow | NOT STARTED |
| 11 | Google Docs MCP (optional) | NOT STARTED |
| 12 | Scale Corpus toward 2,000+ | NOT STARTED |
| 13 | Evaluation + Security Hardening | NOT STARTED |
| 14 | Deployment | NOT STARTED |
| 15 | Reviewer Acceptance Testing | NOT STARTED |

---

## 4. Corpus Status

| Metric | Value |
|---|---|
| Records collected | 10 |
| Records qualifying (USER_EVIDENCE, main) | 10 |
| Records analysed | 0 (deferred to Phase 4/5) |
| Records embedded | 0 (deferred to Phase 7) |
| Clusters identified | 0 |
| Gold-standard examples | 10 (initial real seed set) |
| Corpus snapshot date | 2026-10-06 |

---

## 5. External Services Status

| Service | Status |
|---|---|
| GitHub | CONFIGURED (origin/main connected) |
| Supabase | CONFIGURED (CLI linked to hosted dev project; Migrations 001–009 deployed & verified) |
| Vercel | NOT CONFIGURED |
| Google AI Studio / Gemini API | NOT CONFIGURED |
| YouTube Data API | NOT CONFIGURED (Phase 12) |
| Reddit API | CONDITIONAL — requires approval |
| Apify | NOT CONFIGURED (optional) |
| Google Docs MCP | NOT CONFIGURED (Phase 11 optional) |

---

## 6. Credential Status

| Credential | Required for | Status |
|---|---|---|
| GitHub account | Phase 0 | CONFIGURED |
| Supabase credentials | Phase 1 | CONFIGURED (.env.local configured & safety verified, ignored by Git) |
| GEMINI_API_KEY | Phase 4 | NEEDED LATER |
| Vercel account | Phase 9 | NEEDED LATER |
| YOUTUBE_API_KEY | Phase 12 | NEEDED LATER |
| REDDIT_CLIENT_ID / SECRET | Phase 12 (conditional) | CONDITIONAL |
| APIFY_API_TOKEN | Phase 12 (optional) | OPTIONAL |
| MCP_SERVER_URL + Google OAuth | Phase 11 (optional) | OPTIONAL |

---

## 7. Current Blockers

None for Phase 1. Phase 1 hosted database deployment and verification is complete.
Do not start Phase 2 until explicitly instructed.

---

## 8. Open Questions (Requiring Human Decision)

| # | Question | Impact |
|---|---|---|
| Q1 | Is the proposed architecture (Next.js + Supabase + Gemini) approved? | Approved for Phase 0 execution |
| Q2 | Is the research schema approved? | Phase 1 schema setup |
| Q3 | Is Reddit collection approved? (Research API terms) | Phase 12 Reddit connector blocked |
| Q4 | Is Google Docs MCP export needed? | Phase 11 scope (optional) |
| Q5 | Which 10 real records does the researcher want to use for the Phase 2 vertical slice? | Phase 2 data preparation |

---

## 9. Next Actions

1. Human gives explicit direction to begin Phase 1 (Database + Research Schema)
2. Configure Supabase credentials in `.env.local`
3. Execute Phase 1 migrations and tests


---

## 10. Key Rules for This Document

- Update after every significant phase milestone
- Update when phase status changes
- Update when blockers are resolved
- Update when open questions are answered
- Update corpus statistics after every collection/analysis run
- This document is the canonical source of "what state is the project in right now"
- Do not let this fall out of date; stale PROJECT_STATE is worse than no PROJECT_STATE

---

## 11. Document Maintenance

This file must be updated:
- At the start of every new session (verify current state)
- After every completed phase
- After every credential is configured
- After every significant architecture decision
- After every evaluation run (Evals.md → PROJECT_STATE corpus section)
- Before any long session break (SESSION_HANDOFF.md should also be created)
