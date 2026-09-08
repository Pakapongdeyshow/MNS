import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken, enforceStudentOwnership } from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate tree growth level from total checkins
export function calculateGrowthLevel(totalCheckins) {
  if (totalCheckins >= 30) return 5; // Mature Tree
  if (totalCheckins >= 14) return 4; // Growing Tree
  if (totalCheckins >= 7) return 3;  // Small Tree
  if (totalCheckins >= 3) return 2;  // Young Plant
  if (totalCheckins >= 1) return 1;  // Sprout
  return 0; // Seed
}

// Map mood to weather environment
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
    const db = await getDb();

    // Check if already checked in today
    const existing = db.prepare('SELECT * FROM mood_checkins WHERE student_id = ? AND checkin_date = ?').get(studentId, todayDate);
    if (existing) {
      return res.status(409).json({
        error: 'วันนี้คุณเช็กอินแล้ว',
        alreadyCheckedIn: true,
        checkin: existing
      });
    }

    // Insert new check-in
    db.prepare(`
      INSERT INTO mood_checkins (student_id, mood, note, checkin_date)
      VALUES (?, ?, ?, ?)
    `).run(studentId, mood, note || '', todayDate);

    // Get or initialize tree_progress
    let progress = db.prepare('SELECT * FROM tree_progress WHERE student_id = ?').get(studentId);
    if (!progress) {
      db.prepare(`
        INSERT INTO tree_progress (student_id, growth_level, consecutive_checkins, total_checkins, longest_streak, last_checkin_date)
        VALUES (?, 0, 0, 0, 0, NULL)
      `).run(studentId);
      progress = { growth_level: 0, consecutive_checkins: 0, total_checkins: 0, longest_streak: 0, last_checkin_date: null };
    }

    // Calculate streak
    let newStreak = 1;
    if (progress.last_checkin_date) {
      const lastDate = new Date(progress.last_checkin_date);
      const currDate = new Date(todayDate);
      const diffTime = Math.abs(currDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = (progress.consecutive_checkins || 0) + 1;
      } else if (diffDays === 0) {
        newStreak = progress.consecutive_checkins || 1;
      } else {
        // Streak resets to 1, but tree never dies or shrinks!
        newStreak = 1;
      }
    }

    const newTotal = (progress.total_checkins || 0) + 1;
    const newGrowthLevel = calculateGrowthLevel(newTotal);
    const newLongestStreak = Math.max(progress.longest_streak || 0, newStreak);

    // Update tree_progress
    db.prepare(`
      UPDATE tree_progress
      SET growth_level = ?, consecutive_checkins = ?, total_checkins = ?, longest_streak = ?, last_checkin_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE student_id = ?
    `).run(newGrowthLevel, newStreak, newTotal, newLongestStreak, todayDate, studentId);

    const weather = getMoodWeather(mood);

    res.status(201).json({
      message: 'เช็กอินอารมณ์เรียบร้อยแล้ว!',
      checkin: {
        student_id: studentId,
        mood,
        note,
        checkin_date: todayDate,
        created_at: new Date().toISOString()
      },
      treeProgress: {
        growth_level: newGrowthLevel,
        consecutive_checkins: newStreak,
        total_checkins: newTotal,
        longest_streak: newLongestStreak,
        last_checkin_date: todayDate
      },
      weather,
      growthUnlocked: newGrowthLevel > (progress.growth_level || 0)
    });
  } catch (err) {
    console.error('Mood checkin error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกการเช็กอิน' });
  }
});

// 2. Today Check-in Status
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.student_id : req.query.student_id;
    if (!studentId) {
      return res.status(400).json({ error: 'ไม่พบรหัสนักเรียน' });
    }

    const todayDate = req.query.date || new Date().toISOString().split('T')[0];
    const db = await getDb();

    const todayCheckin = db.prepare('SELECT * FROM mood_checkins WHERE student_id = ? AND checkin_date = ?').get(studentId, todayDate);
    const progress = db.prepare('SELECT * FROM tree_progress WHERE student_id = ?').get(studentId);

    const latestMood = todayCheckin ? todayCheckin.mood : 'GOOD';
    const weather = getMoodWeather(latestMood);

    res.json({
      checkedIn: !!todayCheckin,
      todayCheckin: todayCheckin || null,
      progress: progress || { growth_level: 0, consecutive_checkins: 0, total_checkins: 0, longest_streak: 0 },
      weather
    });
  } catch (err) {
    console.error('Mood today error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลวันนี้' });
  }
});

// 3. Garden Environment Status
router.get('/garden', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.student_id : req.query.student_id;
    if (!studentId) {
      return res.status(400).json({ error: 'ไม่พบรหัสนักเรียน' });
    }

    const db = await getDb();
    const progress = db.prepare('SELECT * FROM tree_progress WHERE student_id = ?').get(studentId) || {
      growth_level: 0,
      consecutive_checkins: 0,
      total_checkins: 0,
      longest_streak: 0
    };

    const latestCheckin = db.prepare('SELECT * FROM mood_checkins WHERE student_id = ? ORDER BY checkin_date DESC, id DESC LIMIT 1').get(studentId);
    const weather = getMoodWeather(latestCheckin?.mood || 'GOOD');

    res.json({
      progress,
      latestCheckin: latestCheckin || null,
      weather
    });
  } catch (err) {
    console.error('Garden error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล Mind Garden' });
  }
});

// 4. Mood Journey History
router.get('/history', authenticateToken, enforceStudentOwnership, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.student_id : req.query.student_id;
    if (!studentId) {
      return res.status(400).json({ error: 'ไม่พบรหัสนักเรียน' });
    }

    const limit = parseInt(req.query.limit) || 30;
    const db = await getDb();

    const history = db.prepare(`
      SELECT id, mood, note, checkin_date, created_at
      FROM mood_checkins
      WHERE student_id = ?
      ORDER BY checkin_date DESC, id DESC
      LIMIT ?
    `).all(studentId, limit);

    res.json({ history });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงประวัติ Mood Journey' });
  }
});

// 5. Mood Journey Trend (Non-clinical wording)
router.get('/trend', authenticateToken, enforceStudentOwnership, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.student_id : req.query.student_id;
    if (!studentId) {
      return res.status(400).json({ error: 'ไม่พบรหัสนักเรียน' });
    }

    const days = parseInt(req.query.days) || 14;
    const db = await getDb();

    const records = db.prepare(`
      SELECT mood, note, checkin_date
      FROM mood_checkins
      WHERE student_id = ?
      ORDER BY checkin_date ASC
      LIMIT ?
    `).all(studentId, days);

    // Distribution
    const distribution = {
      VERY_GOOD: 0,
      GOOD: 0,
      NEUTRAL: 0,
      WORRIED: 0,
      NOT_GOOD: 0,
      TOTAL: records.length
    };

    records.forEach(r => {
      if (distribution[r.mood] !== undefined) {
        distribution[r.mood]++;
      }
    });

    const progress = db.prepare('SELECT * FROM tree_progress WHERE student_id = ?').get(studentId);

    res.json({
      title: 'แนวโน้มการเช็กอิน (Mood Journey)',
      periodDays: days,
      records,
      distribution,
      progress: progress || { growth_level: 0, consecutive_checkins: 0, total_checkins: 0, longest_streak: 0 }
    });
  } catch (err) {
    console.error('Trend error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแนวโน้มการเช็กอิน' });
  }
});

export default router;
