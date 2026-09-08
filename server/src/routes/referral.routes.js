import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 1. Get Referrals (Counselor & Admin)
router.get('/', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const { status, urgency } = req.query;
    const db = await getDb();

    let sql = `
      SELECT 
        r.*,
        s.student_code,
        s.class_name,
        u.name as student_name
      FROM student_referrals r
      JOIN students s ON s.id = r.student_id
      JOIN users u ON u.id = s.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    if (urgency && urgency !== 'ALL') {
      sql += ` AND r.urgency = ?`;
      params.push(urgency);
    }

    sql += ` ORDER BY CASE r.urgency WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END, r.created_at DESC`;

    const referrals = db.prepare(sql).all(...params);
    res.json({ referrals });
  } catch (err) {
    console.error('Get referrals error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายการส่งต่อนักเรียน' });
  }
});

// 2. Create Referral Case
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, referred_by, teacher_role, reason, observed_behavior, urgency, notes } = req.body;
    if (!student_id || !reason) {
      return res.status(400).json({ error: 'กรุณาระบุนักเรียนและเหตุผลการส่งต่อ' });
    }

    const db = await getDb();
    const result = db.prepare(`
      INSERT INTO student_referrals (student_id, referred_by, teacher_role, reason, observed_behavior, urgency, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `).run(
      student_id,
      referred_by || req.user.name,
      teacher_role || 'ครูประจำชั้น',
      reason.trim(),
      observed_behavior || '',
      urgency || 'MEDIUM',
      notes || ''
    );

    // If urgency is HIGH, update student status to WAITING_APPOINTMENT
    if (urgency === 'HIGH') {
      db.prepare("UPDATE students SET status = 'WAITING_APPOINTMENT' WHERE id = ?").run(student_id);
    }

    res.status(201).json({
      message: 'ส่งต่อเคสนักเรียนไปยังห้องแนะแนวเรียบร้อยแล้ว',
      referral_id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Create referral error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างเคสส่งต่อ' });
  }
});

// 3. Update Referral Status (e.g. Accept case, complete, decline)
router.patch('/:id/status', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const referralId = parseInt(req.params.id);
    const { status, notes } = req.body;

    const db = await getDb();
    db.prepare(`
      UPDATE student_referrals
      SET status = ?, notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(status, notes || null, referralId);

    res.json({ message: 'อัปเดตสถานะการส่งต่อเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Update referral status error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  }
});

export default router;
