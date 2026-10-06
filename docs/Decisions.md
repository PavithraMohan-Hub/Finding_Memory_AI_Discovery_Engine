# Decisions — Finding Memory

**Version:** 1.0  
**Status:** DRAFT — Awaiting human approval before implementation  
**Created:** 2026-10-06

---

## Purpose

This file records all major, non-obvious decisions made during planning and implementation. Each entry includes the context, the options considered, the decision made, the rationale, the known trade-offs, and any reversal conditions.

New decisions are appended — existing entries are never overwritten. Reversed decisions are noted with a reversal entry that links to the original.

---

## Decision Log

---

### D-001 — Single Runtime AI Provider (Gemini Only)

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | Initial architecture planning |

**Context:**  
The project requires AI for relevance classification, structured extraction, embedding generation, clustering synthesis, and RAG synthesis. Multiple providers (OpenAI, Anthropic, Gemini) were possible candidates.

**Options considered:**

| Option | Description |
|---|---|
| A — Single provider (Gemini) | One API key, one integration, one billing account, free tier via Google AI Studio |
| B — Multi-provider | Different models for different tasks; more expensive; more credential complexity |
| C — Open-source only | Local models; no API cost; limited quality for complex extraction |

**Decision:** Option A — Gemini API via Google AI Studio (free tier).

**Rationale:**
- Free-first architecture principle: Google AI Studio provides a free tier for Gemini models
- Avoids multi-provider credential management during prototyping
- Gemini supports embedding, classification, and synthesis in a single provider
- Can revisit if quality is insufficient at Phase 4 evaluation (E1)

**Trade-offs:**
- Dependent on one provider's uptime and pricing
- If Gemini free tier limits are hit at scale, a paid tier or provider switch would require a formal ARCHITECTURE CHANGE REQUEST

**Reversal condition:** Evaluation (E1, E2) shows systematic quality issues that cannot be resolved with prompt engineering. Requires formal ARCHITECTURE CHANGE REQUEST.

---

### D-002 — pgvector in Supabase (Not Separate Vector DB)

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | Initial architecture planning |

**Context:**  
Semantic retrieval requires a vector index. Options included a dedicated vector database (Pinecone, Weaviate, Qdrant) or the pgvector extension within Supabase PostgreSQL.

**Options considered:**

| Option | Description |
|---|---|
| A — pgvector in Supabase | One database for structured + vector data; free tier supports pgvector |
| B — Pinecone | Dedicated vector DB; separate account, separate data residency, paid after free tier |
| C — Qdrant self-hosted | Open-source; additional hosting requirement |

**Decision:** Option A — pgvector extension in Supabase.

**Rationale:**
- Eliminates a separate service and credential
- Data is colocated: filter + full-text + vector in a single SQL query (hybrid retrieval)
- Supabase free tier supports pgvector
- Simplifies schema migrations (one migration system for all tables)

**Trade-offs:**
- At very large vector scale (millions of vectors), dedicated vector DB may outperform pgvector
- Current scale target (2,000–10,000 records) is well within pgvector's range

**Reversal condition:** Demonstrated performance degradation at scale that cannot be resolved with index tuning. Requires formal ARCHITECTURE CHANGE REQUEST.

---

### D-003 — Next.js Full-Stack (Not Separate Frontend + Backend)

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | Initial architecture planning |

**Context:**  
The application needs a frontend and a backend API. Options included a separate React SPA + Python/Node backend or a Next.js full-stack deployment.

**Options considered:**

| Option | Description |
|---|---|
| A — Next.js full-stack | One repo, one deployment, server-side rendering, API routes all colocated |
| B — React SPA + separate Python API | Two repos, two deployments, more credential complexity |
| C — React SPA + separate Node API | Similar to B |

**Decision:** Option A — Next.js with App Router, TypeScript, deployed to Vercel.

**Rationale:**
- Single deployment, single build process
- API routes in Next.js are sufficient for the current scale
- Free Hobby tier on Vercel supports full-stack Next.js
- TypeScript throughout reduces context-switching
- Python-specific processing (if needed) can be added as a Render microservice in Phase 12+

**Trade-offs:**
- Background-processing constraints: Next.js functions have execution time limits. Long pipeline runs must use the analysis_jobs queue pattern.
- If the research engine is used simultaneously by many researchers, serverless function cold starts may become noticeable

**Reversal condition:** Background processing requirements exceed serverless function limits and the job-queue pattern is insufficient. Requires formal ARCHITECTURE CHANGE REQUEST.

---

### D-004 — Manual Import as the First Ingestion Method

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | Vertical slice milestone design |

