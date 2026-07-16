export default function GunaMilanBreakdown({ guna }) {
  return (
    <div className="panel" style={{ padding: '1.8rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '0.3rem' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--gold-soft)' }}>
          {guna.total}
        </span>
        <span className="muted">/ {guna.maxTotal} guna points</span>
      </div>
      <div className="eyebrow" style={{ marginBottom: '1.4rem' }}>{guna.verdict}</div>

      {guna.factors.map((f) => (
        <div className="guna-row" key={f.label}>
          <span>{f.label}</span>
          <div className="guna-bar-track">
            <div className="guna-bar-fill" style={{ width: `${(f.score / f.max) * 100}%` }} />
          </div>
          <span className="muted" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            {f.score}/{f.max}
          </span>
        </div>
      ))}

      {(guna.doshas.nadiDosha || guna.doshas.bhakootDosha) && (
        <p className="muted" style={{ marginTop: '1.2rem', fontSize: '0.85rem' }}>
          {guna.doshas.nadiDosha && 'Nadi Dosha present. '}
          {guna.doshas.bhakootDosha && 'Bhakoot Dosha present. '}
          Traditionally these call for closer review — many astrologers weigh other chart factors
          alongside them rather than treating them as automatic disqualifiers.
        </p>
      )}
    </div>
  );
}
