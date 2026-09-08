import express from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database.js';
import { authenticateToken, requireRole, enforceStudentOwnership } from '../middleware/auth.js';

const router = express.Router();

// 1. Search and List Students (Counselor & Admin)
router.get('/', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const { search, class_name, status, has_followup } = req.query;
    const db = await getDb();

    let sql = `
      SELECT 
        s.id,
        s.student_code,
        s.class_name,
        s.status,
        s.created_at,
        u.name,
        u.email,
        tp.growth_level,
        tp.consecutive_checkins,
        tp.total_checkins,
        (SELECT COUNT(*) FROM counseling_records cr WHERE cr.student_id = s.id) as counseling_count,
        (SELECT COUNT(*) FROM followups fu WHERE fu.student_id = s.id AND fu.status = 'PENDING') as pending_followups_count,
        (SELECT appointment_date || ' ' || appointment_time FROM appointments ap WHERE ap.student_id = s.id AND ap.status = 'SCHEDULED' AND ap.appointment_date >= date('now') ORDER BY ap.appointment_date ASC LIMIT 1) as next_appointment,
        (SELECT MAX(date) FROM counseling_records cr WHERE cr.student_id = s.id) as last_counseling_date
      FROM students s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN tree_progress tp ON tp.student_id = s.id
      WHERE 1=1
    `;

    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      sql += ` AND (s.student_code LIKE ? OR u.name LIKE ? OR s.class_name LIKE ? OR u.email LIKE ?)`;
      params.push(term, term, term, term);
    }

    if (class_name && class_name !== 'ALL') {
      sql += ` AND s.class_name = ?`;
      params.push(class_name);
    }

    if (status && status !== 'ALL') {
      sql += ` AND s.status = ?`;
      params.push(status);
    }

    if (has_followup === 'true') {
      sql += ` AND (SELECT COUNT(*) FROM followups fu WHERE fu.student_id = s.id AND fu.status = 'PENDING') > 0`;
    }

    sql += ` ORDER BY s.student_code ASC`;

    const students = db.prepare(sql).all(...params);

    // Get available classes list for filter dropdown
    const classes = db.prepare('SELECT DISTINCT class_name FROM students ORDER BY class_name ASC').all().map(c => c.class_name);

    res.json({
      students,
      classes,
      total: students.length
    });
  } catch (err) {
    console.error('List students error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายชื่อนักเรียน' });
  }
});

// 2. Get Single Student Profile with all related tabs data
router.get('/:id', authenticateToken, enforceStudentOwnership, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const db = await getDb();

    const student = db.prepare(`
      SELECT 
        s.id,
        s.student_code,
        s.class_name,
        s.status,
        s.created_at,
        u.id as user_id,
        u.name,
        u.email,
        tp.growth_level,
        tp.consecutive_checkins,
        tp.total_checkins,
        tp.longest_streak,
        tp.last_checkin_date
      FROM students s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN tree_progress tp ON tp.student_id = s.id
      WHERE s.id = ?
    `).get(studentId);

    if (!student) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลนักเรียน' });
    }

    // Counseling records
    const counselingRecords = db.prepare(`
      SELECT cr.*, c.name as counselor_name
      FROM counseling_records cr
      JOIN counselors c ON c.id = cr.counselor_id
      WHERE cr.student_id = ?
      ORDER BY cr.date DESC, cr.id DESC
    `).all(studentId);

    // Followups
    const followups = db.prepare(`
      SELECT f.*, cr.topic as counseling_topic
      FROM followups f
      LEFT JOIN counseling_records cr ON cr.id = f.counseling_record_id
      WHERE f.student_id = ?
      ORDER BY f.status ASC, f.due_date ASC
    `).all(studentId);

    // Appointments
    const appointments = db.prepare(`
      SELECT ap.*, c.name as counselor_name
      FROM appointments ap
      JOIN counselors c ON c.id = ap.counselor_id
      WHERE ap.student_id = ?
      ORDER BY ap.appointment_date DESC, ap.appointment_time DESC
    `).all(studentId);

    // Recent Mood Checkins
    const recentMoods = db.prepare(`
      SELECT id, mood, note, checkin_date, created_at
      FROM mood_checkins
      WHERE student_id = ?
      ORDER BY checkin_date DESC
      LIMIT 14
    `).all(studentId);

    // Summary counts
    const summary = {
      totalCounseling: counselingRecords.length,
      lastCounselingDate: counselingRecords[0]?.date || null,
      nextAppointment: appointments.find(a => a.status === 'SCHEDULED' && a.appointment_date >= new Date().toISOString().split('T')[0]) || null,
      pendingFollowupsCount: followups.filter(f => f.status === 'PENDING').length
    };

    res.json({
      student,
      summary,
      counselingRecords,
      followups,
      appointments,
      recentMoods
    });
  } catch (err) {
    console.error('Get student detail error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน' });
  }
});

// 3. Update Student Status (Counselor & Admin)
router.patch('/:id/status', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'FOLLOW_UP', 'WAITING_APPOINTMENT', 'NO_FOLLOW_UP'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    }

    const db = await getDb();
    db.prepare('UPDATE students SET status = ? WHERE id = ?').run(status, studentId);

    res.json({ message: 'อัปเดตสถานะการติดตามสำเร็จ', status });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  }
});

// 4. Admin Create Student
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, student_code, class_name } = req.body;
    if (!name || !email || !student_code || !class_name) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const db = await getDb();
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    const existingCode = db.prepare('SELECT id FROM students WHERE student_code = ?').get(student_code.trim());
    if (existingCode) {
      return res.status(400).json({ error: 'รหัสนักเรียนนี้มีอยู่ในระบบแล้ว' });
    }

    const hash = bcrypt.hashSync(password || 'student123', 10);
    const u = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name.trim(), email.toLowerCase().trim(), hash, 'student');
    const st = db.prepare('INSERT INTO students (user_id, student_code, class_name, status) VALUES (?, ?, ?, ?)').run(u.lastInsertRowid, student_code.trim(), class_name.trim(), 'ACTIVE');
    
    // Init tree progress
    db.prepare('INSERT INTO tree_progress (student_id, growth_level, consecutive_checkins, total_checkins, longest_streak) VALUES (?, 0, 0, 0, 0)').run(st.lastInsertRowid);

    res.status(201).json({ message: 'เพิ่มนักเรียนเข้าสู่ระบบสำเร็จ', student_id: st.lastInsertRowid });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มนักเรียน' });
  }
});

// 5. Admin Delete Student
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const db = await getDb();
    
    const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ error: 'ไม่พบนักเรียน' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(student.user_id);
    res.json({ message: 'ลบข้อมูลนักเรียนเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบนักเรียน' });
  }
});

export default router;
