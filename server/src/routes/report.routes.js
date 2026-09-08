import express from 'express';
import { db } from '../db/supabaseDb.js';
import { authenticateToken, requireCounselorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/overview', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    const students = await db.getStudents();

    // Group by class
    const classMap = {};
    students.forEach(st => {
      const cls = st.class_name || 'ไม่ระบุ';
      if (!classMap[cls]) classMap[cls] = { class_name: cls, total: 0, follow_up: 0 };
      classMap[cls].total++;
      if (st.status === 'FOLLOW_UP' || st.status === 'WAITING_APPOINTMENT') {
        classMap[cls].follow_up++;
      }
    });

    res.json({
      summary: {
        totalStudents: stats.totalStudents,
        totalSessions: stats.totalSessions,
        totalAppointments: stats.scheduledAppointments,
        totalFollowups: stats.pendingFollowups,
        totalCheckins: stats.totalCheckins
      },
      classStats: Object.values(classMap),
      riskStudents: stats.riskStudents
    });
  } catch (err) {
    console.error('Report overview error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างรายงานภาพรวม' });
  }
});

export default router;
