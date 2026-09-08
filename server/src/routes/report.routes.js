import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get School Executive Aggregate Report
router.get('/executive-summary', authenticateToken, requireRole(['counselor', 'admin']), async (req, res) => {
  try {
    const db = await getDb();

    // 1. Overall Totals
    const totalStudents = db.prepare('SELECT COUNT(*) as c FROM students').get().c;
    const totalSessions = db.prepare('SELECT COUNT(*) as c FROM counseling_records').get().c;
    const totalAppointments = db.prepare('SELECT COUNT(*) as c FROM appointments').get().c;
    const totalFollowups = db.prepare('SELECT COUNT(*) as c FROM followups').get().c;
    const completedFollowups = db.prepare("SELECT COUNT(*) as c FROM followups WHERE status = 'COMPLETED'").get().c;
    const totalCheckins = db.prepare('SELECT COUNT(*) as c FROM mood_checkins').get().c;

    // 2. Breakdown by Class / Grade Level
    const classStats = db.prepare(`
      SELECT 
        s.class_name,
        COUNT(DISTINCT s.id) as student_count,
        (SELECT COUNT(*) FROM counseling_records cr JOIN students st ON st.id = cr.student_id WHERE st.class_name = s.class_name) as counseling_count,
        (SELECT COUNT(*) FROM mood_checkins mc JOIN students st ON st.id = mc.student_id WHERE st.class_name = s.class_name) as checkin_count
      FROM students s
      GROUP BY s.class_name
      ORDER BY s.class_name ASC
    `).all();

    // 3. Counseling Topics Distribution
    const topics = db.prepare(`
      SELECT topic, COUNT(*) as count
      FROM counseling_records
      GROUP BY topic
      ORDER BY count DESC
      LIMIT 6
    `).all();

    // 4. Overall Mood Distribution (Anonymized)
    const moodDistribution = db.prepare(`
      SELECT mood, COUNT(*) as count
      FROM mood_checkins
      GROUP BY mood
    `).all();

    // 5. Monthly Counseling Trend
    const monthlyTrend = db.prepare(`
      SELECT substr(date, 1, 7) as month, COUNT(*) as count
      FROM counseling_records
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `).all();

    res.json({
      schoolName: 'โรงเรียนสาธิตวิทยาการศึกษา (ตัวอย่าง)',
      academicYear: '2569 / ภาคเรียนที่ 1',
      generatedAt: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
      overview: {
        totalStudents,
        totalSessions,
        totalAppointments,
        totalFollowups,
        completedFollowups,
        followupSuccessRate: totalFollowups > 0 ? Math.round((completedFollowups / totalFollowups) * 100) : 100,
        totalCheckins
      },
      classStats,
      topics,
      moodDistribution,
      monthlyTrend
    });
  } catch (err) {
    console.error('Executive report error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการประมวลผลรายงานสถิติ' });
  }
});

export default router;
