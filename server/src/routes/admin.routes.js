import express from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { seedDatabase } from '../db/seed.js';

const router = express.Router();

// All routes require Admin role
router.use(authenticateToken, requireRole(['admin']));

// 1. Get all system users
router.get('/users', async (req, res) => {
  try {
    const db = await getDb();
    const users = db.prepare(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.created_at,
        s.id as student_id,
        s.student_code,
        s.class_name,
        s.status as student_status,
        c.id as counselor_id,
        c.department
      FROM users u
      LEFT JOIN students s ON s.user_id = u.id
      LEFT JOIN counselors c ON c.user_id = u.id
      ORDER BY u.id ASC
    `).all();

    res.json({ users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายชื่อผู้ใช้งาน' });
  }
});

// 2. Add Counselor
router.post('/counselors', async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อ อีเมล และรหัสผ่าน' });
    }

    const db = await getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const u = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name.trim(), email.toLowerCase().trim(), hash, 'counselor');
    const c = db.prepare('INSERT INTO counselors (user_id, name, department, phone) VALUES (?, ?, ?, ?)').run(u.lastInsertRowid, name.trim(), department || 'งานแนะแนวและจิตวิทยา', phone || '');

    res.status(201).json({ message: 'เพิ่มครูแนะแนว/ผู้ให้คำปรึกษาสำเร็จ', counselor_id: c.lastInsertRowid });
  } catch (err) {
    console.error('Add counselor error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มผู้ให้คำปรึกษา' });
  }
});

// 3. Reset Demo Seed Data
router.post('/seed-reset', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ message: 'รีเซ็ตข้อมูลตัวอย่าง (Demo Seed Data) เรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Seed reset error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการรีเซ็ตข้อมูล' });
  }
});

// 4. Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'ไม่สามารถลบบัญชีของตนเองที่กำลังใช้งานอยู่ได้' });
    }

    const db = await getDb();
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({ message: 'ลบผู้ใช้งานเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' });
  }
});

export default router;
