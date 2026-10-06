# KNOWN_ISSUES — Finding Memory

**Version:** 1.0  
**Last updated:** 2026-10-06  
**Purpose:** Track identified risks, limitations, and known issues that are unresolved or accepted

---

## Issue Format

Each issue records: ID, status, severity, phase discovered, description, impact, known workaround, and resolution plan.

**Severity levels:** CRITICAL (blocks research validity) / HIGH (significant impact) / MEDIUM (notable limitation) / LOW (minor; acceptable)  
**Status:** OPEN / INVESTIGATING / ACCEPTED LIMITATION / RESOLVED

---

## Active Issues

---

### KI-001 — Reddit API Access Is Conditional

| Field | Value |
|---|---|
| ID | KI-001 |
| Status | OPEN |
| Severity | HIGH |
| Phase discovered | Planning |
| Affects | Phase 12 — corpus scale |

**Description:**  
Reddit's Responsible Builder Policy requires written research access approval before the Reddit API can be used for corpus collection. The approval status is currently unknown.

**Impact:**  
r/googlephotos and similar subreddits are high-priority sources for detailed community thread evidence. If Reddit access is unavailable, the corpus will lack this source category entirely. Manual import of a small number of publicly visible threads may partially compensate, but is not scalable to hundreds of threads.

