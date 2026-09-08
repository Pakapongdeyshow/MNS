import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken, enforceStudentOwnership } from '../middleware/auth.js';

const router = express.Router();

// 1. Get Gratitude Notes for student
router.get('/gratitude', authenticateToken, enforceStudentOwnership, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.student_id : req.query.student_id;
    if (!studentId) {
      return res.status(400).json({ error: 'ไม่พบรหัสนักเรียน' });
    }

    const db = await getDb();
    const notes = db.prepare(`
      SELECT * FROM gratitude_notes
      WHERE student_id = ?
      ORDER BY id DESC
    `).all(studentId);

    res.json({ notes });
  } catch (err) {
    console.error('Get gratitude notes error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงบันทึกขอบคุณ' });
  }
});

// 2. Add Gratitude Note
router.post('/gratitude', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.student_id : req.body.student_id;
    const { message, color } = req.body;

    if (!studentId || !message || !message.trim()) {
      return res.status(400).json({ error: 'กรุณากรอกข้อความเรื่องราวดีๆ' });
    }

    const db = await getDb();
    const validColors = ['amber', 'emerald', 'sky', 'rose', 'purple'];
    const chosenColor = validColors.includes(color) ? color : 'amber';

    const result = db.prepare(`
      INSERT INTO gratitude_notes (student_id, message, color)
      VALUES (?, ?, ?)
    `).run(studentId, message.trim(), chosenColor);

    res.status(201).json({
      message: 'หย่อนการ์ดความสุขลงในขวดโหลเรียบร้อยแล้ว ✨',
      note: {
        id: result.lastInsertRowid,
        student_id: studentId,
        message: message.trim(),
        color: chosenColor,
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Add gratitude note error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกการ์ดความสุข' });
  }
});

// 3. Random Pick a Gratitude Memory from the Jar
router.get('/gratitude/random', authenticateToken, enforceStudentOwnership, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.student_id : req.query.student_id;
    if (!studentId) return res.status(400).json({ error: 'ไม่พบรหัสนักเรียน' });

    const db = await getDb();
    const notes = db.prepare('SELECT * FROM gratitude_notes WHERE student_id = ?').all(studentId);

    if (notes.length === 0) {
      return res.json({ note: null, message: 'ขวดโหลยังว่างอยู่ ลองเพิ่มเรื่องราวดีๆ เรื่องแรกดูนะ 🌱' });
    }

    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    res.json({ note: randomNote });
  } catch (err) {
    console.error('Random gratitude note error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสุ่มหยิบการ์ดความสุข' });
  }
});

// 4. Delete Gratitude Note
router.delete('/gratitude/:id', authenticateToken, async (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    const db = await getDb();
    db.prepare('DELETE FROM gratitude_notes WHERE id = ?').run(noteId);
    res.json({ message: 'ลบการ์ดเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Delete gratitude note error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบการ์ด' });
  }
});

export default router;
