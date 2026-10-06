# EXTERNAL_SERVICES — Finding Memory

**Version:** 1.0  
**Last updated:** 2026-10-06  
**Maintained by:** Agent + researcher; update when services are configured or terms change

---

## Format

Each service entry contains:
- **Service**: name
- **Purpose**: what it does for this project
- **Phase**: when it is needed
- **Classification**: NEEDED NOW / NEEDED NEXT / NEEDED LATER / OPTIONAL / NOT REQUIRED
- **Free tier**: what's available
- **Account required**: yes / no
- **Credential required**: what env var(s)
- **Configured**: status
- **Data sent**: what this project sends to the service
- **Privacy notes**: data-use considerations
- **Limits**: relevant free-tier limits
- **Alternative**: what happens if this service is unavailable
- **Status**: ENABLED / CONDITIONAL / NOT CONFIGURED / UNAVAILABLE / OPTIONAL

---

## Core Infrastructure Services

---

### GitHub

| Field | Value |
|---|---|
| Service | GitHub |
| Purpose | Source control; GitHub Actions for CI and scheduled collection |
| Phase | Phase 0 |
| Classification | NEEDED NOW |
| Free tier | Free tier includes private repos and 2,000 CI minutes/month |
| Account required | YES — one account per researcher |
| Credential required | None (SSH key or HTTPS auth for push; managed locally) |
| Configured | NOT CONFIGURED — repo not yet created |
| Data sent | Source code, workflow definitions. No secrets, no evidence data, no research corpus. |
| Privacy notes | Source code only. Evidence data and raw corpus must not be committed to the repository. |
| Limits | 2,000 Actions minutes/month on free plan; 500MB storage |
| Alternative | GitLab (similar free tier); Bitbucket |
| Status | NOT CONFIGURED |

---

### Supabase

| Field | Value |
|---|---|
| Service | Supabase |
| Purpose | PostgreSQL database + pgvector; stores all evidence, analysis, embeddings, clusters, annotations |
| Phase | Phase 1 |
| Classification | NEEDED NEXT |
| Free tier | Free Hobby plan: 500MB database, 50,000 monthly active users, 500MB file storage, 2 projects, 1-week log retention |
| Account required | YES |
| Credential required | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY |
| Configured | NOT CONFIGURED |
| Data sent | Structured research evidence (anonymized/minimized PII), AI analysis, embeddings. Public evidence excerpts. |
| Privacy notes | Service role key must remain server-side. RLS must be enabled. Do not store PII beyond what is required for research. Supabase data residency: choose region near researcher. Supabase terms: https://supabase.com/privacy |
| Limits | 500MB database (free); 2 projects max; pgvector supported on all plans |
| Alternative | Neon (PostgreSQL free tier + pgvector); PlanetScale (MySQL, no vector); self-hosted PostgreSQL |
| Status | NOT CONFIGURED |

---

### Vercel

| Field | Value |
|---|---|
| Service | Vercel |
| Purpose | Next.js application hosting (frontend + API routes) |
| Phase | Phase 9 |
| Classification | NEEDED LATER |
| Free tier | Hobby plan: unlimited deployments, 100GB bandwidth/month, 100,000 serverless function invocations/month |
| Account required | YES |
| Credential required | Vercel account (configured in Vercel dashboard; no env var needed here) |
| Configured | NOT CONFIGURED |
| Data sent | Application code, build artifacts. Production environment variables (encrypted). No raw evidence exported. |
| Privacy notes | Application code deployed. Secrets configured as encrypted environment variables in Vercel. Do not use NEXT_PUBLIC_ prefix for secrets. Vercel privacy: https://vercel.com/legal/privacy-policy |
| Limits | Serverless function execution time: 10s (Hobby); consider for long pipeline operations |
| Alternative | Railway; Render; Netlify; self-hosted VPS |
| Status | NOT CONFIGURED |

---

## AI Services

---

### Google AI Studio / Gemini API

