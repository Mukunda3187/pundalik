const express = require('express');
const { buildProfile } = require('../astro/chartBuilder');
const { generateReading } = require('../services/geminiService');

const router = express.Router();

function validateInput(body) {
  const required = ['name', 'day', 'month', 'year', 'hour', 'minute', 'tzOffsetHours', 'latitude', 'longitude'];
  for (const key of required) {
    if (body[key] === undefined || body[key] === null || body[key] === '') {
      return `Missing field: ${key}`;
    }
  }
  if (body.day < 1 || body.day > 31) return 'Invalid day';
  if (body.month < 1 || body.month > 12) return 'Invalid month';
  if (body.hour < 0 || body.hour > 23) return 'Invalid hour';
  if (body.minute < 0 || body.minute > 59) return 'Invalid minute';
  return null;
}

router.post('/', async (req, res) => {
  try {
    const err = validateInput(req.body);
    if (err) return res.status(400).json({ error: err });

    const profile = buildProfile({
      name: req.body.name,
      day: Number(req.body.day),
      month: Number(req.body.month),
      year: Number(req.body.year),
      hour: Number(req.body.hour),
      minute: Number(req.body.minute),
      tzOffsetHours: Number(req.body.tzOffsetHours),
      latitude: Number(req.body.latitude),
      longitude: Number(req.body.longitude),
      placeName: req.body.placeName || '',
    });

    let reading = null;
    let readingError = null;
    try {
      reading = await generateReading(profile);
    } catch (e) {
      readingError = e.message;
    }

    res.json({ profile, reading, readingError });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Failed to build chart' });
  }
});

module.exports = router;
