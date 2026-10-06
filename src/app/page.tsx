export default function Home() {
  return (
    <main className="landing-container">
      <div className="landing-card">
        <div className="badge">
          <span className="badge-dot" />
          AI Discovery Engine
        </div>
        <h1 className="title">Finding Memory</h1>
        <p className="subtitle">
          “Researching how people retrieve visual information when memory is incomplete.”
        </p>
        <div className="status-container">
          <div className="status-pill">Phase 2: Real Evidence Vertical Slice</div>
          <p className="status-note">
            Evidence first. Interpretation second. Solution later.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <a
              href="/evidence"
              style={{
                display: 'inline-block',
                background: 'var(--accent-color)',
                color: '#ffffff',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              Explore Ingested Evidence (10 Records) →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
