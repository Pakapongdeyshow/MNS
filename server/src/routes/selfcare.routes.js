import express from 'express';
import { db } from '../db/supabaseDb.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 1. Get gratitude notes
router.get('/gratitude', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.student_id : (req.query.student_id ? parseInt(req.query.student_id) : null);
    const notes = await db.getGratitudeNotes(studentId);
    res.json({ total: notes.length, notes });
  } catch (err) {
    console.error('Get gratitude notes error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงบันทึกขอบคุณ' });
  }
});

// 2. Create gratitude note
router.post('/gratitude', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.student_id : (req.body.student_id || req.user.student_id);
    const { message, color = 'amber' } = req.body;

    if (!studentId || !message) {
      return res.status(400).json({ error: 'กรุณากรอกข้อความขอบคุณ' });
    }

    const note = await db.createGratitudeNote(studentId, message.trim(), color);
    res.status(201).json({ message: 'บันทึกความรู้สึกขอบคุณสำเร็จ ✨', note });
  } catch (err) {
    console.error('Create gratitude note error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึก' });
  }
});

// 3. Delete gratitude note
router.delete('/gratitude/:id', authenticateToken, async (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    await db.deleteGratitudeNote(noteId);
    res.json({ message: 'ลบโน้ตสำเร็จ' });
  } catch (err) {
    console.error('Delete gratitude note error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบ' });
  }
});

export default router;
