const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ajithvictus@rmkec',       // your password
  database: 'fingerprintattendance'
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
    return;
  }
  console.log('DB connected!');
});

module.exports = db;
