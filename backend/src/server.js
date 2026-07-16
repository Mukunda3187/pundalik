require('dotenv').config();
const express = require('express');
const cors = require('cors');

const chartRoutes = require('./routes/chartRoutes');
const compatibilityRoutes = require('./routes/compatibilityRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'pundalik-backend' });
});

app.use('/api/chart', chartRoutes);
app.use('/api/compatibility', compatibilityRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Pundalik backend running on http://localhost:${PORT}`);
});
