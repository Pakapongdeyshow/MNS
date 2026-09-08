import express from 'express';
import { db } from '../db/supabaseDb.js';
import { authenticateToken, requireCounselorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/counselor', authenticateToken, requireCounselorOrAdmin, async (req, res) => {
  try {
    const stats = await db.getDashboardStats();

    const todayDate = new Date().toISOString().split('T')[0];
    const todayAppointments = await db.getAppointments({ date: todayDate, status: 'SCHEDULED' });
    const pendingFollowups = await db.getFollowups({ status: 'PENDING' });

    res.json({
      summary: {
        totalStudents: stats.totalStudents,
        scheduledAppointments: stats.scheduledAppointments,
        pendingFollowups: stats.pendingFollowups,
        totalSessions: stats.totalSessions,
        totalCheckins: stats.totalCheckins
      },
      todayAppointments,
      pendingFollowups: pendingFollowups.slice(0, 5),
      riskStudents: stats.riskStudents,
      recentMoods: stats.recentMoods
    });
  } catch (err) {
    console.error('Counselor dashboard error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard' });
  }
});

export default router;
