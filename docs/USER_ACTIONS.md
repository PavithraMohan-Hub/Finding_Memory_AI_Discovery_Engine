# USER_ACTIONS — Finding Memory

**Version:** 1.0  
**Last updated:** 2026-10-06  
**Purpose:** Track manual actions required from the researcher at each phase

---

## Purpose

This document lists the manual steps that only the human researcher can do — account creation, credential collection, data preparation, decision-making, and review tasks. These are not things the AI assistant can do on the researcher's behalf.

---

## Actions Needed NOW (Before Phase 0)

### U-001 — Approve the Planning Documents

| Field | Value |
|---|---|
| Required for | Phase 0 to begin |
| Effort | 30–60 minutes review |
| Action | Read all nine planning documents; provide explicit approval or request changes |

**Documents to review:**
- [ ] docs/Architecture.md
- [ ] docs/DataSources.md
- [ ] docs/ResearchSchema.md
- [ ] docs/ImplementationPlan.md
- [ ] docs/Conventions.md
- [ ] docs/EdgeCases.md
- [ ] docs/Evals.md
- [ ] docs/Decisions.md

**Response format:** Approve / Approve with changes (specify) / Reject with reason

---

## Actions Needed NEXT (Phase 0)

### U-002 — Create or Confirm GitHub Account and Repository

| Field | Value |
|---|---|
| Required for | Phase 0 |
| Effort | 15–30 minutes |
| Cost | Free |
| Link | https://github.com |

**Steps:**
1. Create a GitHub account if not already existing
2. Create a new private repository named `finding-memory` (or similar)
3. Do not add any files via the GitHub UI (the agent will initialize the repo)
4. Confirm the repository URL to the agent

**Notes:**
- If you already have a GitHub account, confirm the username
- Repository can be private; this does not affect GitHub Actions CI
- Do not initialize with a README from GitHub (the scaffold will create it)

---

## Actions Needed NEXT (Phase 1)

### U-003 — Create Supabase Project

| Field | Value |
|---|---|
| Required for | Phase 1 |
| Effort | 15 minutes |
| Cost | Free (Hobby plan) |
| Link | https://supabase.com |

**Steps:**
1. Create a Supabase account (free)
2. Create a new project (choose a region near your location)
3. Set a strong database password (store it securely; not in any file)
4. After project initializes, go to Settings → API
5. Copy NEXT_PUBLIC_SUPABASE_URL (Project URL)
6. Copy NEXT_PUBLIC_SUPABASE_ANON_KEY (anon / public key)
7. Copy SUPABASE_SERVICE_ROLE_KEY (service_role key — keep this private)
8. Add these to .env.local in the project root (the agent will show you the format)

**IMPORTANT:**
- SUPABASE_SERVICE_ROLE_KEY must NEVER be committed to Git
- SUPABASE_SERVICE_ROLE_KEY must NEVER be in a variable prefixed with NEXT_PUBLIC_
- Enable pgvector extension: Database → Extensions → search "pgvector" → enable

---

## Actions Needed LATER (Phase 4)

### U-004 — Create Google AI Studio Account and Gemini API Key

| Field | Value |
|---|---|
| Required for | Phase 4 (Relevance Classifier) |
| Effort | 10 minutes |
| Cost | Free tier |
| Link | https://aistudio.google.com |

