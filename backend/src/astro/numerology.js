// Vedic numerology: Mulank (driver/root number) and Bhagyank (destiny number)

function digitSumToSingle(numStr) {
  let n = numStr
    .split('')
    .filter((c) => /[0-9]/.test(c))
    .reduce((sum, d) => sum + Number(d), 0);
  while (n > 9) {
    n = String(n)
      .split('')
      .reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
}

const MULANK_TRAITS = {
  1: { ruler: 'Sun', theme: 'Leadership, willpower, originality' },
  2: { ruler: 'Moon', theme: 'Sensitivity, cooperation, intuition' },
  3: { ruler: 'Jupiter', theme: 'Expression, optimism, growth' },
  4: { ruler: 'Rahu', theme: 'Discipline, structure, steady effort' },
  5: { ruler: 'Mercury', theme: 'Adaptability, communication, curiosity' },
  6: { ruler: 'Venus', theme: 'Harmony, beauty, responsibility' },
  7: { ruler: 'Ketu', theme: 'Introspection, wisdom, spirituality' },
  8: { ruler: 'Saturn', theme: 'Ambition, resilience, karma' },
  9: { ruler: 'Mars', theme: 'Courage, drive, humanitarianism' },
};

/**
 * @param {number} day - birth day (1-31)
 * @param {number} month - birth month (1-12)
 * @param {number} year - birth year (e.g. 1995)
 */
function computeNumerology(day, month, year) {
  const mulank = digitSumToSingle(String(day));
  const bhagyank = digitSumToSingle(`${day}${month}${year}`);
  return {
    mulank,
    bhagyank,
    mulankInfo: MULANK_TRAITS[mulank],
    bhagyankInfo: MULANK_TRAITS[bhagyank],
  };
}

module.exports = { computeNumerology, digitSumToSingle };
