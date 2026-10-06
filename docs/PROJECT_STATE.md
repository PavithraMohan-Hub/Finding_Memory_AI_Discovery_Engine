# PROJECT_STATE — Finding Memory

**Last updated:** 2026-10-06  
**Current phase:** PLANNING — Documentation Complete  
**Status:** AWAITING HUMAN APPROVAL before any implementation begins

---

## 1. Overview

| Field | Value |
|---|---|
| Project | Finding Memory — AI Discovery Engine for Incomplete-Memory Visual Retrieval |
| Primary product investigated | Google Photos (with comparison products) |
| Research goal | Understand how people attempt to retrieve photos when their memory of them is incomplete |
| Target corpus | ~2,000 qualifying USER_EVIDENCE records (incremental: 10 → 100 → 500 → 2,000+) |
| Architecture | Next.js/TypeScript (Vercel) + Supabase PostgreSQL + pgvector + Gemini API + GitHub Actions |
| Current implementation state | Zero — no code written, no services activated |

---

## 2. Documentation Status

| Document | Status | Location |
|---|---|---|
| docs/ProblemStatement_Finding_Memory.txt | EXISTS (source of truth) | docs/ |
| AntigravityMasterPrompt.txt | EXISTS (operating rules) | docs/ |
| Architecture.md | DRAFT — Awaiting approval | docs/ |
| DataSources.md | DRAFT — Awaiting approval | docs/ |
| ResearchSchema.md | DRAFT — Awaiting approval | docs/ |
| ImplementationPlan.md | DRAFT — Awaiting approval | docs/ |
| Conventions.md | DRAFT — Awaiting approval | docs/ |
| EdgeCases.md | DRAFT — Awaiting approval | docs/ |
| Evals.md | DRAFT — Awaiting approval | docs/ |
| Decisions.md | DRAFT — Awaiting approval | docs/ |
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
| PLANNING | Documentation | IMPLEMENTED — NOT TESTED (awaiting approval) |
| 0 | Project Foundation | NOT STARTED |
| 1 | Database + Research Schema | NOT STARTED |
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
| GitHub | NOT CONFIGURED (no repo yet) |
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
| GitHub account | Phase 0 | NEEDED NOW |
| Supabase account | Phase 1 | NEEDED NEXT |
| GEMINI_API_KEY | Phase 4 | NEEDED LATER |
| Vercel account | Phase 9 | NEEDED LATER |
| YOUTUBE_API_KEY | Phase 12 | NEEDED LATER |
| REDDIT_CLIENT_ID / SECRET | Phase 12 (conditional) | CONDITIONAL |
| APIFY_API_TOKEN | Phase 12 (optional) | OPTIONAL |
| MCP_SERVER_URL + Google OAuth | Phase 11 (optional) | OPTIONAL |

---

## 7. Current Blockers

1. **Human approval required.** All 9 planning documents are in DRAFT status. No implementation may begin until the full documentation set is explicitly approved.
2. **No Git repository.** Phase 0 cannot begin without approval.
3. **Reddit access status unknown.** Must be resolved before Phase 12 Reddit connector is enabled.

---

## 8. Open Questions (Requiring Human Decision)

| # | Question | Impact |
|---|---|---|
| Q1 | Is the proposed architecture (Next.js + Supabase + Gemini) approved? | All phases blocked until approval |
| Q2 | Is the research schema approved? | Phase 1 blocked until approval |
| Q3 | Is Reddit collection approved? (Research API terms) | Phase 12 Reddit connector blocked |
| Q4 | Is Google Docs MCP export needed? | Phase 11 scope (optional) |
| Q5 | Which 10 real records does the researcher want to use for the Phase 2 vertical slice? | Phase 2 blocked on researcher data preparation |

---

## 9. Next Actions (After Approval)

1. Human explicitly approves the full documentation set
2. Phase 0 begins: initialize Git repository, Next.js scaffold, .gitignore, .env.example, CI
3. Researcher identifies 10 qualifying public Google Photos records for Phase 2 manual import
4. Create GitHub repository (user action required)

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