**Workaround:**  
- Manual import of publicly visible Reddit threads (limited; researcher must verify each import's compliance)
- Increase volume from other approved sources (Play Store, App Store, YouTube, Help Community)

**Resolution plan:**  
Researcher confirms Reddit research access status before Phase 12 begins. If unavailable, corpus statistics will report the gap. Reddit connector remains CONDITIONAL until written approval confirmed.

---

### KI-002 — Google Play Store Review Collection: No Official Third-Party API

| Field | Value |
|---|---|
| ID | KI-002 |
| Status | OPEN |
| Severity | MEDIUM |
| Phase discovered | Planning |
| Affects | Phase 12 — Play Store connector |

**Description:**  
The official Google Play Developer API is publisher-only (available only to the app's developer). No official public API for collecting third-party app reviews is available to researchers.

**Impact:**  
Automated collection of Google Photos Play Store reviews (one of the highest-priority sources) requires a compliant third-party collection mechanism or manual import.

**Workaround:**  
- Apify actor for Play Store reviews (operates on public listing pages; verify compliance before use)
- Manual import from public Play Store listing pages (researcher copies reviews with source URL)
- Public RSS or export if the platform provides one (verify at collection time)

**Resolution plan:**  
Researcher decides at Phase 12 whether to use Apify or manual import (see USER_ACTIONS.md U-008). Document in source_registry with confirmed access route.

---

### KI-003 — App Store Review API Limitations

| Field | Value |
|---|---|
| ID | KI-003 |
| Status | ACCEPTED LIMITATION |
| Severity | MEDIUM |
| Phase discovered | Planning |
| Affects | Phase 12 — App Store connector |

**Description:**  
Apple's public App Store RSS feed provides limited review access: typically 500 reviews per locale, most-recent only. Historical reviews before the feed retention window are not accessible programmatically.

**Impact:**  
Corpus may be skewed toward recent reviews; historical retrieval failure patterns from earlier App Store versions may be underrepresented.

**Workaround:**  
- Collect from multiple locales (APP_STORE_COUNTRY parameter) to increase volume
- Manual import of specific historically significant reviews if found via web search
- Disclose this limitation in the corpus statistics and Methods & Limitations surface

**Resolution plan:**  
Accepted limitation. Disclose in corpus statistics and research reports. Do not misrepresent review age distribution.

---

### KI-004 — YouTube Comment Reply Completeness

| Field | Value |
|---|---|
| ID | KI-004 |
| Status | ACCEPTED LIMITATION |
| Severity | LOW |
| Phase discovered | Planning |
| Affects | Phase 12 — YouTube connector |

**Description:**  
The YouTube Data API v3 CommentThreads.list endpoint may return only top-level comments and a limited number of nested replies. Some reply chains may be truncated in the API response.

**Impact:**  
Conversation threads about retrieval attempts may be incomplete; follow-up confirmations or corrections may be missing.

**Workaround:**  
- Use Comments.list with parentId to fetch full reply chains
- Mark thread records with is_complete = FALSE where reply completeness cannot be verified
- Note the limitation in thread_messages.missing_coverage_note

**Resolution plan:**  
Implement the Comments.list fallback in Phase 12 YouTubeConnector. Disclose incompleteness where it applies.

---

### KI-005 — AI Analysis Quality on Non-English Records

| Field | Value |
|---|---|
| ID | KI-005 |
| Status | ACCEPTED LIMITATION |
| Severity | MEDIUM |
| Phase discovered | Planning |
| Affects | Phases 4–8 — AI analysis pipeline |

**Description:**  
The AI extraction pipeline (relevance, cues, outcomes) may perform less reliably on non-English records than on English records, due to training data distribution in the underlying model.

**Impact:**  
Cue extraction, cue state classification, and journey reconstruction may have higher error rates for non-English evidence. Gold-standard evaluation set is initially English-dominant, so evaluation metrics may not generalize.

**Workaround:**  
- Flag non-English records for prioritized human review
- Track language distribution in evaluation results
- If quality is systematically lower for specific languages, increase NEEDS_REVIEW routing

**Resolution plan:**  
Document language distribution in the corpus. Expand gold-standard set to include proportional non-English examples before the Phase 13 final evaluation. Accept as a disclosed limitation if not fully resolvable.

---

### KI-006 — Supabase Free Tier Database Storage Limit

| Field | Value |
|---|---|
| ID | KI-006 |
| Status | OPEN |
| Severity | MEDIUM |
| Phase discovered | Planning |
| Affects | Phase 12 — corpus scale |

**Description:**  
Supabase Hobby plan includes 500MB database storage. A corpus of 2,000+ records with full analysis, embeddings (vector dimension ~768), and thread messages may approach this limit.

**Estimated storage:**
- raw_evidence (2,000 records × ~5KB avg): ~10MB
- evidence_analysis (2,000 × ~20KB): ~40MB
- evidence_embeddings (2,000 × 768 floats × 4 bytes + overhead): ~6MB
- threads, thread_messages, clusters, annotations: ~30MB
- Total estimate: ~90MB — well within 500MB

**Impact:**  
At 2,000 records, storage is estimated to be well within limits. Risk materializes only if corpus scales significantly beyond 2,000 records, or if very large original texts are stored.

**Workaround:**  
Monitor database size in Supabase dashboard. Truncate original_text storage to a configurable maximum (e.g., 20,000 characters) for very long documents; store full text reference separately.

**Resolution plan:**  
Monitor at Phase 12. If approaching limits: (1) upgrade to Supabase Pro ($25/month) or (2) implement text truncation. Record any upgrade as a formal ARCHITECTURE CHANGE REQUEST.

---

### KI-007 — Gemini Free Tier Rate Limits at Scale

| Field | Value |
|---|---|
| ID | KI-007 |
| Status | OPEN |
| Severity | MEDIUM |
| Phase discovered | Planning |
| Affects | Phase 12 — pipeline at scale |

**Description:**  
The Gemini API free tier imposes rate limits (requests/minute, tokens/minute). Processing 2,000 records through a 5-stage extraction pipeline (relevance, cues, behaviour, journey, coding) may hit these limits without deliberate batching and delay.

**Impact:**  
Pipeline runs at scale will be slower. If rate limits are not respected, API requests may fail, requiring retry logic.

**Workaround:**  
- Implement configurable batch sizes with delays between batches
- Use exponential backoff on rate-limit errors (HTTP 429)
- Run pipeline in GitHub Actions overnight to avoid interactive wait time
- Track rate-limit events in analysis_jobs.error_summary

**Resolution plan:**  
Implement rate-limit handling in the Gemini API client (Phase 4). Monitor at Phase 12. If rate limits prevent corpus completion: evaluate Gemini paid tier (formal ARCHITECTURE CHANGE REQUEST).

---

### KI-008 — Instagram and TikTok Collection Is Severely Restricted

| Field | Value |
|---|---|
| ID | KI-008 |
| Status | ACCEPTED LIMITATION |
| Severity | LOW |
| Phase discovered | Planning |
| Affects | Corpus breadth |

**Description:**  
Instagram and TikTok are potential sources for behavioural analogues (visual memory and re-finding content). However, official APIs for research access to public content are severely restricted or unavailable.

**Impact:**  
These platforms are excluded from automated collection. Manual import of a very limited number of carefully selected public posts (where independently permitted) is the only route.

**Workaround:**  
Manual import only; clearly label as corpus_type = USER_EVIDENCE with source_platform = instagram / tiktok; disclose collection limitations in Methods.

**Resolution plan:**  
Accepted limitation. Priority is Google Photos, Apple Photos, and app stores. Instagram/TikTok are low-priority analogues. Add to FUTURE_IDEAS.md for future investigation if access terms change.

---

### KI-009 — No Git Repository Initialized

| Field | Value |
|---|---|
| ID | KI-009 |
| Status | OPEN |
| Severity | HIGH (blocks all implementation) |
| Phase discovered | Planning |
| Affects | Phase 0 and all subsequent phases |

**Description:**  
The project directory has no Git repository. No commits, no version history, no CI.

**Impact:**  
Cannot create a safe checkpoint before Phase 0. Cannot use GitHub Actions for scheduling. Cannot track changes.

**Workaround:**  
None — a Git repository must be initialized as the first step of Phase 0.

**Resolution plan:**  
Initialize Git repository in Phase 0 immediately after documentation approval.

---

### KI-010 — Google Photos Help Community: No Official API

| Field | Value |
|---|---|
| ID | KI-010 |
| Status | OPEN |
| Severity | MEDIUM |
| Phase discovered | Planning |
| Affects | Phase 12 — Help Community connector |

**Description:**  
The Google Photos Help Community (support.google.com/photos/community) is a high-priority source but has no official third-party API.

**Impact:**  
Automated collection requires either a compliant web-page collection approach (verify site terms and robots.txt) or manual import of qualifying threads.

**Workaround:**  
- Manual import as the primary method (researcher copies qualifying thread content with source URL)
- Verify public page collection compliance before enabling any automated approach
- Apify may have a compatible actor; verify before use

**Resolution plan:**  
Researcher verifies access route before Phase 12 Help Community collection begins. Fallback: manual import. Document access decision in source_registry.

---

## Accepted Limitations (Not Tracked as Open Issues)

These are structural limitations of the research approach, not issues to be fixed. They are disclosed in Methods & Limitations.

| # | Limitation |
|---|---|
| L-001 | Corpus is a sample of publicly visible accounts — it does not represent all Google Photos users |
| L-002 | Self-selection bias: only users who post publicly about retrieval problems are captured |
| L-003 | Language bias: collection is likely English-dominant; non-English market patterns may be underrepresented |
| L-004 | Platform coverage gaps: if any source is UNAVAILABLE, those user populations are absent |
| L-005 | Cannot verify whether cited retrieval failures are still present in current product versions |
| L-006 | Thread data may be partially captured (deleted messages, truncated threads) |
| L-007 | AI extraction quality is evaluated against researcher-defined gold standard; researcher interpretation may not match source author's intent |
| L-008 | Corpus snapshot is time-bounded; patterns may evolve as the product updates |
| L-009 | Volume shortfall: if 2,000 records cannot be reached from permitted sources, this is an honest documented limitation — not a gap to fill with invented data |

---

## Resolved Issues

(None yet — project is in planning phase)

| ID | Resolution date | Resolution description |
|---|---|---|
| (none) | | |
