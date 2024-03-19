// Import required modules
const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); 

// Create Express app
const app = express();

// Set up middleware
app.use(cors());
app.use(express.json()); 

// Configure MySQL database connection
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const db = mysql.createPool({
  connectionLimit: 10,
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName
});

// Create table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS code_snippets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    language VARCHAR(50) NOT NULL,
    stdin TEXT,
    source_code TEXT,
    stdout TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.getConnection((err, connection) => {
  if (err) {
    throw err;
  }
  connection.query(createTableQuery, (err) => {
    connection.release();
    if (err) {
      throw err;
    }
    console.log('Table created or already exists');
  });
});

// Define routes
app.get('/api/entries', (req, res) => {
  const sql = 'SELECT username, language, stdin, LEFT(source_code, 100) AS source_code, stdout, timestamp FROM code_snippets';
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(result);
  });
});

app.post('/api/submit', async (req, res) => {
  const { username, language, stdin, sourceCode } = req.body;

  // Execute the code and get the stdout response
  let stdout;
  try {
    const response = await axios.post("https://onecompiler-apis.p.rapidapi.com/api/v1/run", {
      language: language,
      stdin: stdin,
      files: [
        {
          name: "Main."+language,
          content: sourceCode,
        },
      ],
    }, {
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": "1f1e610597msh6c9a2f4c94654f0p10feccjsn3feb141e5fb5",
        "X-RapidAPI-Host": "onecompiler-apis.p.rapidapi.com",
      }
    });
    stdout = response.data.stdout;
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  // Store the form data and stdout in the database
  const sql = 'INSERT INTO code_snippets (username, language, stdin, source_code, stdout) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [username, language, stdin, sourceCode, stdout], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.send('Code snippet submitted successfully');
  });
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
