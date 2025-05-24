const express = require('express');
const router = express.Router();
const db = require('../db');

// Mark attendance (insert or update)
router.post('/mark-attendance', (req, res) => {
  const { fingerprint_id } = req.body;

  if (!fingerprint_id) {
    return res.status(400).json({
      status: 'error',
      message: 'Fingerprint ID is required.',
    });
  }

  const findStudentQuery = 'SELECT student_id, name FROM students WHERE fingerprint_id = ?';
  db.query(findStudentQuery, [fingerprint_id], (err, results) => {
    if (err) {
      console.error('Database error fetching student:', err);
      return res.status(500).json({
        status: 'error',
        message: 'An internal error occurred while retrieving student information. Please try again later.',
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found with the provided fingerprint ID.',
      });
    }

    const student = results[0];

    // Check if attendance is already marked for today
    const checkAttendanceQuery = `
      SELECT status FROM attendance 
      WHERE student_id = ? AND attendance_date = CURDATE();
    `;
    db.query(checkAttendanceQuery, [student.student_id], (err, attendanceResults) => {
      if (err) {
        console.error('Database error checking attendance:', err);
        return res.status(500).json({
          status: 'error',
          message: 'An internal error occurred while checking attendance. Please try again later.',
        });
      }

      if (attendanceResults.length > 0 && attendanceResults[0].status === 'Present') {
        // Attendance already marked
        return res.status(200).json({
          status: 'info',
          message: `Attendance has already been marked for ${student.name} today.`,
          data: {
            studentId: student.student_id,
            studentName: student.name,
            attendanceDate: new Date().toISOString().slice(0, 10),
            attendanceStatus: attendanceResults[0].status,
          },
        });
      }

      // Insert or update attendance if not already present
      const attendanceQuery = `
        INSERT INTO attendance (student_id, attendance_date, status)
        VALUES (?, CURDATE(), 'Present')
        ON DUPLICATE KEY UPDATE status = 'Present';
      `;

      db.query(attendanceQuery, [student.student_id], (err, result) => {
        if (err) {
          console.error('Database error marking attendance:', err);
          return res.status(500).json({
            status: 'error',
            message: 'An internal error occurred while marking attendance. Please try again later.',
          });
        }

        return res.status(200).json({
          status: 'success',
          message: `Attendance has been successfully recorded for ${student.name}.`,
          data: {
            studentId: student.student_id,
            studentName: student.name,
            attendanceDate: new Date().toISOString().slice(0, 10),
            attendanceStatus: 'Present',
          },
        });
      });
    });
  });
});


//report attendance
router.post('/report', (req, res) => {
  const { startDate, endDate, deptId } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required.' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
  }

  let sql = `
    SELECT s.student_id, s.name, d.dept_name, a.attendance_date, a.status
    FROM attendance a
    JOIN students s ON a.student_id = s.student_id
    LEFT JOIN departments d ON s.dept_id = d.dept_id
    WHERE a.attendance_date BETWEEN ? AND ?
  `;

  const params = [startDate, endDate];

  if (deptId) {
    sql += ' AND s.dept_id = ?';
    params.push(deptId);
  }

  sql += ' ORDER BY a.attendance_date, s.student_id';

  // Use db.query directly (no new connection)
  db.query(sql, params, (error, results) => {
    if (error) {
      console.error('Error fetching attendance report:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const report = {};

    results.forEach(({ student_id, name, dept_name, attendance_date, status }) => {
      if (!report[student_id]) {
        report[student_id] = {
          studentId: student_id,
          name,
          department: dept_name || 'N/A',
          attendanceRecords: []
        };
      }
      report[student_id].attendanceRecords.push({
        date: attendance_date,
        status
      });
    });

    res.json({ report: Object.values(report) });
  });
});



module.exports = router;




