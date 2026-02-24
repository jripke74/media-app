const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/')));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Heroku [7]
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/submit', async (req, res) => {
  const { title, releaseyeardvd, releaseyearmovie } = req.body;
  try {
    await pool.query('INSERT INTO dvds (title, releaseyeardvd, releaseyearmovie) VALUES ($1, $2, $3)', [title, releaseyeardvd, releaseyearmovie]);
    res.redirect('/dvds');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.get('/dvds', async (req, res) => {
  try {
    const dvdTableData = await pool.query('SELECT * FROM dvds');
    for (let dvd of dvdTableData.rows) {
      res.send(dvd.title, dvd.releaseyearmovie);
    }
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