**Steps:**
1. Sign in to Google AI Studio with your Google account
2. Go to "Get API key" (top-left menu or https://aistudio.google.com/apikey)
3. Create a new API key
4. Add to .env.local: GEMINI_API_KEY=your-key-here

**IMPORTANT:**
- Do not commit GEMINI_API_KEY to Git
- Store securely; rotate if accidentally exposed
- Free tier rate limits apply; monitor usage in AI Studio dashboard

---

## Actions Needed LATER (Phase 2 — Data Preparation)

### U-005 — Prepare 10 Real Evidence Records for Phase 2 Vertical Slice

| Field | Value |
|---|---|
| Required for | Phase 2 |
| Effort | 1–2 hours |
| Action | Identify and prepare 10 qualifying public Google Photos records |

**Criteria for each record:**
- Must be a real, publicly visible account of a person describing an attempt to find a photo/video in Google Photos when their memory of it was incomplete
- Must have a publicly accessible source URL
- Must be from an approved source: Google Photos Help Community, Google Play Store reviews, Apple App Store reviews, YouTube comments, or another permitted public source
- Must not require bypassing authentication to access

**Format to provide:**
- A CSV or JSON file with these fields for each record:
  - `source_url`: the URL where the record was found
  - `source_platform`: one of: google_play_store / apple_app_store / google_photos_help_community / youtube / other
  - `original_text`: the exact text as it appears at the source (copy-paste; do not paraphrase)
  - `published_at`: the date of publication if visible (optional)
  - `title`: the thread title or review title if available (optional)
  - `rating`: the star rating if available (optional)

**Notes:**
- Do not include any private or personally sensitive information
- If you're not sure whether a record qualifies, include it and mark it NEEDS_REVIEW
- The CSV template will be provided by the agent when Phase 2 begins

---

## Actions Needed LATER (Phase 4–5 — Gold Standard)

### U-006 — Create First 40 Gold-Standard Examples for Evaluation

| Field | Value |
|---|---|
| Required for | Phase 4 evaluation (E1) |
| Effort | 3–5 hours |
| Action | Manually label 40 records from the real corpus |

**What you will do:**
- The agent will present 40 records from the collected corpus
- For each record, you label:
  - Relevance category (MAIN_INCOMPLETE_MEMORY / PRECISE_MEMORY_SYSTEM_FAILURE / CONTEXT_ONLY / EXCLUDED)
  - Your rationale (1–2 sentences)
- For extraction evaluation: identify cues you see, the outcome, and whether initial_query is reported

**Tips:**
- Work at a pace that allows careful attention; do not rush
- Note any records where you are genuinely uncertain — these are valuable as NEEDS_REVIEW cases
- These labels become the ground truth for measuring AI quality; consistency matters

---

## Actions Needed LATER (Phase 12)

### U-007 — Confirm Reddit Access Approval Status

| Field | Value |
|---|---|
| Required for | Phase 12 Reddit connector |
| Action | Confirm whether Reddit research API access has been approved |

**Background:**
Reddit's Responsible Builder Policy requires approval for API access for research purposes.

**If you have or can obtain research access:**
1. Obtain REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET through the approved research access programme
2. Provide the credentials when Phase 12 Reddit connector is being implemented

**If you cannot obtain research access:**
- The Reddit connector will remain UNAVAILABLE
- Manual import of publicly visible Reddit threads (where independently permitted) may be used as a limited fallback
- The corpus statistics will note this gap

---

### U-008 — Confirm Whether Apify Is Needed

| Field | Value |
|---|---|
| Required for | Phase 12 (if automated Play Store collection is needed) |
| Action | Decide whether to use Apify for compliant public review collection |

**Background:**
Apify provides pre-built "actors" for public review collection (Google Play, App Store, etc.) that operate on public data. A free tier is available.

**If yes:** Create an Apify account and provide APIFY_API_TOKEN when Phase 12 begins.  
**If no:** Manual import will be used as the collection method for affected sources.

---

## Actions Needed LATER (Phase 9)

### U-009 — Create Vercel Account and Connect Repository

| Field | Value |
|---|---|
| Required for | Phase 9 (deployment) |
| Effort | 15 minutes |
| Cost | Free (Hobby) |
| Link | https://vercel.com |

**Steps:**
1. Create a Vercel account (or use existing)
2. Connect GitHub account to Vercel
3. Import the finding-memory repository
4. Configure environment variables in Vercel dashboard (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY)
5. Deploy (the agent will guide this step)

---

## Actions Needed LATER (Phase 11 — Optional)

### U-010 — Confirm Whether Google Docs Export Is Needed

| Field | Value |
|---|---|
| Required for | Phase 11 (optional) |
| Action | Decide whether the Google Docs MCP report export feature should be built |

**Background:**
The system can export research reports directly to a Google Docs document via MCP. This is optional — the application works fully without it.

**If yes:** Confirm the MCP server is available and provide MCP_SERVER_URL and Google OAuth credentials when Phase 11 begins.  
**If no:** Phase 11 is skipped; no impact on core functionality.

---

## Human Review Actions (Ongoing from Phase 4)

### U-011 — Review AI Analysis (NEEDS_REVIEW Queue)

| Field | Value |
|---|---|
| Required for | Phases 4–12, ongoing |
| Action | Periodically review records in the NEEDS_REVIEW queue |

**What you will do:**
- The Human Review surface in the application will show records where AI analysis has low confidence or flagged ambiguity
- For each record: confirm or correct the relevance category, cue extraction, or outcome
- Your corrections update the evidence_analysis record and are logged in human_annotations with an audit trail

---

## Summary Table

| Action | Phase | Status |
|---|---|---|
| U-001: Approve planning documents | NOW | PENDING |
| U-002: GitHub account + repo | Phase 0 | PENDING |
| U-003: Supabase project | Phase 1 | PENDING |
| U-004: Gemini API key | Phase 4 | PENDING |
| U-005: 10 real evidence records | Phase 2 | PENDING |
| U-006: 40 gold-standard labels | Phase 4–5 | PENDING |
| U-007: Reddit access approval | Phase 12 | CONDITIONAL |
| U-008: Apify decision | Phase 12 | PENDING |
| U-009: Vercel account | Phase 9 | PENDING |
| U-010: Google Docs MCP decision | Phase 11 | OPTIONAL |
| U-011: NEEDS_REVIEW queue review | Phases 4–12+ | RECURRING |
