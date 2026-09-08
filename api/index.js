import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from '../server/src/db/database.js';
import authRoutes from '../server/src/routes/auth.routes.js';
import moodRoutes from '../server/src/routes/mood.routes.js';
import studentRoutes from '../server/src/routes/student.routes.js';
import counselingRoutes from '../server/src/routes/counseling.routes.js';
import followupRoutes from '../server/src/routes/followup.routes.js';
import appointmentRoutes from '../server/src/routes/appointment.routes.js';
import dashboardRoutes from '../server/src/routes/dashboard.routes.js';
import adminRoutes from '../server/src/routes/admin.routes.js';
import selfcareRoutes from '../server/src/routes/selfcare.routes.js';
import referralRoutes from '../server/src/routes/referral.routes.js';
import reportRoutes from '../server/src/routes/report.routes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize database safely on serverless requests
let dbInitPromise = null;
function ensureDb() {
  if (!dbInitPromise) {
    dbInitPromise = initDatabase().catch((err) => {
      console.error('Database initialization error:', err);
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
}

app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database service initialization failed', details: err.message });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/counseling', counselingRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/selfcare', selfcareRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/report', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    name: 'MindNote Student (MNS) Production API on Vercel',
    version: '2.0.0',
    environment: 'Vercel Serverless',
    timestamp: new Date().toISOString()
  });
});

export default app;
