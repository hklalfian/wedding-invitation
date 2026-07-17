require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up Postgres/Neon connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false
  } : false
});

// Initialize database table if it doesn't exist
async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.warn("==========================================================");
    console.warn("WARNING: DATABASE_URL is not set in .env");
    console.warn("The database features will not work until it is configured");
    console.warn("==========================================================");
    return;
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database table 'wishes' is ready.");
  } catch (error) {
    console.error("Error initializing database table:", error);
  }
}
initDb();

// GET all wishes
app.get('/api/wishes', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    // Return empty array if DB is not configured yet
    return res.json([]);
  }
  try {
    const result = await pool.query('SELECT * FROM wishes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST a new wish
app.post('/api/wishes', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL not configured in .env' });
  }
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO wishes (name, message) VALUES ($1, $2) RETURNING *',
      [name, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
