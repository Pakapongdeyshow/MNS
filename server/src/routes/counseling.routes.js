import express from 'express';
import { db } from '../db/supabaseDb.js';
import { authenticateToken, requireCounselorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Get counseling records for a student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    if (req.user.role === 'student' && req.user.student_id !== studentId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงบันทึกของนักเรียนคนอื่น' });
    }

    const records = await db.getCounselingRecordsByStudent(studentId);
    res.json({ total: records.length, records });
  } catch (err) {
    console.error('Get counseling records error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงบันทึกการให้คำปรึกษา' });
  }
});

// 2. Create counseling record
router.post('/', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const {
      student_id,
      date,
      topic,
      key_points,
      student_needs,
      discussion,
      follow_up_note,
      next_appointment,
      category = 'ACADEMIC',
      followup_task,
      followup_due_date
    } = req.body;

    if (!student_id || !topic) {
      return res.status(400).json({ error: 'ต้องระบุ student_id และ topic' });
    }

    const counselorId = req.user.counselor_id || 1;
    const sessionDate = date || new Date().toISOString().split('T')[0];

    const record = await db.createCounselingRecord({
      student_id,
      counselor_id: counselorId,
      date: sessionDate,
      topic,
      key_points: key_points || null,
      student_needs: student_needs || null,
      discussion: discussion || null,
      follow_up_note: follow_up_note || null,
      next_appointment: next_appointment || null,
      category
    });

    // Create followup task if requested
    if (followup_task && followup_due_date) {
      await db.createFollowup({
        student_id,
        counseling_record_id: record.id,
        task: followup_task,
        due_date: followup_due_date,
        status: 'PENDING'
      });
      await db.updateStudentStatus(student_id, 'FOLLOW_UP');
    }

    res.status(201).json({
      message: 'บันทึกการให้คำปรึกษาสำเร็จ',
      record
    });
  } catch (err) {
    console.error('Create counseling record error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกการให้คำปรึกษา', details: err.message });
  }
});

// 3. Delete counseling record
router.delete('/:id', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    await db.deleteCounselingRecord(recordId);
    res.json({ message: 'ลบบันทึกการให้คำปรึกษาสำเร็จ' });
  } catch (err) {
    console.error('Delete counseling record error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบบันทึก' });
  }
});

export default router;
