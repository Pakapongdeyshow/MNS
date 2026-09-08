import express from 'express';
import { db } from '../db/supabaseDb.js';
import { authenticateToken, enforceStudentOwnership } from '../middleware/auth.js';

const router = express.Router();

export function calculateGrowthLevel(totalCheckins) {
  if (totalCheckins >= 30) return 5;
  if (totalCheckins >= 14) return 4;
  if (totalCheckins >= 7) return 3;
  if (totalCheckins >= 3) return 2;
  if (totalCheckins >= 1) return 1;
  return 0;
}

export function getMoodWeather(mood) {
  switch (mood) {
    case 'VERY_GOOD':
      return { code: 'SUNNY', icon: '☀️', label: 'แดดสดใส อบอุ่น', skyGradient: 'from-amber-100 via-sky-100 to-emerald-50' };
    case 'GOOD':
      return { code: 'PARTLY_SUNNY', icon: '🌤️', label: 'มีแดดรำไร เมฆโปร่ง', skyGradient: 'from-sky-100 via-blue-50 to-emerald-50' };
    case 'NEUTRAL':
      return { code: 'CLOUDY', icon: '☁️', label: 'เมฆลอยเอื่อย ผ่อนคลาย', skyGradient: 'from-slate-200 via-sky-100 to-emerald-50' };
    case 'WORRIED':
      return { code: 'LIGHT_RAIN', icon: '🌧️', label: 'ฝนพรำนุ่มนวล ชุ่มชื้น', skyGradient: 'from-slate-300 via-blue-100 to-teal-50' };
    case 'NOT_GOOD':
      return { code: 'RAIN', icon: '🌧️', label: 'สายฝนรดน้ำหล่อเลี้ยง', skyGradient: 'from-slate-400 via-sky-200 to-emerald-50' };
    default:
      return { code: 'PARTLY_SUNNY', icon: '🌤️', label: 'อากาศโปร่งสบาย', skyGradient: 'from-sky-100 via-blue-50 to-emerald-50' };
  }
}

// 1. Mood Check-in
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.student_id : req.body.student_id;
    if (!studentId) {
      return res.status(400).json({ error: 'ไม่พบรหัสนักเรียนสำหรับการเช็กอิน' });
    }

    const { mood, note, date } = req.body;
    const validMoods = ['VERY_GOOD', 'GOOD', 'NEUTRAL', 'WORRIED', 'NOT_GOOD'];

    if (!validMoods.includes(mood)) {
      return res.status(400).json({ error: 'รูปแบบ Mood ไม่ถูกต้อง' });
    }

    const todayDate = date || new Date().toISOString().split('T')[0];

    const result = await db.checkinMood(studentId, mood, note || '', todayDate);

    res.status(201).json({
      message: 'บันทึกความรู้สึกสำเร็จ! ต้นไม้ของคุณได้รับการดูแล 🌱',
      checkin: result.checkin,
      progress: result.progress,
      weather: getMoodWeather(mood)
    });
  } catch (err) {
    console.error('Mood checkin error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเช็กอิน', details: err.message });
  }
});

// 2. Today's Mood Check
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' 
      ? req.user.student_id 
      : (req.query.student_id ? parseInt(req.query.student_id) : null);

    if (!studentId) {
      return res.status(400).json({ error: 'ต้องระบุ student_id' });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const todayCheckin = await db.getTodayMood(studentId, todayDate);
    const progress = await db.getTreeProgress(studentId);

    res.json({
      checkedInToday: !!todayCheckin,
      todayMood: todayCheckin ? todayCheckin.mood : null,
      checkin: todayCheckin,
      progress,
      weather: todayCheckin ? getMoodWeather(todayCheckin.mood) : getMoodWeather('GOOD')
    });
  } catch (err) {
    console.error('Get today mood error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลวันนี้' });
  }
});

// 3. Garden State
router.get('/garden', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' 
      ? req.user.student_id 
      : (req.query.student_id ? parseInt(req.query.student_id) : null);

    if (!studentId) {
      return res.status(400).json({ error: 'ต้องระบุ student_id' });
    }

    const progress = await db.getTreeProgress(studentId);
    const history = await db.getMoodHistory(studentId, 1);
    const latestCheckin = history[0] || null;

    res.json({
      student_id: studentId,
      growth_level: progress.growth_level || 0,
      consecutive_checkins: progress.consecutive_checkins || 0,
      total_checkins: progress.total_checkins || 0,
      longest_streak: progress.longest_streak || 0,
      last_checkin_date: progress.last_checkin_date,
      currentWeather: latestCheckin ? getMoodWeather(latestCheckin.mood) : getMoodWeather('GOOD')
    });
  } catch (err) {
    console.error('Get garden state error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงสถานะ Mind Garden' });
  }
});

// 4. Mood History
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' 
      ? req.user.student_id 
      : (req.query.student_id ? parseInt(req.query.student_id) : null);

    if (!studentId) {
      return res.status(400).json({ error: 'ต้องระบุ student_id' });
    }

    const limit = parseInt(req.query.limit) || 30;
    const history = await db.getMoodHistory(studentId, limit);

    res.json({
      student_id: studentId,
      records: history.map(r => ({
        ...r,
        weather: getMoodWeather(r.mood)
      }))
    });
  } catch (err) {
    console.error('Get mood history error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงประวัติ Mood' });
  }
});

// 5. Mood Trend
router.get('/trend', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' 
      ? req.user.student_id 
      : (req.query.student_id ? parseInt(req.query.student_id) : null);

    if (!studentId) {
      return res.status(400).json({ error: 'ต้องระบุ student_id' });
    }

    const days = parseInt(req.query.days) || 14;
    const records = await db.getMoodTrend(studentId, days);

    const moodScoreMap = {
      'VERY_GOOD': 5,
      'GOOD': 4,
      'NEUTRAL': 3,
      'WORRIED': 2,
      'NOT_GOOD': 1
    };

    const trend = records.map(r => ({
      date: r.checkin_date,
      mood: r.mood,
      score: moodScoreMap[r.mood] || 3,
      note: r.note
    }));

    res.json({
      student_id: studentId,
      days,
      trend
    });
  } catch (err) {
    console.error('Get mood trend error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการคำนวณแนวโน้ม' });
  }
});

export default router;