**Context:**  
Phase 2 is the first real evidence ingestion. Building and testing every source connector before the schema is proven risks wasting effort on invalid connector implementations.

**Options considered:**

| Option | Description |
|---|---|
| A — Manual import first | Researcher supplies 10 records; proves schema holds real data |
| B — Automated connector first | Build Play Store connector; collect 10 records |
| C — Both simultaneously | High complexity risk early |

**Decision:** Option A — ManualCSVConnector and ManualJSONConnector implemented first. Automated connectors in Phase 12.

**Rationale:**
- Validates the schema and pipeline with zero connector complexity
- The RawEvidenceRecord interface is proven on real data before any connector must implement it
- If the schema needs revision, manual import is easy to re-import; connector output is harder to re-run

**Trade-offs:**
- Researcher must manually identify and prepare 10 records
- Manual import cannot scale; automated connectors are required for Phase 12

**Reversal condition:** Not applicable — this is a sequencing decision; automated connectors are always planned for later phases.

---

### D-005 — GitHub Actions for Scheduling (Not a Dedicated Queue Service)

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | Free-first infrastructure principle |

**Context:**  
Periodic evidence collection and pipeline runs require scheduling. Options included GitHub Actions, a dedicated queue (BullMQ, Redis), or a managed scheduler.

**Options considered:**

| Option | Description |
|---|---|
| A — GitHub Actions cron | Free; version-controlled; no additional service |
| B — Vercel Cron + external queue | Vercel cron is available on Hobby; queue adds complexity |
| C — BullMQ + Redis | More powerful job queue; requires Redis; not free |

**Decision:** Option A — GitHub Actions with scheduled cron or manual workflow_dispatch.

**Rationale:**
- Free tier
- Version-controlled schedule definition
- Workflow runs are logged in GitHub; easy to inspect
- For Phase 0–12 scale, GitHub Actions is sufficient

**Trade-offs:**
- GitHub Actions has a 6-hour per-job limit; very long pipeline runs need the analysis_jobs queue within the database
- GitHub Actions cron has approximately 1-minute timing precision

**Reversal condition:** Pipeline runs exceed GitHub Actions time limits and cannot be further decomposed. Add a dedicated queue service via formal ARCHITECTURE CHANGE REQUEST.

---

### D-006 — No Autonomous Agent Framework

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | Simplicity principle |

**Context:**  
The AI pipeline has 9 sequential stages. These could be implemented as autonomous agents using a framework like LangGraph, Autogen, or similar.

**Options considered:**

| Option | Description |
|---|---|
| A — Modular prompt stages (plain functions) | Each stage is a typed function with defined input/output; called sequentially |
| B — LangGraph or similar framework | Agent framework orchestrating stage transitions |
| C — Multi-agent pattern | Separate agents for extraction, clustering, RAG |

**Decision:** Option A — Modular functions/services; no autonomous agent orchestration framework.

**Rationale:**
- Master prompt rule: "Do not over-engineer autonomous agents unnecessarily"
- Modular functions are simpler to test, debug, and version
- Sequential stage execution is predictable and auditable
- Agent frameworks add complexity without demonstrated need at this scale
- Evaluation of each stage is simpler with typed function inputs/outputs

**Trade-offs:**
- Adding parallelism later would require refactoring to async batch processing (already planned via analysis_jobs queue)

**Reversal condition:** Demonstrated need for dynamic agent routing that cannot be achieved with explicit functions. Requires formal ARCHITECTURE CHANGE REQUEST.

---

### D-007 — Reddit Disabled by Default Until Research Approval

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | DataSources.md §3.4; source compliance rules |

**Context:**  
Reddit is a high-priority source for detailed retrieval thread evidence. However, Reddit's current API policy (Responsible Builder Policy) requires approval for research access. The policy may change.

**Decision:** Reddit connector access_status = CONDITIONAL. Implementation proceeds but is disabled until written approval is confirmed. Reddit is not a blocking dependency for MVP completion.

**Rationale:**
- Cannot assume research-use approval without confirmation
- Building the connector is acceptable; enabling it without approval is not
- Manual import of publicly visible Reddit threads (where independently permitted) remains possible as a limited fallback

**Trade-offs:**
- May significantly reduce corpus volume from a high-quality source
- Manual import is not scalable for large thread sets

**Reversal condition:** Written research-API approval obtained from Reddit. Update source_registry, enable connector, add credentials. Recheck policy at time of actual collection.

---

### D-008 — Evidence Type Labels Required on All AI Outputs

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | ResearchSchema.md §8.4; docs/ProblemStatement_Finding_Memory.txt §U |

