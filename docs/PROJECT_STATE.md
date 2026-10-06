# PROJECT_STATE — Finding Memory

**Last updated:** 2026-10-06  
**Current phase:** Phase 0 — Project Foundation (VERIFIED)  
**Status:** PHASE 0 — VERIFIED  

---

## 1. Overview

| Field | Value |
|---|---|
| Project | Finding Memory — AI Discovery Engine for Incomplete-Memory Visual Retrieval |
| Primary product investigated | Google Photos (with comparison products) |
| Research goal | Understand how people attempt to retrieve photos when their memory of them is incomplete |
| Target corpus | ~2,000 qualifying USER_EVIDENCE records (incremental: 10 → 100 → 500 → 2,000+) |
| Architecture | Next.js/TypeScript (Vercel) + Supabase PostgreSQL + pgvector + Gemini API + GitHub Actions |
| Current implementation state | Phase 0 Executable Verification Complete |

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
- **Last safe commit:** 60ccb58 (feat(phase-0): complete and verify executable Next.js TypeScript foundation)

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
| 1 | Database + Research Schema | NOT STARTED (Awaiting start command) |
| 2 | First Real Evidence Ingestion | NOT STARTED |
| 3 | Cleaning + Normalization + Dedup | NOT STARTED |
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
| Records collected | 0 |
| Records qualifying (USER_EVIDENCE, main) | 0 |
| Records analysed | 0 |
| Records embedded | 0 |
| Clusters identified | 0 |
| Gold-standard examples | 0 |
| Corpus snapshot date | — |

---

## 5. External Services Status

| Service | Status |
|---|---|
| GitHub | CONFIGURED (origin/main connected) |
| Supabase | NOT CONFIGURED |
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
| Supabase account | Phase 1 | NEEDED NEXT (Phase 1) |
| GEMINI_API_KEY | Phase 4 | NEEDED LATER |
| Vercel account | Phase 9 | NEEDED LATER |
| YOUTUBE_API_KEY | Phase 12 | NEEDED LATER |
| REDDIT_CLIENT_ID / SECRET | Phase 12 (conditional) | CONDITIONAL |
| APIFY_API_TOKEN | Phase 12 (optional) | OPTIONAL |
| MCP_SERVER_URL + Google OAuth | Phase 11 (optional) | OPTIONAL |

---

## 7. Current Blockers

None for Phase 0. Phase 0 executable verification is complete.
Do not start Phase 1 until explicitly instructed.

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
