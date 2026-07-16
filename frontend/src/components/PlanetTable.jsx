export default function PlanetTable({ chart }) {
  return (
    <div className="panel" style={{ padding: '0.5rem 1rem' }}>
      <table className="planet-table">
        <thead>
          <tr>
            <th>Planet</th>
            <th>Sign</th>
            <th>House</th>
            <th>Nakshatra</th>
            <th>Pada</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ascendant (Lagna)</td>
            <td>{chart.ascendant.sign}</td>
            <td>1</td>
            <td>{chart.ascendant.nakshatra.name}</td>
            <td>{chart.ascendant.nakshatra.pada}</td>
          </tr>
          {chart.planets.map((p) => (
            <tr key={p.name}>
              <td>{p.name}{p.retrograde && <span className="retro-tag"> ℞ retro</span>}</td>
              <td>{p.sign} ({p.degreeInSign.toFixed(1)}°)</td>
              <td>{p.house}</td>
              <td>{p.nakshatra.name}</td>
              <td>{p.nakshatra.pada}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
