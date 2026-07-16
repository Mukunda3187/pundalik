import { useMemo } from 'react';

const PLANET_ABBR = {
  Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury',
  Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn', Rahu: 'Rahu', Ketu: 'Ketu',
};

// Clockwise chart order starting top-left: 12,1,2,3 / 11,·,·,4 / 10,·,·,5 / 9,8,7,6
const GRID_LAYOUT = [
  [12, 1, 2, 3],
  [11, 'center', 'center', 4],
  [10, 'center', 'center', 5],
  [9, 8, 7, 6],
];

/**
 * @param {number} ascendantSignIndex - 0=Aries ... 11=Pisces
 * @param {Array} planets - [{ name, house, sign, retrograde }]
 * @param {string} centerTitle
 * @param {string} centerSubtitle
 */
export default function KundliChart({ ascendantSignIndex, planets = [], centerTitle = 'कुंडली', centerSubtitle }) {
  const planetsByHouse = useMemo(() => {
    const map = {};
    for (const p of planets) {
      if (!map[p.house]) map[p.house] = [];
      map[p.house].push(p);
    }
    return map;
  }, [planets]);

  const signForHouse = (houseNum) => (((ascendantSignIndex + houseNum - 1) % 12) + 1);

  let centerDrawn = false;

  return (
    <div className="kundli-grid">
      {GRID_LAYOUT.flat().map((cell, i) => {
        if (cell === 'center') {
          if (centerDrawn) return null;
          centerDrawn = true;
          return (
            <div key="center" className="kundli-cell kundli-center">
              <div className="kundli-center-title">{centerTitle}</div>
              {centerSubtitle && <div className="kundli-center-subtitle">{centerSubtitle}</div>}
            </div>
          );
        }
        const houseNum = cell;
        const occupants = planetsByHouse[houseNum] || [];
        const isAsc = houseNum === 1;
        return (
          <div key={i} className={`kundli-cell ${isAsc ? 'kundli-asc' : ''}`}>
            <span className="kundli-house-num">{houseNum}</span>
            <div className="kundli-occupants">
              {occupants.map((p) => (
                <div key={p.name} className={`kundli-planet ${p.retrograde ? 'retro' : ''}`}>
                  {PLANET_ABBR[p.name]}
                  {p.retrograde ? ' ℞' : ''}
                  {p.sign && <span className="kundli-planet-sign"> · {p.sign}</span>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
