import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KundliChart from '../components/KundliChart.jsx';
import PlanetTable from '../components/PlanetTable.jsx';
import CardSection from '../components/CardSection.jsx';
import TagList from '../components/TagList.jsx';
import CosmicProfileTable from '../components/CosmicProfileTable.jsx';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'kundli', label: 'Kundli' },
  { key: 'love', label: 'Love' },
  { key: 'career', label: 'Career' },
  { key: 'wealth', label: 'Wealth' },
  { key: 'health', label: 'Health' },
  { key: 'remedies', label: 'Remedies' },
];

function formatBirthLine(birth) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  const hh = String(birth.hour).padStart(2, '0');
  const mm = String(birth.minute).padStart(2, '0');
  return `${birth.day} ${months[birth.month - 1]} ${birth.year} · ${hh}:${mm} · ${birth.placeName || `${birth.latitude.toFixed(2)}, ${birth.longitude.toFixed(2)}`}`;
}

export default function ChartResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');

  if (!state) {
    return (
      <div className="page container">
        <p>No chart data found. Please fill in your birth details first.</p>
        <button className="btn-secondary" onClick={() => navigate('/')}>Back to form</button>
      </div>
    );
  }

  const { profile, reading, readingError } = state;
  const { chart, numerology, name, birth } = profile;

  return (
    <div className="page">
      <div className="container">
        <div className="result-title-block">
          <h1 style={{ fontSize: '2rem' }}>{name}</h1>
          <p className="muted" style={{ marginTop: '0.3rem' }}>{formatBirthLine(birth)}</p>
        </div>

        <div className="stats-row">
          <div className="stat"><span className="stat-label">Mulank</span><span className="stat-value">{numerology.mulank}</span></div>
          <div className="stat"><span className="stat-label">Bhagyank</span><span className="stat-value">{numerology.bhagyank}</span></div>
          <div className="stat"><span className="stat-label">Rashi</span><span className="stat-value-sm">{chart.moonSign} ({chart.moonSignSanskrit})</span></div>
          <div className="stat"><span className="stat-label">Lagna</span><span className="stat-value-sm">{chart.ascendant.sign} ({chart.ascendant.signSanskrit})</span></div>
          <div className="stat"><span className="stat-label">Nakshatra</span><span className="stat-value-sm">{chart.moonNakshatra.name}</span></div>
        </div>

        <div className="tabs" style={{ marginTop: '2rem' }}>
          {TABS.map((t) => (
            <button key={t.key} className={`tab-btn ${active === t.key ? 'active' : ''}`}
              onClick={() => setActive(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {!reading && readingError && (
          <div className="error-box" style={{ marginBottom: '1.5rem' }}>
            Could not generate the AI reading: {readingError}. Check that GOOGLE_API_KEY is set
            correctly in the backend .env file. The chart data below was still computed correctly.
          </div>
        )}

        <div className="reading-stack">
          {active === 'overview' && (
            <>
              <CosmicProfileTable profile={profile} />
              {reading && <CardSection title={`Mulank ${numerology.mulank} — Root Number`} content={reading.mulankInsight} />}
              {reading && <CardSection title={`Bhagyank ${numerology.bhagyank} — Destiny Number`} content={reading.bhagyankInsight} />}
              {reading && <CardSection title="Personality" content={reading.personality} />}
            </>
          )}

          {active === 'kundli' && (
            <>
              <div className="panel reading-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h4 style={{ alignSelf: 'flex-start' }}>Birth Chart (Kundli)</h4>
                <KundliChart ascendantSignIndex={chart.ascendant.signIndex} planets={chart.planets} centerSubtitle={name} />
              </div>
              <PlanetTable chart={chart} />
            </>
          )}

          {active === 'love' && reading?.love?.map((c) => <CardSection key={c.title} {...c} />)}

          {active === 'career' && reading?.career && (
            <>
              <CardSection title="Career & Profession" content={reading.career.overview} />
              <div className="panel reading-card">
                <h4>Best Fields</h4>
                <TagList tags={reading.career.bestFields} />
              </div>
              {reading.career.cards?.map((c) => <CardSection key={c.title} {...c} />)}
            </>
          )}

          {active === 'wealth' && reading?.wealth?.map((c) => <CardSection key={c.title} {...c} />)}
          {active === 'health' && reading?.health?.map((c) => <CardSection key={c.title} {...c} />)}
          {active === 'remedies' && reading?.remedies?.map((c) => <CardSection key={c.title} {...c} />)}

          {active !== 'overview' && active !== 'kundli' && !reading && (
            <p className="muted">The AI reading isn't available — see the note above.</p>
          )}
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/')}>New chart</button>
        </div>
      </div>
    </div>
  );
}
