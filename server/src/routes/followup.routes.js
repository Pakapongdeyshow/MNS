import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken, requireRole, enforceStudentOwnership } from '../middleware/auth.js';

const router = express.Router();

// 1. Get Followups list with Due Status Calculation
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, status } = req.query;
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];

    let sql = `
      SELECT 
        f.id,
        f.student_id,
        f.counseling_record_id,
        f.task,
        f.due_date,
        f.status,
        f.completed_at,
        f.created_at,
        s.student_code,
        s.class_name,
        u.name as student_name,
        cr.topic as counseling_topic
      FROM followups f
      JOIN students s ON s.id = f.student_id
      JOIN users u ON u.id = s.user_id
      LEFT JOIN counseling_records cr ON cr.id = f.counseling_record_id
      WHERE 1=1
    `;

    const params = [];

    // If student, lock to their own student_id
    if (req.user.role === 'student') {
      sql += ` AND f.student_id = ?`;
      params.push(req.user.student_id);
    } else if (student_id) {
      sql += ` AND f.student_id = ?`;
      params.push(student_id);
    }

    if (status && status !== 'ALL') {
      sql += ` AND f.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY f.status ASC, f.due_date ASC`;

    const rawFollowups = db.prepare(sql).all(...params);

    // Annotate with urgency tag
    const followups = rawFollowups.map(f => {
      let urgency = 'UPCOMING';
      if (f.status === 'COMPLETED') {
        urgency = 'COMPLETED';
      } else if (f.due_date < today) {
        urgency = 'OVERDUE';
      } else if (f.due_date === today) {
        urgency = 'DUE_TODAY';
      } else {
        urgency = 'UPCOMING';
      }
      return {
        ...f,
        urgency
      };
    });

    res.json({ followups });
  } catch (err) {
    console.error('List followups error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายการติดตามผล' });
  }
});

// 2. Create Followup (Counselor & Admin)
router.post('/', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const { student_id, task, due_date, counseling_record_id } = req.body;
    if (!student_id || !task || !due_date) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน (รหัสนักเรียน, งานที่ต้องติดตาม, วันที่กำหนดส่ง)' });
    }

    const db = await getDb();
    const result = db.prepare(`
      INSERT INTO followups (student_id, task, due_date, counseling_record_id, status)
      VALUES (?, ?, ?, ?, 'PENDING')
    `).run(student_id, task.trim(), due_date, counseling_record_id || null);

    // Update student status to FOLLOW_UP
    db.prepare("UPDATE students SET status = 'FOLLOW_UP' WHERE id = ?").run(student_id);

    res.status(201).json({
      message: 'สร้างงานติดตามผลสำเร็จ',
      followup_id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Create followup error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างงานติดตามผล' });
  }
});

// 3. Mark as Completed (Counselor & Admin)
router.patch('/:id/complete', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const followupId = parseInt(req.params.id);
    const db = await getDb();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      UPDATE followups
      SET status = 'COMPLETED', completed_at = ?
      WHERE id = ?
    `).run(nowStr, followupId);

    res.json({ message: 'บันทึกสถานะเสร็จสิ้นเรียบร้อยแล้ว', completed_at: nowStr });
  } catch (err) {
    console.error('Complete followup error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะงาน' });
  }
});

// 4. Toggle Status or Reopen (Counselor & Admin)
router.patch('/:id/status', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const followupId = parseInt(req.params.id);
    const { status } = req.body;
    const db = await getDb();

    if (status === 'COMPLETED') {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      db.prepare("UPDATE followups SET status = 'COMPLETED', completed_at = ? WHERE id = ?").run(nowStr, followupId);
    } else {
      db.prepare('UPDATE followups SET status = ?, completed_at = NULL WHERE id = ?').run(status, followupId);
    }

    res.json({ message: 'อัปเดตสถานะสำเร็จ' });
  } catch (err) {
    console.error('Update followup status error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  }
});

// 5. Delete Followup (Counselor & Admin)
router.delete('/:id', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const followupId = parseInt(req.params.id);
    const db = await getDb();
    db.prepare('DELETE FROM followups WHERE id = ?').run(followupId);
    res.json({ message: 'ลบงานติดตามผลเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Delete followup error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบงาน' });
  }
});

export default router;
