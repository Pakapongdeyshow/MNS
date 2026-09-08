import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/supabaseDb.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({ total: users.length, users });
  } catch (err) {
    console.error('Get admin users error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
});

// 2. Create counselor
router.post('/counselors', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อ อีเมล และรหัสผ่าน' });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = await db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      role: 'counselor'
    });

    const counselor = await db.createCounselor({
      userId: user.id,
      name: name.trim(),
      department: department || 'งานแนะแนวและจิตวิทยา',
      phone: phone || ''
    });

    res.status(201).json({
      message: 'สร้างบัญชีครูแนะแนวสำเร็จ',
      counselor: {
        id: counselor.id,
        user_id: user.id,
        name: user.name,
        email: user.email,
        department: counselor.department,
        phone: counselor.phone
      }
    });
  } catch (err) {
    console.error('Create counselor error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างครูแนะแนว' });
  }
});

// 3. Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'ไม่สามารถลบบัญชีของตัวเองได้' });
    }

    await db.deleteUser(userId);
    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบผู้ใช้' });
  }
});

export default router;
