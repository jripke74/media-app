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
  const { title, release_year_dvd, release_year_movie } = req.body;
  try {
    await pool.query('INSERT INTO movies (title, release_year_dvd, release_year_movie) VALUES ($1, $2, $3)', [title, release_year_dvd, release_year_movie]);
    res.redirect('/dvds');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.get('/dvds', async (req, res) => {
  try {
    const movieTableData = await pool.query('SELECT * FROM movies');
    for (let movie of movieTableData.rows) {
      res.send(`${movie.title}, Movie realease year: ${movie.release_year_movie}`);
    }
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
