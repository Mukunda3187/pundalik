export default function CosmicProfileTable({ profile }) {
  const { chart, numerology } = profile;
  const rows = [
    ['Zodiac (Western)', chart.westernZodiac, 'Rashi (Moon)', `${chart.moonSign} (${chart.moonSignSanskrit})`],
    ['Nakshatra', `${chart.moonNakshatra.name} (Pada ${chart.moonNakshatra.pada})`, 'Lagna (Ascendant)', `${chart.ascendant.sign} (${chart.ascendant.signSanskrit})`],
    ['Ruling Planet', chart.rulingPlanet, 'Element / Tattva', chart.ascendant.element],
    ['Guna', chart.guna, 'Mulank', numerology.mulank],
    ['Bhagyank', numerology.bhagyank, '', ''],
  ];
  return (
    <div className="panel reading-card">
      <h4>Cosmic Profile</h4>
      <div className="cosmic-table">
        {rows.map(([k1, v1, k2, v2], i) => (
          <div className="cosmic-row" key={i}>
            <span className="cosmic-key">{k1}</span>
            <span className="cosmic-val">{v1}</span>
            {k2 && <span className="cosmic-key">{k2}</span>}
            {k2 && <span className="cosmic-val">{v2}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
