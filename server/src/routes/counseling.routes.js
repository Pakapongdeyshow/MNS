import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken, requireRole, enforceStudentOwnership } from '../middleware/auth.js';

const router = express.Router();

// 1. Get counseling records for a student
router.get('/student/:studentId', authenticateToken, enforceStudentOwnership, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const db = await getDb();

    const records = db.prepare(`
      SELECT cr.*, c.name as counselor_name
      FROM counseling_records cr
      JOIN counselors c ON c.id = cr.counselor_id
      WHERE cr.student_id = ?
      ORDER BY cr.date DESC, cr.id DESC
    `).all(studentId);

    res.json({ records });
  } catch (err) {
    console.error('Get counseling records error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงบันทึกการให้คำปรึกษา' });
  }
});

// 2. Create new Counseling Record (Counselor & Admin)
router.post('/', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
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
      create_followup_task,
      followup_task,
      followup_due_date,
      appointment_id
    } = req.body;

    if (!student_id || !topic || !date) {
      return res.status(400).json({ error: 'กรุณาระบุรหัสนักเรียน วันที่ และหัวข้อการให้คำปรึกษา' });
    }

    const db = await getDb();

    // Determine counselor_id
    let counselorId = req.user.counselor_id;
    if (!counselorId) {
      const c = db.prepare('SELECT id FROM counselors LIMIT 1').get();
      counselorId = c ? c.id : 1;
    }

    // Insert record
    const result = db.prepare(`
      INSERT INTO counseling_records (
        student_id, counselor_id, date, topic, key_points, student_needs, discussion, follow_up_note, next_appointment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      student_id,
      counselorId,
      date,
      topic,
      key_points || '',
      student_needs || '',
      discussion || '',
      follow_up_note || '',
      next_appointment || ''
    );

    const recordId = result.lastInsertRowid;

    // Create connected follow-up task if requested
    if (create_followup_task && followup_task && followup_due_date) {
      db.prepare(`
        INSERT INTO followups (student_id, counseling_record_id, task, due_date, status)
        VALUES (?, ?, ?, ?, 'PENDING')
      `).run(student_id, recordId, followup_task, followup_due_date);

      // Update student status to FOLLOW_UP
      db.prepare("UPDATE students SET status = 'FOLLOW_UP' WHERE id = ?").run(student_id);
    }

    // If linked to an appointment, mark appointment completed
    if (appointment_id) {
      db.prepare("UPDATE appointments SET status = 'COMPLETED' WHERE id = ?").run(appointment_id);
    }

    // If next_appointment is provided, schedule a new appointment automatically
    if (next_appointment && next_appointment.trim()) {
      const nextDate = next_appointment.split(' ')[0];
      const nextTime = next_appointment.split(' ')[1] || '13:00';
      db.prepare(`
        INSERT INTO appointments (student_id, counselor_id, appointment_date, appointment_time, topic, status, notes)
        VALUES (?, ?, ?, ?, ?, 'SCHEDULED', ?)
      `).run(student_id, counselorId, nextDate, nextTime, `ติดตามต่อเนื่อง: ${topic}`, `นัดหมายจากการบันทึกเมื่อวันที่ ${date}`);
    }

    res.status(201).json({
      message: 'บันทึกข้อมูลการให้คำปรึกษาสำเร็จ',
      record_id: recordId
    });
  } catch (err) {
    console.error('Create counseling record error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  }
});

// 3. Delete counseling record
router.delete('/:id', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const db = await getDb();
    db.prepare('DELETE FROM counseling_records WHERE id = ?').run(recordId);
    res.json({ message: 'ลบบันทึกการให้คำปรึกษาเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Delete counseling record error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบบันทึก' });
  }
});

export default router;
