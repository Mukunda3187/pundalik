const { buildChart } = require('./ephemeris');
const { computeNumerology } = require('./numerology');

/**
 * @param {object} input
 * @param {string} input.name
 * @param {number} input.day
 * @param {number} input.month
 * @param {number} input.year
 * @param {number} input.hour - 24h local hour
 * @param {number} input.minute
 * @param {number} input.tzOffsetHours - e.g. 5.5 for IST
 * @param {number} input.latitude
 * @param {number} input.longitude
 * @param {string} input.placeName
 */
function buildProfile(input) {
  const { name, day, month, year, hour, minute, tzOffsetHours, latitude, longitude, placeName } = input;

  // Convert local civil time to UTC
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  utcDate.setTime(utcDate.getTime() - tzOffsetHours * 3600 * 1000);

  const chart = buildChart(utcDate, latitude, longitude);
  const numerology = computeNumerology(day, month, year);

  return {
    name,
    birth: { day, month, year, hour, minute, tzOffsetHours, latitude, longitude, placeName },
    numerology,
    chart,
  };
}

module.exports = { buildProfile };
