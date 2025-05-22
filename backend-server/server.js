const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT =5000;

// Middleware to parse JSON bodies
app.use(express.json());

// MySQL connection config
const db = mysql.createConnection({
  host: 'localhost',      // your MySQL host
  user: 'root',           // your MySQL user
  password: 'ajithvictus@rmkec',  // your MySQL password
  database: 'fingerprintAttendance'  // your database name
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// Example route to get all students
app.get('/students', (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
