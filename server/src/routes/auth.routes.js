import express from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { getDb } from '../db/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

// Google OAuth 2.0 Login / Registration
router.post('/google', async (req, res) => {
  try {
    const { credential, email: directEmail, name: directName, picture: directPic } = req.body;
    let email = directEmail;
    let name = directName || 'ผู้ใช้งาน Google';
    let picture = directPic || '';

    // If credential JWT string is provided from Google Identity Services
    if (credential) {
      try {
        if (process.env.GOOGLE_CLIENT_ID) {
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          email = payload.email;
          name = payload.name || name;
          picture = payload.picture || picture;
        } else {
          // Parse JWT payload safely in dev mode
          const base64Payload = credential.split('.')[1];
          const decoded = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
          email = decoded.email;
          name = decoded.name || name;
          picture = decoded.picture || picture;
        }
      } catch (verifyErr) {
        console.warn('Google token verify fallback:', verifyErr.message);
        const base64Payload = credential.split('.')[1];
        if (base64Payload) {
          const decoded = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
          email = decoded.email;
          name = decoded.name || name;
          picture = decoded.picture || picture;
        }
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'ไม่พบข้อมูลอีเมลจากบัญชี Google กรุณาลองใหม่อีกครั้ง' });
    }

    const db = await getDb();
    let user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(email.toLowerCase().trim());

    // If user does not exist, automatically register as a student
    if (!user) {
      const randomPass = Math.random().toString(36).slice(-8);
      const hash = bcrypt.hashSync(randomPass, 10);
      
      const insertUser = db.prepare(`
        INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)
      `).run(email.toLowerCase().trim(), hash, name, 'student');
      
      const userId = insertUser.lastInsertRowid;
      
      // Generate next student code
      const countRes = db.prepare('SELECT COUNT(*) as count FROM students').get();
      const nextNum = (countRes?.count || 0) + 1;
      const studentCode = `#${String(nextNum).padStart(3, '0')}`;

      const insertStudent = db.prepare(`
        INSERT INTO students (user_id, student_code, class_name, status, avatar)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, studentCode, 'M.5/1', 'ACTIVE', picture);

      // Initialize Tree progress
      db.prepare(`
        INSERT INTO tree_progress (student_id, growth_level, consecutive_checkins, total_checkins, longest_streak)
        VALUES (?, 0, 0, 0, 0)
      `).run(insertStudent.lastInsertRowid);

      user = {
        id: userId,
        email: email.toLowerCase().trim(),
        name,
        role: 'student'
      };
    }

    // Attach student or counselor specific ID
    let studentInfo = null;
    let counselorInfo = null;

    if (user.role === 'student') {
      studentInfo = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id);
    } else if (user.role === 'counselor') {
      counselorInfo = db.prepare('SELECT * FROM counselors WHERE user_id = ?').get(user.id);
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      student_id: studentInfo?.id || null,
      student_code: studentInfo?.student_code || null,
      class_name: studentInfo?.class_name || null,
      counselor_id: counselorInfo?.id || null,
      avatar: picture || studentInfo?.avatar || null
    };

    const token = generateToken(payload);

    res.json({
      message: 'เข้าสู่ระบบด้วย Google สำเร็จ',
      token,
      user: payload
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google', details: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมล/รหัสนักเรียน และรหัสผ่าน' });
    }

    const db = await getDb();
    
    // Support lookup by:
    // 1. Direct Email (case-insensitive)
    // 2. Student code (e.g., '#001' or '001')
    // 3. Username prefix (e.g., 'student1', 'counselor', 'admin')
    let user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(identifier.toLowerCase());

    if (!user) {
      // Try finding student by student_code
      const formattedCode = identifier.startsWith('#') ? identifier : `#${identifier}`;
      const student = db.prepare('SELECT user_id FROM students WHERE student_code = ? OR student_code = ?').get(identifier, formattedCode);
      if (student) {
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(student.user_id);
      }
    }

    if (!user) {
      // Try username prefix match (e.g. "student1" -> "student1@school.ac.th")
      user = db.prepare('SELECT * FROM users WHERE email LIKE ?').get(`${identifier.toLowerCase()}@%`);
    }

    if (!user) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้งาน รหัสนักเรียน หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Attach student or counselor specific ID
    let studentInfo = null;
    let counselorInfo = null;

    if (user.role === 'student') {
      studentInfo = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id);
    } else if (user.role === 'counselor') {
      counselorInfo = db.prepare('SELECT * FROM counselors WHERE user_id = ?').get(user.id);
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      student_id: studentInfo?.id || null,
      student_code: studentInfo?.student_code || null,
      class_name: studentInfo?.class_name || null,
      counselor_id: counselorInfo?.id || null,
    };

    const token = generateToken(payload);

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: payload
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้งาน' });
    }

    let extra = {};
    if (user.role === 'student') {
      const student = db.prepare(`
        SELECT s.id as student_id, s.student_code, s.class_name, s.status,
               tp.growth_level, tp.consecutive_checkins, tp.total_checkins, tp.longest_streak
        FROM students s
        LEFT JOIN tree_progress tp ON tp.student_id = s.id
        WHERE s.user_id = ?
      `).get(user.id);
      extra = { student };
    } else if (user.role === 'counselor') {
      const counselor = db.prepare('SELECT id as counselor_id, name, department, phone FROM counselors WHERE user_id = ?').get(user.id);
      extra = { counselor };
    }

    res.json({
      user: {
        ...user,
        ...extra
      }
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดของระบบ' });
  }
});

// Check system data mode (Production vs Demo)
router.get('/system-mode', async (req, res) => {
  try {
    const db = await getDb();
    const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    const isDemoMode = studentCount > 0;
    res.json({
      isDemoMode,
      studentCount,
      modeName: isDemoMode ? 'Demo Mode (โหมดข้อมูลจำลอง)' : 'Production Mode (โหมดข้อมูลจริง)'
    });
  } catch (err) {
    console.error('System mode error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบโหมดของระบบ' });
  }
});

// Toggle to Demo Mode (Seed Demo Data)
router.post('/demo-seed', async (req, res) => {
  try {
    const { seedDemoData } = await import('../db/seed.js');
    await seedDemoData();
    res.json({
      message: 'เปิดใช้งานโหมดจำลอง (Demo Mode) พร้อมข้อมูลตัวอย่างเรียบร้อยแล้ว',
      isDemoMode: true
    });
  } catch (err) {
    console.error('Demo seed error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการโหลดข้อมูลตัวอย่าง' });
  }
});

// Toggle back to Clean Production Baseline (Clean Data)
router.post('/clean-reset', async (req, res) => {
  try {
    const { seedProductionBase } = await import('../db/seed.js');
    await seedProductionBase();
    res.json({
      message: 'สลับกลับสู่โหมดข้อมูลจริง (Clean Production Mode) เรียบร้อยแล้ว',
      isDemoMode: false
    });
  } catch (err) {
    console.error('Clean reset error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการรีเซ็ตข้อมูลจริง' });
  }
});

export default router;