**Context:**  
AI analysis produces claims about what users said, believed, or did. Without explicit labelling, AI-interpreted content can be mistaken for direct quotes or confirmed behaviour.

**Decision:** All AI-generated cue objects, action objects, and synthesis outputs must carry an evidence_label field:
- DIRECT_STATEMENT — AI identified an explicit statement in source
- STRONGLY_IMPLIED_BEHAVIOUR — AI inferred from strong contextual evidence
- AI_INTERPRETATION — AI's interpretive layer; no direct source backing
- RESEARCH_HYPOTHESIS — Broader explanation requiring testing

**Rationale:**
- Critical for research validity: researchers must be able to distinguish what the user said from what the AI inferred
- Required by the master prompt and docs/ProblemStatement_Finding_Memory.txt
- Must be enforced in UI: "WHAT THE USER SAID" vs "WHAT THE AI INTERPRETED" are visually distinct

**Trade-offs:**
- Adds complexity to extraction prompts and output schema
- Researchers must understand the label taxonomy

**Reversal condition:** Not applicable — this is a core research validity requirement.

---

### D-009 — Corpus Baseline: Google Photos First, Multi-Product Later

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | docs/ProblemStatement_Finding_Memory.txt §A, §F; vertical slice milestone |

**Context:**  
The project aims to collect evidence across Google Photos and comparison products (Apple Photos, Amazon Photos, Samsung Gallery, etc.). Building multi-product collection from day one adds scope risk.

**Decision:** The vertical slice milestone uses Google Photos evidence only. Comparison product sources are added in Phase 12.

**Rationale:**
- Google Photos is the primary investigation product
- Vertical slice must prove end-to-end pipeline before multi-product complexity is added
- Comparison product sources are explicitly in scope but not blocking for initial verification

**Trade-offs:**
- Initial evaluation results are Google Photos-only; may need updating once comparison sources are added

**Reversal condition:** Not applicable — this is a sequencing decision, not a permanent exclusion.

---

### D-010 — "Insufficient Evidence" Response Is Fixed Phrase

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | AntigravityMasterPrompt.txt §AZ; docs/ProblemStatement_Finding_Memory.txt research validity |

**Context:**  
When the RAG system cannot support an answer from the corpus, it needs a truthful response. Options included free-form explanation or a fixed phrase.

**Decision:** The exact, non-variable response when corpus cannot support an answer is:

> "Insufficient evidence in the current research corpus."

No variation permitted. The UI may add context below this phrase (e.g., corpus snapshot date, active filters) but the phrase itself must not be paraphrased.

**Rationale:**
- Prevents AI from silently filling evidence gaps with general model knowledge
- Makes it easy to test (Evals §8.3)
- Makes it easy for researchers to identify and act on corpus gaps

**Trade-offs:**
- May feel terse to researchers unfamiliar with the system
- Context below the phrase (filters, snapshot date) mitigates this

**Reversal condition:** Not applicable — this is a research validity requirement.

---

### D-011 — No Gmail or Email Integration — Permanent

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | PERMANENT — OUT OF SCOPE |
| Decided by | docs/ProblemStatement_Finding_Memory.txt §D; master prompt §BT analogue |

**Context:**  
Gmail integration was considered as a possible source for retrieval-related emails or notifications. It was explicitly excluded.

**Decision:** Gmail and all email integrations are permanently out of scope for Finding Memory.

**Rationale:**
- docs/ProblemStatement_Finding_Memory.txt §D explicitly excludes Gmail
- Access to personal email creates significant privacy risks
- Email is not a publicly collectable source

**Reversal condition:** None — permanent scope exclusion.

---

### D-012 — No Consumer-Facing Feature Prototyping in This Engine

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | PERMANENT |
| Decided by | docs/ProblemStatement_Finding_Memory.txt §E |

**Context:**  
There was a risk that the Opportunities surface could be used to mockup or prototype product features.

**Decision:** The Opportunities surface surfaces problems worth investigating — not feature ideas, not design proposals, not prototypes.

**Rationale:**
- docs/ProblemStatement_Finding_Memory.txt §E: "This is a research engine, not a product design tool"
- Generating feature ideas from corpus evidence conflates research and design
- Any auto-generated "features" would be pre-mature without further research validation

**Reversal condition:** None — permanent scope decision.

---

### D-013 — 2,000-Record Target Is Incremental, Not Day-One

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | Master prompt and vertical-slice milestone; user instruction |

**Context:**  
The docs/ProblemStatement_Finding_Memory.txt targets approximately 2,000 qualifying USER_EVIDENCE records. Without a proven pipeline, collecting 2,000 records immediately would risk a large corpus of inconsistently processed evidence.

