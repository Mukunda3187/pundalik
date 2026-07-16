const RASHIS = [
  { name: 'Aries', sanskrit: 'Mesha', lord: 'Mars', element: 'Fire' },
  { name: 'Taurus', sanskrit: 'Vrishabha', lord: 'Venus', element: 'Earth' },
  { name: 'Gemini', sanskrit: 'Mithuna', lord: 'Mercury', element: 'Air' },
  { name: 'Cancer', sanskrit: 'Karka', lord: 'Moon', element: 'Water' },
  { name: 'Leo', sanskrit: 'Simha', lord: 'Sun', element: 'Fire' },
  { name: 'Virgo', sanskrit: 'Kanya', lord: 'Mercury', element: 'Earth' },
  { name: 'Libra', sanskrit: 'Tula', lord: 'Venus', element: 'Air' },
  { name: 'Scorpio', sanskrit: 'Vrishchika', lord: 'Mars', element: 'Water' },
  { name: 'Sagittarius', sanskrit: 'Dhanu', lord: 'Jupiter', element: 'Fire' },
  { name: 'Capricorn', sanskrit: 'Makara', lord: 'Saturn', element: 'Earth' },
  { name: 'Aquarius', sanskrit: 'Kumbha', lord: 'Saturn', element: 'Air' },
  { name: 'Pisces', sanskrit: 'Meena', lord: 'Jupiter', element: 'Water' },
];

const GANA_TO_GUNA = { Deva: 'Sattva', Manushya: 'Rajas', Rakshasa: 'Tamas' };

// 27 Nakshatras, each spanning 13°20' (13.3333 degrees), in zodiacal order
const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu', gana: 'Deva', yoni: 'Horse', nadi: 'Aadi' },
  { name: 'Bharani', lord: 'Venus', gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya' },
  { name: 'Krittika', lord: 'Sun', gana: 'Rakshasa', yoni: 'Goat', nadi: 'Antya' },
  { name: 'Rohini', lord: 'Moon', gana: 'Manushya', yoni: 'Serpent', nadi: 'Aadi' },
  { name: 'Mrigashira', lord: 'Mars', gana: 'Deva', yoni: 'Serpent', nadi: 'Madhya' },
  { name: 'Ardra', lord: 'Rahu', gana: 'Manushya', yoni: 'Dog', nadi: 'Antya' },
  { name: 'Punarvasu', lord: 'Jupiter', gana: 'Deva', yoni: 'Cat', nadi: 'Aadi' },
  { name: 'Pushya', lord: 'Saturn', gana: 'Deva', yoni: 'Goat', nadi: 'Madhya' },
  { name: 'Ashlesha', lord: 'Mercury', gana: 'Rakshasa', yoni: 'Cat', nadi: 'Antya' },
  { name: 'Magha', lord: 'Ketu', gana: 'Rakshasa', yoni: 'Rat', nadi: 'Aadi' },
  { name: 'Purva Phalguni', lord: 'Venus', gana: 'Manushya', yoni: 'Rat', nadi: 'Madhya' },
  { name: 'Uttara Phalguni', lord: 'Sun', gana: 'Manushya', yoni: 'Cow', nadi: 'Antya' },
  { name: 'Hasta', lord: 'Moon', gana: 'Deva', yoni: 'Buffalo', nadi: 'Aadi' },
  { name: 'Chitra', lord: 'Mars', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Madhya' },
  { name: 'Swati', lord: 'Rahu', gana: 'Deva', yoni: 'Buffalo', nadi: 'Antya' },
  { name: 'Vishakha', lord: 'Jupiter', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Aadi' },
  { name: 'Anuradha', lord: 'Saturn', gana: 'Deva', yoni: 'Deer', nadi: 'Madhya' },
  { name: 'Jyeshtha', lord: 'Mercury', gana: 'Rakshasa', yoni: 'Deer', nadi: 'Antya' },
  { name: 'Mula', lord: 'Ketu', gana: 'Rakshasa', yoni: 'Dog', nadi: 'Aadi' },
  { name: 'Purva Ashadha', lord: 'Venus', gana: 'Manushya', yoni: 'Monkey', nadi: 'Madhya' },
  { name: 'Uttara Ashadha', lord: 'Sun', gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya' },
  { name: 'Shravana', lord: 'Moon', gana: 'Deva', yoni: 'Monkey', nadi: 'Aadi' },
  { name: 'Dhanishta', lord: 'Mars', gana: 'Rakshasa', yoni: 'Lion', nadi: 'Madhya' },
  { name: 'Shatabhisha', lord: 'Rahu', gana: 'Rakshasa', yoni: 'Horse', nadi: 'Antya' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter', gana: 'Manushya', yoni: 'Lion', nadi: 'Aadi' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn', gana: 'Manushya', yoni: 'Cow', nadi: 'Madhya' },
  { name: 'Revati', lord: 'Mercury', gana: 'Deva', yoni: 'Elephant', nadi: 'Antya' },
];

const VARNA_BY_RASHI = {
  Cancer: 'Brahmin', Scorpio: 'Brahmin', Pisces: 'Brahmin',
  Aries: 'Kshatriya', Leo: 'Kshatriya', Sagittarius: 'Kshatriya',
  Taurus: 'Vaishya', Virgo: 'Vaishya', Capricorn: 'Vaishya',
  Gemini: 'Shudra', Libra: 'Shudra', Aquarius: 'Shudra',
};

const VASHYA_BY_RASHI = {
  Aries: 'Chatushpada', Taurus: 'Chatushpada',
  Gemini: 'Manav', Virgo: 'Manav', Libra: 'Manav', Aquarius: 'Manav',
  Cancer: 'Jalachar', Pisces: 'Jalachar',
  Leo: 'Vanachar',
  Scorpio: 'Keeta',
  Sagittarius: 'Chatushpada/Manav (dual)',
  Capricorn: 'Chatushpada/Manav (dual)',
};

const FRIENDSHIP = {
  Sun: { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'], neutral: ['Mercury'] },
  Moon: { friends: ['Sun', 'Mercury'], enemies: [], neutral: ['Mars', 'Jupiter', 'Venus', 'Saturn'] },
  Mars: { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'], neutral: ['Venus', 'Saturn'] },
  Mercury: { friends: ['Sun', 'Venus'], enemies: ['Moon'], neutral: ['Mars', 'Jupiter', 'Saturn'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'], neutral: ['Saturn'] },
  Venus: { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'], neutral: ['Mars', 'Jupiter'] },
  Saturn: { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'], neutral: ['Jupiter'] },
};

const ZODIAC_SYMBOL = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

module.exports = {
  RASHIS,
  NAKSHATRAS,
  VARNA_BY_RASHI,
  VASHYA_BY_RASHI,
  FRIENDSHIP,
  ZODIAC_SYMBOL,
  GANA_TO_GUNA,
};
