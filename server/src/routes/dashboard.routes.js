import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Counselor & Admin Dashboard Metrics
router.get('/counselor', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    const currentYearMonth = today.substring(0, 7); // e.g. '2026-09'

    // Total Students
    const totalStudentsRow = db.prepare('SELECT COUNT(*) as count FROM students').get();
    const totalStudents = totalStudentsRow ? totalStudentsRow.count : 0;

    // Students being actively followed (status = 'FOLLOW_UP' or has pending followups)
    const followedRow = db.prepare(`
      SELECT COUNT(DISTINCT s.id) as count 
      FROM students s
      WHERE s.status = 'FOLLOW_UP' OR (SELECT COUNT(*) FROM followups f WHERE f.student_id = s.id AND f.status = 'PENDING') > 0
    `).get();
    const studentsFollowed = followedRow ? followedRow.count : 0;

    // Today's appointments count & preview
    const todayAppointments = db.prepare(`
      SELECT ap.*, s.student_code, s.class_name, u.name as student_name, c.name as counselor_name
      FROM appointments ap
      JOIN students s ON s.id = ap.student_id
      JOIN users u ON u.id = s.user_id
      JOIN counselors c ON c.id = ap.counselor_id
      WHERE ap.appointment_date = ? AND ap.status = 'SCHEDULED'
      ORDER BY ap.appointment_time ASC
    `).all(today);

    // Pending Follow-ups count
    const pendingFollowupsRow = db.prepare(`
      SELECT COUNT(*) as count FROM followups WHERE status = 'PENDING'
    `).get();
    const pendingFollowupsCount = pendingFollowupsRow ? pendingFollowupsRow.count : 0;

    // Overdue Follow-ups count & preview
    const overdueFollowups = db.prepare(`
      SELECT f.*, s.student_code, s.class_name, u.name as student_name
      FROM followups f
      JOIN students s ON s.id = f.student_id
      JOIN users u ON u.id = s.user_id
      WHERE f.status = 'PENDING' AND f.due_date < ?
      ORDER BY f.due_date ASC
    `).all(today);

    // Counseling Sessions This Month
    const monthSessionsRow = db.prepare(`
      SELECT COUNT(*) as count FROM counseling_records WHERE date LIKE ?
    `).get(`${currentYearMonth}%`);
    const counselingThisMonth = monthSessionsRow ? monthSessionsRow.count : 0;

    // Recent counseling records
    const recentCounseling = db.prepare(`
      SELECT cr.*, s.student_code, s.class_name, u.name as student_name, c.name as counselor_name
      FROM counseling_records cr
      JOIN students s ON s.id = cr.student_id
      JOIN users u ON u.id = s.user_id
      JOIN counselors c ON c.id = cr.counselor_id
      ORDER BY cr.date DESC, cr.id DESC
      LIMIT 5
    `).all();

    // Classes breakdown
    const classBreakdown = db.prepare(`
      SELECT class_name, COUNT(*) as student_count
      FROM students
      GROUP BY class_name
      ORDER BY class_name ASC
    `).all();

    res.json({
      metrics: {
        totalStudents,
        studentsFollowed,
        todayAppointmentsCount: todayAppointments.length,
        pendingFollowupsCount,
        overdueFollowupsCount: overdueFollowups.length,
        counselingThisMonth
      },
      todayAppointments,
      overdueFollowups,
      recentCounseling,
      classBreakdown
    });
  } catch (err) {
    console.error('Counselor dashboard error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล Dashboard' });
  }
});

export default router;