| Field | Value |
|---|---|
| Service | Google AI Studio (Gemini API) |
| Purpose | Runtime AI model for relevance classification, cue extraction, behaviour extraction, journey reconstruction, problem coding, clustering synthesis, RAG synthesis |
| Phase | Phase 4 |
| Classification | NEEDED LATER |
| Free tier | Yes — check current limits at https://ai.google.dev/pricing. As of 2026, Gemini 1.5 Flash: 1,500 requests/day, 1M tokens/min (free tier). |
| Account required | YES — Google account |
| Credential required | GEMINI_API_KEY |
| Configured | NOT CONFIGURED |
| Data sent | Public evidence text (reviews, forum posts, comments). SOURCE EXCERPTS ONLY — not full user libraries, not private data, not user-identifying information beyond what is in the public source. |
| Privacy notes | IMPORTANT: Verify current data-use policy at https://ai.google.dev/terms before sending data. Free tier policy must not authorize use of submitted data for model training without researcher consent. If terms are unclear: STOP and request a privacy decision. Public web evidence may be processed when permitted. Private materials (diary studies, interviews, unpublished research) must never be sent to AI APIs. |
| Limits | Free tier rate limits apply; monitor usage. At 2,000+ records with multiple analysis stages, rate limits may require batching with delays. |
| Alternative | Claude Sonnet via Anthropic API (paid); OpenAI GPT-4 (paid). Switching requires formal ARCHITECTURE CHANGE REQUEST. |
| Status | NOT CONFIGURED |

---

### Gemini Embedding Model

| Field | Value |
|---|---|
| Service | Gemini text-embedding model (same API key as above) |
| Purpose | Dedicated vector embedding generation for evidence_embeddings |
| Phase | Phase 7 |
| Classification | NEEDED LATER |
| Free tier | Same as Gemini API above |
| Account required | Shared with GEMINI_API_KEY |
| Credential required | GEMINI_API_KEY (same key) |
| Configured | NOT CONFIGURED |
| Data sent | Same as Gemini API above (evidence text only) |
| Privacy notes | Same as Gemini API above |
| Limits | Embedding generation rate limits apply |
| Alternative | OpenAI text-embedding-3-small (paid); open-source embedding models (self-hosted) |
| Status | NOT CONFIGURED |

---

## Data Source Services

---

### YouTube Data API v3

| Field | Value |
|---|---|
| Service | YouTube Data API v3 |
| Purpose | Collect comments from Google Photos tutorial/review videos |
| Phase | Phase 12 |
| Classification | NEEDED LATER |
| Free tier | 10,000 units/day free quota. CommentThreads.list: 1 unit per call; Comments.list: 1 unit per call. |
| Account required | YES — Google account with Google Cloud project |
| Credential required | YOUTUBE_API_KEY |
| Configured | NOT CONFIGURED |
| Data sent | Video IDs, page tokens for pagination. No user data sent. |
| Privacy notes | YouTube API Terms: https://developers.google.com/youtube/terms/api-services-terms-of-service. Comments are public. Do not store commenter personal identifiers beyond what is necessary. |
| Limits | 10,000 units/day; batch carefully. Full comment set may require multiple pages. |
| Alternative | Manual import of specific comment threads |
| Status | NOT CONFIGURED |

---

### Reddit API (Research Access)

| Field | Value |
|---|---|
| Service | Reddit API |
| Purpose | Collect posts and comments from r/googlephotos and related communities |
| Phase | Phase 12 |
| Classification | CONDITIONAL |
| Free tier | Research access terms are separate from standard developer access |
| Account required | YES — Reddit account + approved research access |
| Credential required | REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT |
| Configured | DISABLED — awaiting approval |
| Data sent | Subreddit names, post IDs, query terms for research-relevant posts |
| Privacy notes | Reddit's Responsible Builder Policy [Y4–Y5] governs research access. AI processing and redistribution restrictions apply. Raw Reddit content must not be exposed in public RAG responses; researcher-only excerpts only. Check current policy at: https://www.reddit.com/wiki/api. Recheck at time of collection. |
| Limits | Research access rate limits TBD at approval time |
| Alternative | Manual import of publicly visible threads (limited; not scalable) |
| Status | CONDITIONAL — requires written approval |

