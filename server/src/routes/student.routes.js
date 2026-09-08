import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/supabaseDb.js';
import { authenticateToken, requireCounselorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Get student list
router.get('/', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const { search = '', class_name = '', status = '', risk = '' } = req.query;
    const students = await db.getStudents({ search, className: class_name, status, risk });
    
    const allClasses = [...new Set(students.map(s => s.class_name).filter(Boolean))].sort();

    res.json({
      total: students.length,
      classes: allClasses,
      students
    });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายชื่อนักเรียน' });
  }
});

// 2. Get student details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);

    if (req.user.role === 'student' && req.user.student_id !== studentId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงข้อมูลของนักเรียนคนอื่น' });
    }

    const student = await db.getStudentById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลนักเรียน' });
    }

    const [counselingRecords, followups, appointments, recentMoods, treeProgress] = await Promise.all([
      db.getCounselingRecordsByStudent(studentId),
      db.getFollowups({ studentId }),
      db.getAppointments({ studentId }),
      db.getMoodHistory(studentId, 10),
      db.getTreeProgress(studentId)
    ]);

    res.json({
      ...student,
      growth_level: treeProgress.growth_level || 0,
      tree_progress: treeProgress,
      counseling_records: counselingRecords,
      followups,
      appointments,
      recent_moods: recentMoods
    });
  } catch (err) {
    console.error('Get student detail error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน' });
  }
});

// 3. Update student status
router.patch('/:id/status', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const { status } = req.body;
    const validStatuses = ['ACTIVE', 'FOLLOW_UP', 'WAITING_APPOINTMENT', 'NO_FOLLOW_UP'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    }

    const updated = await db.updateStudentStatus(studentId, status);
    res.json({ message: 'อัปเดตสถานะสำเร็จ', student: updated });
  } catch (err) {
    console.error('Update student status error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  }
});

// 4. Create new student
router.post('/', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const { name, email, password, student_code, class_name } = req.body;

    if (!name || !email || !password || !student_code || !class_name) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = await db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      role: 'student'
    });

    const student = await db.createStudent({
      userId: user.id,
      studentCode: student_code.trim(),
      className: class_name.trim(),
      status: 'ACTIVE'
    });

    res.status(201).json({
      message: 'สร้างบัญชีนักเรียนสำเร็จ',
      student: {
        id: student.id,
        user_id: user.id,
        name: user.name,
        email: user.email,
        student_code: student.student_code,
        class_name: student.class_name,
        status: student.status
      }
    });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างนักเรียน', details: err.message });
  }
});

// 5. Delete student
router.delete('/:id', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = await db.getStudentById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'ไม่พบนักเรียน' });
    }

    await db.deleteUser(student.user_id);
    res.json({ message: 'ลบข้อมูลนักเรียนสำเร็จ' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบนักเรียน' });
  }
});

export default router;
