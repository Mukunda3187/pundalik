const Astronomy = require('astronomy-engine');
const { RASHIS, NAKSHATRAS, GANA_TO_GUNA } = require('./vedicData');

const WESTERN_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;

function norm360(x) {
  let v = x % 360;
  if (v < 0) v += 360;
  return v;
}

/**
 * Lahiri (Chitrapaksha) ayanamsa approximation, accurate to well within
 * astrological tolerance (fractions of a degree) for any date 1800-2100.
 */
function lahiriAyanamsa(date) {
  const jd = julianDay(date);
  const yearsSinceJ2000 = (jd - 2451545.0) / 365.25;
  // Reference: Lahiri ayanamsa ~23.85333 deg at J2000.0, precessing ~50.2388475"/year
  return 23.85333 + (yearsSinceJ2000 * 50.2388475) / 3600;
}

function julianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Mean lunar node (Rahu) tropical longitude - standard low-order series,
 * accurate to about 0.1 degree, which is well within astrological tolerance.
 */
function meanLunarNodeLongitude(date) {
  const jd = julianDay(date);
  const T = (jd - 2451545.0) / 36525;
  const omega = 125.0445222 - 1934.1362608 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return norm360(omega);
}

/**
 * Obliquity of the ecliptic (mean), degrees.
 */
function meanObliquity(date) {
  const jd = julianDay(date);
  const T = (jd - 2451545.0) / 36525;
  const seconds = 21.448 - T * (46.815 + T * (0.00059 - T * 0.001813));
  return 23 + (26 + seconds / 60) / 60 - T * 0; // 23deg 26' 21.448" baseline, corrected above
}

/**
 * Compute the tropical Ascendant longitude (degrees) for a given UTC date/time
 * and geographic latitude/longitude.
 */
function tropicalAscendant(date, latitude, longitude) {
  const gastHours = Astronomy.SiderealTime(date); // Greenwich Apparent Sidereal Time, hours
  const lstHours = gastHours + longitude / 15;
  const ramc = norm360(lstHours * 15); // Right Ascension of the Meridian, degrees
  const eps = meanObliquity(date) * RAD;
  const ramcRad = ramc * RAD;
  const latRad = latitude * RAD;

  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(eps) + Math.tan(latRad) * Math.sin(eps);
  let asc = Math.atan2(y, x) * DEG;
  asc = norm360(asc);
  return asc;
}

const PLANET_BODIES = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mercury: 'Mercury',
  Venus: 'Venus',
  Mars: 'Mars',
  Jupiter: 'Jupiter',
  Saturn: 'Saturn',
};

function tropicalLongitude(bodyName, date) {
  if (bodyName === 'Sun') {
    return Astronomy.SunPosition(date).elon;
  }
  const vec = Astronomy.GeoVector(Astronomy.Body[bodyName], date, true);
  const ecl = Astronomy.Ecliptic(vec);
  return norm360(ecl.elon);
}

function signIndexFromLongitude(lon) {
  return Math.floor(norm360(lon) / 30);
}

function nakshatraFromLongitude(siderealLon) {
  const span = 360 / 27; // 13.3333...
  const idx = Math.floor(norm360(siderealLon) / span);
  const posInNak = norm360(siderealLon) - idx * span;
  const pada = Math.floor(posInNak / (span / 4)) + 1;
  return { index: idx, pada, ...NAKSHATRAS[idx] };
}

/**
 * Build the full sidereal (Vedic) chart: ascendant, planets (incl. Rahu/Ketu),
 * their signs, houses (whole-sign system), retrograde flags, and nakshatras.
 *
 * @param {Date} utcDate - birth moment converted to UTC
 * @param {number} latitude
 * @param {number} longitude
 */
function buildChart(utcDate, latitude, longitude) {
  const ayanamsa = lahiriAyanamsa(utcDate);

  const tropicalSunLon = tropicalLongitude('Sun', utcDate);
  const westernZodiac = WESTERN_SIGNS[signIndexFromLongitude(tropicalSunLon)];

  const ascTropical = tropicalAscendant(utcDate, latitude, longitude);
  const ascSidereal = norm360(ascTropical - ayanamsa);
  const ascSignIdx = signIndexFromLongitude(ascSidereal);

  const bodies = {};
  for (const name of Object.keys(PLANET_BODIES)) {
    const tropicalLon = tropicalLongitude(name, utcDate);
    const siderealLon = norm360(tropicalLon - ayanamsa);
    bodies[name] = siderealLon;
  }

  // Mean lunar nodes
  const rahuTropical = meanLunarNodeLongitude(utcDate);
  const rahuSidereal = norm360(rahuTropical - ayanamsa);
  const ketuSidereal = norm360(rahuSidereal + 180);
  bodies.Rahu = rahuSidereal;
  bodies.Ketu = ketuSidereal;

  // crude retrograde check: compare longitude 1 day later for outer/inner planets
  const laterDate = new Date(utcDate.getTime() + 24 * 3600 * 1000);
  const retro = {};
  for (const name of Object.keys(PLANET_BODIES)) {
    if (name === 'Sun' || name === 'Moon') { retro[name] = false; continue; }
    const lonLater = tropicalLongitude(name, laterDate);
    const diff = norm360(lonLater - tropicalLongitude(name, utcDate));
    retro[name] = diff > 180; // moving backward in longitude
  }
  retro.Rahu = true;
  retro.Ketu = true;

  const planets = Object.entries(bodies).map(([name, lon]) => {
    const signIdx = signIndexFromLongitude(lon);
    const house = ((signIdx - ascSignIdx + 12) % 12) + 1;
    return {
      name,
      longitude: Number(lon.toFixed(2)),
      degreeInSign: Number((lon - signIdx * 30).toFixed(2)),
      sign: RASHIS[signIdx].name,
      signSanskrit: RASHIS[signIdx].sanskrit,
      signLord: RASHIS[signIdx].lord,
      element: RASHIS[signIdx].element,
      house,
      retrograde: !!retro[name],
      nakshatra: nakshatraFromLongitude(lon),
    };
  });

  const moon = planets.find((p) => p.name === 'Moon');

  return {
    ayanamsa: Number(ayanamsa.toFixed(4)),
    westernZodiac,
    ascendant: {
      longitude: Number(ascSidereal.toFixed(2)),
      sign: RASHIS[ascSignIdx].name,
      signSanskrit: RASHIS[ascSignIdx].sanskrit,
      element: RASHIS[ascSignIdx].element,
      signIndex: ascSignIdx,
      nakshatra: nakshatraFromLongitude(ascSidereal),
    },
    planets,
    moonSign: moon.sign,
    moonSignSanskrit: moon.signSanskrit,
    moonNakshatra: moon.nakshatra,
    guna: GANA_TO_GUNA[moon.nakshatra.gana],
    rulingPlanet: moon.nakshatra.lord,
  };
}

module.exports = { buildChart, lahiriAyanamsa, norm360 };
