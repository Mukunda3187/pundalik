const axios = require('axios');

// Google AI Studio / Gemini Developer API
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function callGemini(systemPrompt,, maxOutputTokens = 3000) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not set in the backend .env file');
  }

  let response;
  try {
    response = await axios.post(
      API_URL,
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          maxOutputTokens,
          temperature: 0.9,
          responseMimeType: 'application/json',
          // Gemini 2.5 models spend part of maxOutputTokens on internal "thinking" by
          // default, which was leaving too little room for the actual JSON answer and
          // truncating it. This task doesn't need deep reasoning, so we turn it off.
          thinkingConfig: { thinkingBudget: 0 },
        },
      },
      {
        headers: {
          'x-goog-api-key': apiKey,
          'content-type': 'application/json',
        },
        timeout: 60000,
      }
    );
  } catch (err) {
    if (err.response) {
      // Google puts the real reason in the response body - surface it instead of a bare status code
      const googleMessage = err.response.data?.error?.message || JSON.stringify(err.response.data);
      throw new Error(`Gemini API error (${err.response.status}): ${googleMessage}`);
    }
    throw err;
  }

  const candidate = response.data.candidates && response.data.candidates[0];
  if (!candidate) {
    throw new Error('Gemini returned no candidates: ' + JSON.stringify(response.data).slice(0, 300));
  }
  if (candidate.finishReason === 'MAX_TOKENS') {
    throw new Error('Gemini response was cut off (MAX_TOKENS) — try raising maxOutputTokens');
  }

  const parts = (candidate.content && candidate.content.parts) || [];
  const text = parts.map((p) => p.text || '').join('\n').trim();
  if (!text) {
    throw new Error('Gemini returned an empty response: ' + JSON.stringify(response.data).slice(0, 300));
  }
  return text;
}

const READING_SYSTEM_PROMPT = `You are Pundalik, a warm and insightful Vedic astrologer and numerologist.
You are given precomputed, accurate chart facts (numerology numbers, ascendant, planetary
sign/house/nakshatra placements, ruling planet, guna). Do NOT invent or contradict these facts —
only interpret them. Write in clear, engaging, encouraging language for a general audience. Avoid
superstition-mongering, avoid absolute predictions about death/disease/misfortune, and note that
astrology is a lens for reflection, not a deterministic guarantee. Each "content" field should be
2-4 sentences. Respond ONLY with a JSON object (no markdown fences, no preamble) matching this
exact shape:
{
  "personality": "2-3 sentence overview of core personality, blending numerology + ascendant/moon sign",
  "mulankInsight": "2-3 sentences interpreting the Mulank number specifically for this person",
  "bhagyankInsight": "2-3 sentences interpreting the Bhagyank number specifically for this person",
  "love": [
    { "title": "Love & Relationships", "content": "..." },
    { "title": "Your Strengths in Love", "content": "..." },
    { "title": "Challenges to Navigate", "content": "..." },
    { "title": "Marriage Timing", "content": "..." },
    { "title": "Guidance", "content": "..." }
  ],
  "career": {
    "overview": "2-3 sentences on career & profession themes",
    "bestFields": ["Field 1", "Field 2", "Field 3", "Field 4"],
    "cards": [
      { "title": "Professional Strengths", "content": "..." },
      { "title": "Career Challenges", "content": "..." },
      { "title": "Peak Periods", "content": "..." },
      { "title": "Guidance", "content": "..." }
    ]
  },
  "wealth": [
    { "title": "Wealth & Finance", "content": "..." },
    { "title": "Earning Style", "content": "..." },
    { "title": "Best Investments", "content": "..." },
    { "title": "Financial Risks", "content": "..." 
  ],
  "health": [
    { "title": "Health & Vitality", "content": "..." },
    { "title": "Areas of Strength", "content": "..." },
    { "title": "Areas to Watch", "content": "..." },
    { "title": "Guidance", "content": "..." }
  ],
  "remedies": [
    { "title": "Gemstone", "content": "..." },
    { "title": "Mantra", "content": "..." },
    { "title": "Charity & Service", "content": "..." },
    { "title": "Lifestyle Practice", "content": "..." }
  ]
}`;