---

### Apify

| Field | Value |
|---|---|
| Service | Apify |
| Purpose | Optional: compliant collection of Google Play Store and Apple App Store reviews via public-facing actors |
| Phase | Phase 12 |
| Classification | OPTIONAL |
| Free tier | $5 free credits per month on Apify free plan |
| Account required | YES |
| Credential required | APIFY_API_TOKEN |
| Configured | NOT CONFIGURED |
| Data sent | Actor input configuration (app package IDs, date ranges, locale). No user data sent. |
| Privacy notes | Apify actors collect from public app store listing pages. Verify applicable actor's terms and source terms before use. Only use actors that operate within public data access rules. |
| Limits | $5 credit/month (free); usage-based beyond that |
| Alternative | Manual import; direct public RSS feeds where available |
| Status | OPTIONAL — user decision required (see USER_ACTIONS.md U-008) |

---

## Optional Services

---

### Google Docs MCP Server

| Field | Value |
|---|---|
| Service | Google Docs via MCP (Model Context Protocol) |
| Purpose | Optional: export research reports from the Finding Memory application directly to a researcher-specified Google Docs document |
| Phase | Phase 11 (optional) |
| Classification | OPTIONAL |
| Free tier | No additional cost beyond existing Google account |
| Account required | YES — Google account with Docs access |
| Credential required | MCP_SERVER_URL (server address); Google OAuth token (managed by MCP server) |
| Configured | NOT CONFIGURED |
| Data sent | Structured research report content: findings, statistics, citations, limitations. No full raw corpus exported. |
| Privacy notes | MCP server permissions must be read-only for Docs except for the target document. Do not grant write access to unrelated documents. No email or Gmail access granted. |
| Limits | Google Docs document size limits (standard); rate limits on the MCP server |
| Alternative | Manual report copy-paste; CSV/JSON export from the application |
| Status | OPTIONAL — user decision required (see USER_ACTIONS.md U-010) |

---

### Render (Optional Python Service)

| Field | Value |
|---|---|
| Service | Render |
| Purpose | Optional: deploy a Python microservice if any processing step requires Python-specific libraries unavailable in Node.js |
| Phase | Phase 12+ (only if needed) |
| Classification | OPTIONAL |
| Free tier | Free tier available (with cold starts) |
| Account required | YES |
| Credential required | RENDER_SERVICE_URL (internal service URL) |
| Configured | NOT CONFIGURED |
| Data sent | Evidence records submitted for processing; analysis results returned |
| Privacy notes | Same as Gemini API (evidence text only; no user PII beyond source content) |
| Limits | Free tier has cold-start delay; not suitable for latency-sensitive synchronous calls |
| Alternative | Implement equivalent logic in TypeScript/Node.js |
| Status | NOT REQUIRED unless specific Python processing need is demonstrated |

---

## Services Explicitly Excluded

| Service | Reason |
|---|---|
| Gmail / Google Mail API | Permanently out of scope (docs/ProblemStatement_Finding_Memory.txt §D) |
| Blockchain / NFT / Crypto services | Permanently out of scope |
| Pinecone / Weaviate / Qdrant | Replaced by pgvector in Supabase (D-002); add only via ARCHITECTURE CHANGE REQUEST |
| Firebase | No demonstrated need; Supabase chosen |
| OpenAI | Replaced by Gemini (D-001); add only via ARCHITECTURE CHANGE REQUEST |
| Anthropic Claude (runtime) | Replaced by Gemini (D-001); exception: used as Antigravity development model — not runtime |
| AWS / Azure / GCP managed services | No demonstrated need; free-first architecture |

---

## Service Update Log

| Date | Service | Change | Reason |
|---|---|---|---|
| 2026-10-06 | All | Initial documentation | Planning phase |
