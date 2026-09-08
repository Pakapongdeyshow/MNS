import express from 'express';
import { db } from '../db/supabaseDb.js';
import { authenticateToken, requireCounselorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Get all referrals
router.get('/', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const referrals = await db.getReferrals();
    res.json({ total: referrals.length, referrals });
  } catch (err) {
    console.error('Get referrals error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายการส่งต่อ' });
  }
});

// 2. Create referral
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, referred_by, teacher_role, reason, observed_behavior, urgency } = req.body;
    if (!student_id || !referred_by || !reason) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }

    const referral = await db.createReferral({
      student_id,
      referred_by,
      teacher_role: teacher_role || 'ครูประจำชั้น',
      reason,
      observed_behavior: observed_behavior || null,
      urgency: urgency || 'MEDIUM',
      status: 'PENDING'
    });

    if (urgency === 'HIGH') {
      await db.updateStudentStatus(student_id, 'WAITING_APPOINTMENT');
    }

    res.status(201).json({ message: 'ส่งเคสให้นักจิตวิทยา/ครูแนะแนวสำเร็จ', referral });
  } catch (err) {
    console.error('Create referral error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งต่อเคส' });
  }
});

// 3. Update referral status
router.patch('/:id/status', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const referralId = parseInt(req.params.id);
    const { status, notes } = req.body;

    const updated = await db.updateReferralStatus(referralId, status, notes);
    res.json({ message: 'อัปเดตสถานะเคสสำเร็จ', referral: updated });
  } catch (err) {
    console.error('Update referral error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดต' });
  }
});

export default router;
