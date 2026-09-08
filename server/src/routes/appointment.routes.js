import express from 'express';
import { db } from '../db/supabaseDb.js';
import { authenticateToken, requireCounselorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Get appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date, status } = req.query;
    let studentId = null;
    let counselorId = null;

    if (req.user.role === 'student') {
      studentId = req.user.student_id;
    } else if (req.user.role === 'counselor') {
      counselorId = req.user.counselor_id;
    }

    const appointments = await db.getAppointments({
      studentId,
      counselorId,
      date: date || null,
      status: status || null
    });

    res.json({
      total: appointments.length,
      appointments
    });
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายการนัดหมาย' });
  }
});

// 2. Create appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, counselor_id, appointment_date, appointment_time, topic, notes } = req.body;

    const finalStudentId = req.user.role === 'student' ? req.user.student_id : (student_id || req.user.student_id);
    const finalCounselorId = counselor_id || req.user.counselor_id || 1;

    if (!finalStudentId || !appointment_date || !appointment_time || !topic) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลการนัดหมายให้ครบถ้วน' });
    }

    const appt = await db.createAppointment({
      student_id: finalStudentId,
      counselor_id: finalCounselorId,
      appointment_date,
      appointment_time,
      topic,
      notes: notes || null,
      status: 'SCHEDULED'
    });

    await db.updateStudentStatus(finalStudentId, 'WAITING_APPOINTMENT');

    res.status(201).json({ message: 'สร้างการนัดหมายสำเร็จ', appointment: appt });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างนัดหมาย' });
  }
});

// 3. Update status
router.patch('/:id/status', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const apptId = parseInt(req.params.id);
    const { status } = req.body;
    const validStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    }

    const updated = await db.updateAppointmentStatus(apptId, status);
    res.json({ message: 'อัปเดตสถานะการนัดหมายสำเร็จ', appointment: updated });
  } catch (err) {
    console.error('Update appointment status error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  }
});

// 4. Delete appointment
router.delete('/:id', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const apptId = parseInt(req.params.id);
    await db.deleteAppointment(apptId);
    res.json({ message: 'ลบการนัดหมายสำเร็จ' });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบนัดหมาย' });
  }
});

export default router;
