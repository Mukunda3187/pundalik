import { useState } from 'react';

const DEFAULT_TABS = [
  { key: 'personality', label: 'Personality' },
  { key: 'love', label: 'Love Life' },
  { key: 'career', label: 'Career' },
  { key: 'success', label: 'Success' },
  { key: 'summary', label: 'Summary' },
];

export default function ReadingTabs({ reading, tabs = DEFAULT_TABS }) {
  const TABS = tabs;
  const [active, setActive] = useState(TABS[0].key);
  if (!reading) return null;
  return (
    <div>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`tab-btn ${active === t.key ? 'active' : ''}`}
            onClick={() => setActive(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="panel" style={{ padding: '1.6rem 1.8rem' }}>
        {String(reading[active] || '').split('\n').filter(Boolean).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