async function generateReading(profile) {
  const { name, numerology, chart } = profile;
  const planetLines = chart.planets
    .map((p) => `${p.name}: ${p.sign} (house ${p.house}), nakshatra ${p.nakshatra.name}${p.retrograde ? ', retrograde' : ''}`)
    .join('\n');

  const userPrompt = `Person: ${name}
Mulank (root number): ${numerology.mulank} — ruler ${numerology.mulankInfo.ruler}
Bhagyank (destiny number): ${numerology.bhagyank} — ruler ${numerology.bhagyankInfo.ruler}
Ascendant (Lagna): ${chart.ascendant.sign} (${chart.ascendant.signSanskrit}), nakshatra ${chart.ascendant.nakshatra.name}
Moon sign (Rashi): ${chart.moonSign} (${chart.moonSignSanskrit}), nakshatra ${chart.moonNakshatra.name}
Ruling planet (nakshatra lord): ${chart.rulingPlanet}
Guna: ${chart.guna}
Western tropical sun sign: ${chart.westernZodiac}

Planetary placements (whole-sign houses):
${planetLines}

Write the JSON reading now.`;

  const raw = await callGemini(READING_SYSTEM_PROMPT, userPrompt, 6000);
  return safeParseJson(raw);
}

const COMPAT_SYSTEM_PROMPT = `You are Pundalik, a warm and insightful Vedic astrologer.
You are given two people's precomputed chart facts and an accurate Ashtakoot Guna Milan score
(out of 36) with its breakdown. Do NOT invent or contradict these facts. Write a balanced,
constructive compatibility analysis — mention real strengths and real friction points, and avoid
fatalistic language. Respond ONLY with a JSON object (no markdown fences, no preamble):
{
  "overview": "2 paragraphs summarizing the match",
  "emotional": "1-2 paragraphs on emotional/moon-sign compatibility",
  "communication": "1-2 paragraphs on communication & mental compatibility",
  "romance_intimacy": "1-2 paragraphs on romantic/physical chemistry",
  "career_finances": "1-2 paragraphs on shared ambitions, money compatibility",
  "long_term": "1-2 paragraphs on long-term prospects, family life, what to work on",
  "advice": "1 short paragraph of practical, constructive advice for the couple"
}`;

async function generateCompatibilityReading(personA, personB, gunaResult) {
  const factorLines = gunaResult.factors.map((f) => `${f.label}: ${f.score}/${f.max}`).join('\n');

  const userPrompt = `Person A: ${personA.name}
Moon sign: ${personA.chart.moonSign}, nakshatra ${personA.chart.moonNakshatra.name}
Ascendant: ${personA.chart.ascendant.sign}
Mulank/Bhagyank: ${personA.numerology.mulank}/${personA.numerology.bhagyank}

Person B: ${personB.name}
Moon sign: ${personB.chart.moonSign}, nakshatra ${personB.chart.moonNakshatra.name}
Ascendant: ${personB.chart.ascendant.sign}
Mulank/Bhagyank: ${personB.numerology.mulank}/${personB.numerology.bhagyank}

Guna Milan score: ${gunaResult.total}/${gunaResult.maxTotal} — ${gunaResult.verdict}
Breakdown:
${factorLines}
Nadi Dosha present: ${gunaResult.doshas.nadiDosha}
Bhakoot Dosha present: ${gunaResult.doshas.bhakootDosha}

Write the JSON compatibility analysis now.`;

  const raw = await callGemini(COMPAT_SYSTEM_PROMPT, userPrompt, 4000);
  return safeParseJson(raw);
}

function safeParseJson(raw) {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Gemini did not return valid JSON: ' + cleaned.slice(0, 200));
  }
}

module.exports = { generateReading, generateCompatibilityReading };
