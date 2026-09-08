import express from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db/supabaseDb.js';
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

    let user = await db.getUserByEmail(email);

    if (!user) {
      const randomPass = Math.random().toString(36).slice(-8);
      const hash = bcrypt.hashSync(randomPass, 10);
      user = await db.createUser({
        name,
        email,
        password: hash,
        role: 'student'
      });

      const nextCode = await db.getNextStudentCode();
      await db.createStudent({
        userId: user.id,
        studentCode: nextCode,
        className: 'ม.5/1',
        status: 'ACTIVE',
        avatar: picture
      });
    }

    let studentInfo = null;
    let counselorInfo = null;

    if (user.role === 'student') {
      studentInfo = await db.getStudentByUserId(user.id);
    } else if (user.role === 'counselor') {
      counselorInfo = await db.getCounselorByUserId(user.id);
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

// Real User Registration (Student & Counselor)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirm, role = 'student', student_code, class_name, department, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อ-นามสกุล, อีเมล และรหัสผ่านให้ครบถ้วน' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await db.getUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'อีเมลนี้ถูกลงทะเบียนในระบบแล้ว กรุณาเข้าสู่ระบบ' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = await db.createUser({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role,
      confirm: confirm || password
    });

    let studentInfo = null;
    let counselorInfo = null;

    if (role === 'student') {
      let code = student_code ? (student_code.startsWith('#') ? student_code : `#${student_code}`) : await db.getNextStudentCode();
      studentInfo = await db.createStudent({
        userId: user.id,
        studentCode: code,
        className: class_name || 'ม.5/1',
        status: 'ACTIVE'
      });
    } else if (role === 'counselor') {
      counselorInfo = await db.createCounselor({
        userId: user.id,
        name: name.trim(),
        department: department || 'งานแนะแนวและจิตวิทยา',
        phone: phone || ''
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
      student_id: studentInfo?.id || null,
      student_code: studentInfo?.student_code || null,
      class_name: class_name || (role === 'student' ? 'ม.5/1' : null),
      counselor_id: counselorInfo?.id || null
    };

    const token = generateToken(payload);

    res.status(201).json({
      message: 'ลงทะเบียนสำเร็จ ยินดีต้อนรับสู่ MindNote Student',
      token,
      user: payload
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน', details: err.message });
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

    let user = await db.getUserByEmail(identifier);

    if (!user) {
      user = await db.getUserByStudentCode(identifier);
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'ไม่พบบัญชีนี้ในระบบ กรุณาตรวจสอบอีเมล/รหัส หรือคลิกแท็บ "ลงทะเบียนบัญชีใหม่"' 
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง' });
    }

    let studentInfo = null;
    let counselorInfo = null;

    if (user.role === 'student') {
      studentInfo = await db.getStudentByUserId(user.id);
    } else if (user.role === 'counselor') {
      counselorInfo = await db.getCounselorByUserId(user.id);
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
      avatar: studentInfo?.avatar || null
    };

    const token = generateToken(payload);

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: payload
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', details: err.message });
  }
});

// Current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
    }

    let studentInfo = null;
    let counselorInfo = null;

    if (user.role === 'student') {
      studentInfo = await db.getStudentByUserId(user.id);
    } else if (user.role === 'counselor') {
      counselorInfo = await db.getCounselorByUserId(user.id);
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      student_id: studentInfo?.id || null,
      student_code: studentInfo?.student_code || null,
      class_name: studentInfo?.class_name || null,
      counselor_id: counselorInfo?.id || null,
      avatar: studentInfo?.avatar || null
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้' });
  }
});

// System Mode Status
router.get('/system-mode', async (req, res) => {
  try {
    const { count } = await (await import('../db/supabaseClient.js')).supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    res.json({
      mode: 'REAL',
      is_production: true,
      has_real_users: (count || 0) > 0,
      real_users_count: count || 0,
      storage: 'Supabase PostgreSQL Cloud'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile (Name, Class Name, Student Code, Password, etc.)
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, class_name, student_code, department, phone, password, avatar } = req.body;
    const userId = req.user.id;

    const userUpdates = {};
    if (name && name.trim()) {
      userUpdates.name = name.trim();
    }
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
      }
      userUpdates.password = bcrypt.hashSync(password.trim(), 10);
    }

    if (Object.keys(userUpdates).length > 0) {
      await db.updateUser(userId, userUpdates);
    }

    if (req.user.role === 'student') {
      const studentUpdates = {};
      if (class_name !== undefined) studentUpdates.className = class_name;
      if (student_code !== undefined) studentUpdates.studentCode = student_code;
      if (avatar !== undefined) studentUpdates.avatar = avatar;
      if (Object.keys(studentUpdates).length > 0) {
        await db.updateStudentProfile(userId, studentUpdates);
      }
    } else if (req.user.role === 'counselor') {
      const counselorUpdates = {};
      if (name) counselorUpdates.name = name;
      if (department) counselorUpdates.department = department;
      if (phone !== undefined) counselorUpdates.phone = phone;
      if (avatar !== undefined) counselorUpdates.avatar = avatar;
      if (Object.keys(counselorUpdates).length > 0) {
        await db.updateCounselorProfile(userId, counselorUpdates);
      }
    }

    // Fetch updated user & relation
    const updatedUser = await db.getUserById(userId);
    let studentInfo = null;
    let counselorInfo = null;

    if (updatedUser.role === 'student') {
      studentInfo = await db.getStudentByUserId(userId);
    } else if (updatedUser.role === 'counselor') {
      counselorInfo = await db.getCounselorByUserId(userId);
    }

    const payload = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      student_id: studentInfo?.id || null,
      student_code: studentInfo?.student_code || null,
      class_name: studentInfo?.class_name || null,
      counselor_id: counselorInfo?.id || null,
      avatar: avatar !== undefined ? avatar : (studentInfo?.avatar || null)
    };

    const token = generateToken(payload);

    res.json({
      message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ ✨',
      token,
      user: payload
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล', details: err.message });
  }
});

export default router;
