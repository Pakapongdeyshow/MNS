import express from 'express';
import { db } from '../db/supabaseDb.js';
import { authenticateToken, requireCounselorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Get followups
router.get('/', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const { status = '', student_id = null } = req.query;
    const followups = await db.getFollowups({
      status: status || null,
      studentId: student_id ? parseInt(student_id) : null
    });

    res.json({
      total: followups.length,
      pendingCount: followups.filter(f => f.status === 'PENDING').length,
      followups
    });
  } catch (err) {
    console.error('Get followups error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายการติดตามผล' });
  }
});

// 2. Create followup
router.post('/', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const { student_id, task, due_date, counseling_record_id } = req.body;
    if (!student_id || !task || !due_date) {
      return res.status(400).json({ error: 'ต้องระบุ student_id, task และ due_date' });
    }

    const followup = await db.createFollowup({
      student_id,
      task,
      due_date,
      counseling_record_id: counseling_record_id || null,
      status: 'PENDING'
    });

    await db.updateStudentStatus(student_id, 'FOLLOW_UP');

    res.status(201).json({ message: 'สร้างรายการติดตามผลสำเร็จ', followup });
  } catch (err) {
    console.error('Create followup error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างรายการติดตามผล' });
  }
});

// 3. Complete followup
router.patch('/:id/complete', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const followupId = parseInt(req.params.id);
    const updated = await db.updateFollowupStatus(followupId, 'COMPLETED');
    res.json({ message: 'ทำเครื่องหมายสำเร็จแล้ว', followup: updated });
  } catch (err) {
    console.error('Complete followup error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดต' });
  }
});

// 4. Update status
router.patch('/:id/status', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const followupId = parseInt(req.params.id);
    const { status } = req.body;
    const updated = await db.updateFollowupStatus(followupId, status);
    res.json({ message: 'อัปเดตสถานะสำเร็จ', followup: updated });
  } catch (err) {
    console.error('Update followup status error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  }
});

// 5. Delete followup
router.delete('/:id', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const followupId = parseInt(req.params.id);
    await db.deleteFollowup(followupId);
    res.json({ message: 'ลบรายการติดตามผลสำเร็จ' });
  } catch (err) {
    console.error('Delete followup error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบ' });
  }
});

export default router;