**Decision:** Incremental approach:
1. Prove with 10 real records (Phase 2 vertical slice)
2. Scale to 100 records (Phase 2–5 consolidation)
3. Scale to 500 records (Phase 12 early scale)
4. Scale toward 2,000+ records (Phase 12 full scale)

Each scale checkpoint requires a verified pipeline before proceeding.

**Rationale:**
- Master prompt and user instruction explicitly prohibit collecting 2,000 records before architecture is proven
- Bugs in extraction at 10 records are far cheaper to fix than at 2,000
- A smaller, well-processed corpus is more valuable than a large, inconsistently processed one

**Trade-offs:**
- Longer time to full corpus
- Honest shortfall reporting required if 2,000 is not reached before the end of the project

**Reversal condition:** Not applicable — this is the mandatory approach.

---

### D-014 — Embedding Model Must Be Dedicated; Not a Reasoning Model

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | AntigravityMasterPrompt.txt §AX |

**Context:**  
Embeddings could theoretically be generated from a reasoning model's hidden states or by prompting a chat model to produce a vector. Neither is appropriate.

**Decision:** All vector embeddings are generated exclusively by a dedicated embedding model (e.g., Gemini text-embedding model). Reasoning models must not be used for embedding generation.

**Rationale:**
- Embedding models produce semantically stable, comparable vector spaces
- Using a reasoning model for embeddings would produce inconsistent, session-dependent representations
- Stability and comparability are required for vector search quality

**Trade-offs:**
- A separate API call for embeddings (vs reusing a reasoning call)

**Reversal condition:** Not applicable.

---

### D-015 — source_url Is Required; Records Without It Are Rejected

| Field | Value |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning |
| Status | ACCEPTED |
| Decided by | ResearchSchema.md §5; DataSources.md §9 |

**Context:**  
Evidence without a source URL cannot be traced, verified, or included in citations.

**Decision:** source_url is a NOT NULL required field on raw_evidence. Any import or connector output without a source_url is rejected with a specific error message. No record enters the corpus without provenance.

**Rationale:**
- Citation traceability is a core project requirement
- Un-traceable evidence cannot be used in RAG citations
- Researchers must be able to follow citations to the original source

**Trade-offs:**
- Researcher must ensure manual imports include source URLs (adds preparation burden)

**Reversal condition:** Not applicable — core research validity requirement.

---

### D023: Use TEXT + CHECK Constraints instead of Native PostgreSQL ENUMs

| Aspect | Details |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning (Architecture Audit) |
| Status | ACCEPTED |
| Decided by | Database Architecture Review |

**Context:**  
Research taxonomies (e.g., `retrieval_relevance`, `message_role`, `problem_codes`) will evolve as analysis uncovers new patterns. Native PostgreSQL ENUMs are rigid and difficult to modify or remove values from in a live database without complex migrations.

**Decision:** 
Use standard `TEXT` columns enforced by `CHECK` constraints (e.g., `CHECK (message_role IN ('ORIGINAL_POST', 'OP_FOLLOWUP', ...))`) instead of native `ENUM` types.

**Rationale:**
- Adding/removing values to a `CHECK` constraint is a simple `ALTER TABLE` statement (drop and recreate the constraint).
- Prevents database state lock-in when qualitative codebooks evolve.
- Maintains data integrity while maximizing flexibility for the research process.

**Trade-offs:**
- Slightly larger storage footprint than native ENUMs (negligible for expected data scale).

**Reversal condition:** If strict, unchangeable type safety becomes necessary and taxonomy drift ceases completely.

---

### D024: Defer Vector Embeddings Implementation to Phase 7

| Aspect | Details |
|---|---|
| Date | 2026-10-06 |
| Phase | Planning (Architecture Audit) |
| Status | ACCEPTED |
| Decided by | AI System Architecture Review |

**Context:**  
Phase 1 focuses exclusively on the foundational relational schema and secure access patterns. Vector similarity search (`pgvector`) requires selecting an embedding model, defining dimensions, and setting up vector indexes.

**Decision:** 
Do not implement the `evidence_embeddings` table or enable `pgvector` in the Phase 1 schema migration. Defer all embedding-related architecture and implementation to Phase 7 (Embeddings & Semantic Search).

**Rationale:**
- Prevents premature optimization and coupling to a specific embedding dimension.
- Keeps Phase 1 scoped tightly to core data ingestion and integrity constraints.
- Embedding strategy depends on real data characteristics discovered in Phases 2-5.

**Trade-offs:**
- Requires a separate migration in Phase 7 to create the table and vector indexes.

**Reversal condition:** If basic semantic deduplication is required during initial data ingestion (currently planned for Phase 7).
