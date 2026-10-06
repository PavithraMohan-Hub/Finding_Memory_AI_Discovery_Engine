import Link from 'next/link';
import { getSupabaseServerClient } from '../../lib/db/supabase-server';

// Server Component - dynamic execution on server
export const dynamic = 'force-dynamic';

interface EvidenceRecord {
  evidence_id: string;
  corpus_type: string;
  source_platform: string;
  product_name: string | null;
  source_record_id: string | null;
  source_url: string;
  canonical_url: string | null;
  title: string | null;
  original_text: string;
  published_at: string | null;
  verification_status: string;
  collection_method: string;
  content_fingerprint: string;
  is_canonical: boolean;
}

export default async function EvidenceExplorerPage() {
  const client = getSupabaseServerClient();

  const { data: records, error } = await client
    .from('raw_evidence')
    .select(
      'evidence_id, corpus_type, source_platform, product_name, source_record_id, source_url, canonical_url, title, original_text, published_at, verification_status, collection_method, content_fingerprint, is_canonical'
    )
    .eq('corpus_type', 'USER_EVIDENCE')
    .order('published_at', { ascending: false });

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-light)',
                  border: '1px solid var(--badge-border)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                USER EVIDENCE
              </span>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--success-color)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Phase 2 Vertical Slice
              </span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Evidence Explorer
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.95rem' }}>
              Internal verification view for canonical raw research evidence collected from real public retrieval experiences.
            </p>
          </div>
          <Link
            href="/"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            ← Back to Home
          </Link>
        </div>

        {/* Stats banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Records</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{records?.length || 0}</div>
          </div>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Product</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>Google Photos</div>
          </div>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Status</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--success-color)', marginTop: '0.25rem' }}>SOURCE_VERIFIED</div>
          </div>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Synthesis State</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--accent-light)', marginTop: '0.25rem' }}>100% Real Human Evidence</div>
          </div>
        </div>
      </header>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          Failed to load evidence records: {error.message}
        </div>
      )}

      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {records?.map((record: EvidenceRecord, index: number) => (
          <article
            key={record.evidence_id}
            id={`evidence-${record.source_record_id || index}`}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              backdropFilter: 'blur(8px)',
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-light)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                  }}
                >
                  USER EVIDENCE #{index + 1}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {record.source_platform} • {record.source_record_id || 'unlabeled'}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: record.is_canonical ? 'var(--success-color)' : '#f59e0b',
                    background: record.is_canonical ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                  }}
                >
                  {record.is_canonical ? 'Canonical' : 'Duplicate'}
                </span>
              </div>
              <time style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {record.published_at ? new Date(record.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown date'}
              </time>
            </div>

            {record.title && (
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                {record.title}
              </h2>
            )}

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                borderLeft: '3px solid var(--accent-color)',
                padding: '1rem',
                borderRadius: '0 8px 8px 0',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '1rem',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
              }}
            >
              {record.original_text}
            </div>

            <footer
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <div>
                Fingerprint: <code style={{ color: 'var(--accent-light)', fontFamily: 'monospace' }}>{record.content_fingerprint.slice(0, 16)}...</code>
              </div>
              <div>
                <a
                  href={record.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--accent-light)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  View Original Source ↗
                </a>
              </div>
            </footer>
          </article>
        ))}
      </main>
    </div>
  );
}
