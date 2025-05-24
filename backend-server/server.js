const express = require('express');
const bodyParser = require('body-parser');
const attendanceRoutes = require('./routes/attendance'); // Import routes

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

// 🔗 Use Routes
app.use('/api', attendanceRoutes); // All routes will be prefixed with /api

// Example: POST /api/mark-attendance

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
