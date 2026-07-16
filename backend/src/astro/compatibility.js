const { RASHIS, NAKSHATRAS, VARNA_BY_RASHI, VASHYA_BY_RASHI, FRIENDSHIP } = require('./vedicData');

function signIndexFromLongitude(lon) {
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}
function nakIndexFromLongitude(lon) {
  const span = 360 / 27;
  return Math.floor(((lon % 360) + 360) % 360 / span);
}

// --- Individual koota (factor) scorers ---

function varnaScore(girlSign, boySign) {
  const order = ['Shudra', 'Vaishya', 'Kshatriya', 'Brahmin'];
  const g = order.indexOf(VARNA_BY_RASHI[girlSign]);
  const b = order.indexOf(VARNA_BY_RASHI[boySign]);
  // full point if boy's varna >= girl's varna (traditional rule), else 0
  const score = b >= g ? 1 : 0;
  return { score, max: 1, label: 'Varna (spiritual compatibility)' };
}

function vashyaScore(girlSign, boySign) {
  const g = VASHYA_BY_RASHI[girlSign];
  const b = VASHYA_BY_RASHI[boySign];
  let score = 0.5;
  if (g === b) score = 2;
  else if (
    (g === 'Manav' && b === 'Chatushpada') || (b === 'Manav' && g === 'Chatushpada') ||
    (g === 'Jalachar' && b === 'Manav') || (b === 'Jalachar' && g === 'Manav')
  ) score = 1;
  return { score, max: 2, label: 'Vashya (mutual influence)' };
}

function taraScore(girlNakIdx, boyNakIdx) {
  const countForward = ((boyNakIdx - girlNakIdx + 27) % 27) + 1;
  const countBackward = ((girlNakIdx - boyNakIdx + 27) % 27) + 1;
  const badRemainders = [3, 5, 7, 0]; // Vipat, Pratyak, Vadha (mod 9 groups, 1-indexed groups of 3)
  const goodA = badRemainders.includes(countForward % 9) ? 0 : 1.5;
  const goodB = badRemainders.includes(countBackward % 9) ? 0 : 1.5;
  return { score: goodA + goodB, max: 3, label: 'Tara (birth-star fortune)' };
}

function yoniScore(girlNakIdx, boyNakIdx) {
  const g = NAKSHATRAS[girlNakIdx].yoni;
  const b = NAKSHATRAS[boyNakIdx].yoni;
  const enemyPairs = [
    ['Cow', 'Tiger'], ['Horse', 'Buffalo'], ['Dog', 'Deer'], ['Serpent', 'Mongoose'],
    ['Cat', 'Rat'], ['Lion', 'Elephant'], ['Monkey', 'Goat'],
  ];
  let score = 3;
  if (g === b) score = 4;
  else {
    const isEnemy = enemyPairs.some(([a, c]) => (a === g && c === b) || (a === b && c === g));
    score = isEnemy ? 0 : 3;
  }
  return { score, max: 4, label: 'Yoni (physical & intimate compatibility)' };
}

function grahaMaitriScore(girlSignLord, boySignLord) {
  if (girlSignLord === boySignLord) return { score: 5, max: 5, label: 'Graha Maitri (planetary friendship)' };
  const gFriendly = FRIENDSHIP[girlSignLord]?.friends.includes(boySignLord);
  const bFriendly = FRIENDSHIP[boySignLord]?.friends.includes(girlSignLord);
  const gEnemy = FRIENDSHIP[girlSignLord]?.enemies.includes(boySignLord);
  const bEnemy = FRIENDSHIP[boySignLord]?.enemies.includes(girlSignLord);
  let score;
  if (gFriendly && bFriendly) score = 4;
  else if ((gFriendly && !bEnemy) || (bFriendly && !gEnemy)) score = 3;
  else if (!gEnemy && !bEnemy) score = 2;
  else if (gEnemy && bEnemy) score = 0;
  else score = 1;
  return { score, max: 5, label: 'Graha Maitri (planetary friendship)' };
}

function ganaScore(girlNakIdx, boyNakIdx) {
  const g = NAKSHATRAS[girlNakIdx].gana;
  const b = NAKSHATRAS[boyNakIdx].gana;
  let score;
  if (g === b) score = 6;
  else if ((g === 'Deva' && b === 'Manushya') || (b === 'Deva' && g === 'Manushya')) score = 5;
  else if (g === 'Deva' && b === 'Rakshasa') score = 1;
  else if (b === 'Deva' && g === 'Rakshasa') score = 0;
  else score = 3; // Manushya-Rakshasa mix
  return { score, max: 6, label: 'Gana (temperament)' };
}

function bhakootScore(girlSignIdx, boySignIdx) {
  const dist1 = ((boySignIdx - girlSignIdx + 12) % 12) + 1;
  const dist2 = ((girlSignIdx - boySignIdx + 12) % 12) + 1;
  const doshaPairs = [2, 12, 5, 9, 6, 8];
  const hasDosha = doshaPairs.includes(dist1) || doshaPairs.includes(dist2);
  return { score: hasDosha ? 0 : 7, max: 7, label: 'Bhakoot (overall life & prosperity)' };
}

function nadiScore(girlNakIdx, boyNakIdx) {
  const g = NAKSHATRAS[girlNakIdx].nadi;
  const b = NAKSHATRAS[boyNakIdx].nadi;
  return { score: g === b ? 0 : 8, max: 8, label: 'Nadi (health & progeny)' };
}

/**
 * Full Ashtakoot Guna Milan between two sidereal Moon positions.
 * @param {number} girlMoonLon - sidereal Moon longitude, degrees
 * @param {number} boyMoonLon - sidereal Moon longitude, degrees
 */
function gunaMilan(girlMoonLon, boyMoonLon) {
  const girlSignIdx = signIndexFromLongitude(girlMoonLon);
  const boySignIdx = signIndexFromLongitude(boyMoonLon);
  const girlNakIdx = nakIndexFromLongitude(girlMoonLon);
  const boyNakIdx = nakIndexFromLongitude(boyMoonLon);
  const girlSign = RASHIS[girlSignIdx].name;
  const boySign = RASHIS[boySignIdx].name;
  const girlLord = RASHIS[girlSignIdx].lord;
  const boyLord = RASHIS[boySignIdx].lord;

  const factors = [
    varnaScore(girlSign, boySign),
    vashyaScore(girlSign, boySign),
    taraScore(girlNakIdx, boyNakIdx),
    yoniScore(girlNakIdx, boyNakIdx),
    grahaMaitriScore(girlLord, boyLord),
    ganaScore(girlNakIdx, boyNakIdx),
    bhakootScore(girlSignIdx, boySignIdx),
    nadiScore(girlNakIdx, boyNakIdx),
  ];

  const total = factors.reduce((s, f) => s + f.score, 0);
  const maxTotal = factors.reduce((s, f) => s + f.max, 0); // 36

  let verdict;
  if (total >= 28) verdict = 'Excellent match';
  else if (total >= 21) verdict = 'Good / favorable match';
  else if (total >= 18) verdict = 'Average — workable with effort';
  else verdict = 'Challenging — significant differences to navigate';

  const nadiDosha = factors[7].score === 0;
  const bhakootDosha = factors[6].score === 0;

  return {
    factors,
    total: Number(total.toFixed(1)),
    maxTotal,
    verdict,
    doshas: { nadiDosha, bhakootDosha },
    girl: { sign: girlSign, nakshatra: NAKSHATRAS[girlNakIdx].name },
    boy: { sign: boySign, nakshatra: NAKSHATRAS[boyNakIdx].name },
  };
}

module.exports = { gunaMilan };
