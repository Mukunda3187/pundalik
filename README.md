# Pundalik — Vedic Astrology & Numerology

Full-stack app: give a name, birth date, time, and place → get Mulank/Bhagyank numerology,
a sidereal (Lahiri) Vedic birth chart with every planet's sign/house/nakshatra, and Gemini-written
readings for personality, love, career, and success. A second page runs Ashtakoot Guna Milan
compatibility matching between two people, plus a Gemini-written relationship analysis.

```
pundalik/
├── backend/    Node + Express API — chart math + Gemini calls
└── frontend/   React (Vite) UI
```

## How the astrology is computed (read this first)

- **Numerology** — Mulank (digit-sum of birth day) and Bhagyank (digit-sum of full DOB), reduced to 1–9.
- **Planet positions** — computed with the `astronomy-engine` library (real astronomical ephemeris,
  no external API), converted from tropical to **sidereal** using a Lahiri ayanamsa approximation
  (accurate to a fraction of a degree — fine for sign/house/nakshatra level astrology).
- **Rahu/Ketu** — mean lunar node formula (the standard used by most Vedic software).
- **Houses** — whole-sign system (each house = one full zodiac sign), the most common approach in
  Jyotish, computed from a manually-derived Ascendant (needs birth time + place — this is why the
  form asks for both).
- **Guna Milan** — all 8 traditional kootas (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana,
  Bhakoot, Nadi) computed from the two Moon positions, standard published tables.
- **The actual "readings"** (personality/love/career/success/compatibility text) are written by
  Gemini, given the *precomputed* facts above as input — Gemini interprets, it doesn't invent the
  chart itself.

This is a solid, defensible implementation of mainstream Jyotish conventions — but different
schools of astrology use different ayanamsas, house systems, and koota rules, and this is not a
professional astrologer. Treat it as entertainment / a reflection tool, which is also what the
app tells users.

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your Gemini API key (get one free at https://aistudio.google.com/apikey):

```
GOOGLE_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
PORT=4000
```

Run it:

```bash
npm start
# → Pundalik backend running on http://localhost:4000
```

Without a valid key, chart math still works and is returned — only the AI-written reading will
show a clear error message in the UI instead of crashing.

**If you get a 401 error**, it's almost always the key: make sure it's a *Gemini Developer API*
key from https://aistudio.google.com/apikey (starts with `AIza`), not an OAuth token, service
account key, or a key from a different Google product — those look different and won't work here.
Also confirm the key hasn't hit its free-tier quota in Google AI Studio.

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env    # VITE_API_BASE=http://localhost:4000 by default
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

Birth-place search uses OpenStreetMap's free Nominatim geocoding API directly from the browser —
no key needed, but keep an eye on their usage policy if you get real traffic:
https://operations.osmfoundation.org/policies/nominatim/

## 3. Deploying

I can't push this live to a public URL from where I run — no access to Render/Vercel/Netlify
accounts. Everything below is ready to deploy yourself in a few minutes; config files for the
two easiest options are already included.

### Backend → Render (or Railway / Fly.io / any Node host)
1. Push this repo to GitHub.
2. On Render: **New → Web Service**, point it at the repo, root directory `backend`. Render will
   pick up `render.yaml` automatically (or set build command `npm install`, start command
   `npm start` manually).
3. Add the `GOOGLE_API_KEY` environment variable in the Render dashboard (marked `sync: false`
   in `render.yaml` on purpose — don't commit real keys to git).
4. Note the resulting URL, e.g. `https://pundalik-backend.onrender.com`.

`backend/Procfile` is also included if you'd rather use Railway or Heroku-style buildpacks.

### Frontend → Netlify (or Vercel / Cloudflare Pages)
1. On Netlify: **Add new site → Import an existing project**, point it at the repo, base
   directory `frontend`. It will read `netlify.toml` (build command `npm run build`, publish
   `dist`).
2. In Site settings → Environment variables, set `VITE_API_BASE` to your deployed backend URL
   from the step above, then redeploy.
3. The app uses `HashRouter`, so no server-side redirect rules are needed for client-side routing
   on any static host.

### CORS
The backend currently allows all origins (`cors()` with no options) for easy local dev. Before
going to production, lock `app.use(cors())` down to your actual frontend domain in
`backend/src/server.js`.

## 4. What's on each page

- **Home** — birth details form, front and center, no scrolling required.
- **Your Chart result** — a stats strip (Mulank, Bhagyank, Rashi, Lagna, Nakshatra) under the
  name, then 7 tabs: **Overview** (cosmic profile table + personality), **Kundli** (square
  North-Indian-style grid chart + full planet table), **Love**, **Career** (includes a
  "Best Fields" tag list), **Wealth**, **Health**, **Remedies** — each a stack of titled cards
  written by Gemini from the computed chart facts.
- **Compatibility** — two birth-detail forms, Guna Milan score breakdown, both Kundli charts
  side by side, and a tabbed relationship analysis.

## 5. Project structure

```
backend/src/
  astro/
    numerology.js       Mulank / Bhagyank
    ephemeris.js         planet positions, ascendant, houses, nakshatras (astronomy-engine)
    vedicData.js          static reference tables (signs, nakshatras, friendships, guna milan data)
    chartBuilder.js       combines numerology + ephemeris into one profile
    compatibility.js      Ashtakoot Guna Milan scoring
  services/
    geminiService.js      calls the Gemini API, prompts for the tabbed JSON reading
  routes/
    chartRoutes.js         POST /api/chart
    compatibilityRoutes.js POST /api/compatibility
  server.js

frontend/src/
  pages/         Home.jsx, ChartResult.jsx, Compatibility.jsx
  components/    KundliChart.jsx (grid-style birth chart), BirthPersonForm.jsx,
                 CosmicProfileTable.jsx, CardSection.jsx, TagList.jsx, PlanetTable.jsx,
                 ReadingTabs.jsx, GunaMilanBreakdown.jsx
  lib/api.js     fetch helpers + Nominatim geocoding
```

## 6. Extending it

- Swap the Lahiri ayanamsa formula for a table-based one (e.g. Swiss Ephemeris data) if you need
  arc-second precision.
- Add a proper timezone lookup (e.g. Google Time Zone API) instead of the manual offset field.
- Add auth + a database to save charts instead of passing them through router state.
- Add divisional charts (D9/Navamsa etc.) — `ephemeris.js` already gives raw sidereal longitudes,
  so this is mostly new math in that file plus another `KundliChart` instance in the UI.
