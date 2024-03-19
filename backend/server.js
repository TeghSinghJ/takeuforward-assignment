const mysql = require('mysql');
const axios = require('axios');

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

// Database connection
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

// Routes
module.exports = (req, res) => {
  if (req.method === 'GET') {
    const sql = 'SELECT username, language, stdin, LEFT(source_code, 100) AS source_code, stdout, timestamp FROM code_snippets';
    db.query(sql, (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(result);
    });
  } else if (req.method === 'POST') {
    const { username, language, stdin, sourceCode } = req.body;

    // Execute the code and get the stdout response
    let stdout;
    axios.post("https://onecompiler-apis.p.rapidapi.com/api/v1/run", {
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
    })    .then(response => {
      stdout = response.data.stdout;
      const sql = 'INSERT INTO code_snippets (username, language, stdin, source_code, stdout) VALUES (?, ?, ?, ?, ?)';
      db.query(sql, [username, language, stdin, sourceCode, stdout], (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        res.status(200).send('Code snippet submitted successfully');
      });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
  } else {
    res.status(405).send('Method Not Allowed');
  }
};
