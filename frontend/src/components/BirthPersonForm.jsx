import { useState, useRef } from 'react';
import { geocodePlace } from '../lib/api';

const TZ_PRESETS = [
  { label: 'IST (India) +5:30', value: 5.5 },
  { label: 'UTC +0:00', value: 0 },
  { label: 'US Eastern -5:00', value: -5 },
  { label: 'US Pacific -8:00', value: -8 },
  { label: 'UK +0:00 / +1:00 (BST)', value: 1 },
  { label: 'Gulf +4:00', value: 4 },
  { label: 'Singapore/HK +8:00', value: 8 },
  { label: 'Custom…', value: 'custom' },
];

export default function BirthPersonForm({ value, onChange, idPrefix = 'p' }) {
  const [placeQuery, setPlaceQuery] = useState(value.placeName || '');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [tzMode, setTzMode] = useState('preset');
  const debounceRef = useRef(null);

  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  function handlePlaceInput(q) {
    setPlaceQuery(q);
    set('placeName', q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (q.trim().length < 3) { setSuggestions([]); return; }
      setSearching(true);
      try {
        const results = await geocodePlace(q);
        setSuggestions(results);
      } finally {
        setSearching(false);
      }
    }, 450);
  }

  function pickSuggestion(s) {
    setPlaceQuery(s.label);
    setSuggestions([]);
    onChange({ ...value, placeName: s.label, latitude: s.latitude, longitude: s.longitude });
  }

  return (
    <div className="birth-form">
      <div className="field">
        <label htmlFor={`${idPrefix}-name`}>Full name</label>
        <input id={`${idPrefix}-name`} type="text" placeholder="e.g. Ananya Sharma"
          value={value.name || ''} onChange={(e) => set('name', e.target.value)} />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={`${idPrefix}-day`}>Day</label>
          <input id={`${idPrefix}-day`} type="number" min="1" max="31" placeholder="DD"
            value={value.day || ''} onChange={(e) => set('day', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-month`}>Month</label>
          <input id={`${idPrefix}-month`} type="number" min="1" max="12" placeholder="MM"
            value={value.month || ''} onChange={(e) => set('month', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-year`}>Year</label>
          <input id={`${idPrefix}-year`} type="number" min="1900" max="2100" placeholder="YYYY"
            value={value.year || ''} onChange={(e) => set('year', e.target.value)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={`${idPrefix}-hour`}>Birth hour (24h)</label>
          <input id={`${idPrefix}-hour`} type="number" min="0" max="23" placeholder="HH"
            value={value.hour ?? ''} onChange={(e) => set('hour', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-minute`}>Minute</label>
          <input id={`${idPrefix}-minute`} type="number" min="0" max="59" placeholder="MM"
            value={value.minute ?? ''} onChange={(e) => set('minute', e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-tz`}>Timezone at birth</label>
        <select id={`${idPrefix}-tz`} value={tzMode === 'custom' ? 'custom' : (value.tzOffsetHours ?? '')}
          onChange={(e) => {
            if (e.target.value === 'custom') { setTzMode('custom'); return; }
            setTzMode('preset');
            set('tzOffsetHours', Number(e.target.value));
          }}>
          <option value="" disabled>Select timezone…</option>
          {TZ_PRESETS.map((t) => (
            <option key={t.label} value={t.value}>{t.label}</option>
          ))}
        </select>
        {tzMode === 'custom' && (
          <input style={{ marginTop: '0.5rem' }} type="number" step="0.25" placeholder="Offset from UTC, e.g. 5.5"
            value={value.tzOffsetHours ?? ''} onChange={(e) => set('tzOffsetHours', Number(e.target.value))} />
        )}
      </div>

      <div className="field" style={{ position: 'relative' }}>
        <label htmlFor={`${idPrefix}-place`}>Birth place</label>
        <input id={`${idPrefix}-place`} type="text" placeholder="City, Country"
          value={placeQuery} onChange={(e) => handlePlaceInput(e.target.value)} autoComplete="off" />
        {searching && <div className="place-hint">Searching…</div>}
        {suggestions.length > 0 && (
          <ul className="place-suggestions">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => pickSuggestion(s)}>{s.label}</li>
            ))}
          </ul>
        )}
        {value.latitude && value.longitude && (
          <div className="place-hint">
            {Number(value.latitude).toFixed(3)}°, {Number(value.longitude).toFixed(3)}°
          </div>
        )}
      </div>
    </div>
  );
}
