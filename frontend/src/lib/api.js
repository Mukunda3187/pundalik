const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export function getChart(payload) {
  return postJson('/api/chart', payload);
}

export function getCompatibility(personA, personB) {
  return postJson('/api/compatibility', { personA, personB });
}

/**
 * Free geocoding via OpenStreetMap Nominatim (no API key required).
 * Please be considerate of Nominatim's usage policy for production traffic.
 */
export async function geocodePlace(query) {
  if (!query || query.trim().length < 2) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((d) => ({
    label: d.display_name,
    latitude: Number(d.lat),
    longitude: Number(d.lon),
  }));
}
