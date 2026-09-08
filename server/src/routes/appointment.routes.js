import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 1. Get Appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, date, status } = req.query;
    const db = await getDb();

    let sql = `
      SELECT 
        ap.id,
        ap.student_id,
        ap.counselor_id,
        ap.appointment_date,
        ap.appointment_time,
        ap.topic,
        ap.status,
        ap.notes,
        ap.created_at,
        s.student_code,
        s.class_name,
        u.name as student_name,
        c.name as counselor_name
      FROM appointments ap
      JOIN students s ON s.id = ap.student_id
      JOIN users u ON u.id = s.user_id
      JOIN counselors c ON c.id = ap.counselor_id
      WHERE 1=1
    `;

    const params = [];

    if (req.user.role === 'student') {
      sql += ` AND ap.student_id = ?`;
      params.push(req.user.student_id);
    } else if (student_id) {
      sql += ` AND ap.student_id = ?`;
      params.push(student_id);
    }

    if (date) {
      sql += ` AND ap.appointment_date = ?`;
      params.push(date);
    }

    if (status && status !== 'ALL') {
      sql += ` AND ap.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY ap.appointment_date DESC, ap.appointment_time DESC`;

    const appointments = db.prepare(sql).all(...params);

    res.json({ appointments });
  } catch (err) {
    console.error('List appointments error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายการนัดหมาย' });
  }
});

// 2. Create Appointment (Counselor & Admin)
router.post('/', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const { student_id, appointment_date, appointment_time, topic, notes } = req.body;
    if (!student_id || !appointment_date || !appointment_time || !topic) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลนัดหมายให้ครบถ้วน' });
    }

    const db = await getDb();
    let counselorId = req.user.counselor_id;
    if (!counselorId) {
      const c = db.prepare('SELECT id FROM counselors LIMIT 1').get();
      counselorId = c ? c.id : 1;
    }

    const result = db.prepare(`
      INSERT INTO appointments (student_id, counselor_id, appointment_date, appointment_time, topic, status, notes)
      VALUES (?, ?, ?, ?, ?, 'SCHEDULED', ?)
    `).run(student_id, counselorId, appointment_date, appointment_time, topic.trim(), notes || '');

    // Optionally update student status to WAITING_APPOINTMENT if not already FOLLOW_UP
    const st = db.prepare('SELECT status FROM students WHERE id = ?').get(student_id);
    if (st && st.status !== 'FOLLOW_UP') {
      db.prepare("UPDATE students SET status = 'WAITING_APPOINTMENT' WHERE id = ?").run(student_id);
    }

    res.status(201).json({
      message: 'สร้างการนัดหมายสำเร็จ',
      appointment_id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างนัดหมาย' });
  }
});

// 3. Update Status
router.patch('/:id/status', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    }

    const db = await getDb();
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, appointmentId);

    res.json({ message: 'อัปเดตสถานะการนัดหมายสำเร็จ' });
  } catch (err) {
    console.error('Update appointment status error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะนัดหมาย' });
  }
});

// 4. Delete Appointment
router.delete('/:id', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const db = await getDb();
    db.prepare('DELETE FROM appointments WHERE id = ?').run(appointmentId);
    res.json({ message: 'ยกเลิก/ลบการนัดหมายเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบนัดหมาย' });
  }
});

export default router;
