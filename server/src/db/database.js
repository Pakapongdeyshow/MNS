import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = Boolean(process.env.VERCEL);
const dataDir = isVercel ? '/tmp' : path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'mindnote.db');

let rawDb = null;

// Helper to save db buffer to file
export function saveDatabase() {
  if (rawDb) {
    const data = rawDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Initialize database instance
export async function getDb() {
  if (rawDb) return dbWrapper;

  const SQL = await initSqlJs({
    locateFile: (file) => {
      try {
        const resolved = require.resolve(`sql.js/dist/${file}`);
        if (fs.existsSync(resolved)) return resolved;
      } catch (e) {
        // continue to candidates
      }

      const candidates = [
        path.resolve(__dirname, `../../node_modules/sql.js/dist/${file}`),
        path.resolve(__dirname, `../../../node_modules/sql.js/dist/${file}`),
        path.resolve(process.cwd(), `node_modules/sql.js/dist/${file}`),
        path.resolve(process.cwd(), `server/node_modules/sql.js/dist/${file}`),
        `/var/task/node_modules/sql.js/dist/${file}`,
        `/var/task/server/node_modules/sql.js/dist/${file}`
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) return p;
      }
      return file;
    }
  });

  if (fs.existsSync(dbPath)) {
    try {
      const fileBuffer = fs.readFileSync(dbPath);
      rawDb = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Could not read existing db, creating fresh in-memory db:', e.message);
      rawDb = new SQL.Database();
    }
  } else {
    rawDb = new SQL.Database();
  }

  // Enable foreign keys
  rawDb.run('PRAGMA foreign_keys = ON;');

  return dbWrapper;
}

// Wrapper to provide ergonomic better-sqlite3-like API
export const dbWrapper = {
  exec(sql) {
    rawDb.run(sql);
    saveDatabase();
  },
  run(sql, params = []) {
    const stmt = rawDb.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    
    // Get last insert rowid
    let lastInsertRowid = 0;
    try {
      const res = rawDb.exec('SELECT last_insert_rowid() AS id;');
      if (res && res[0] && res[0].values && res[0].values[0]) {
        lastInsertRowid = res[0].values[0][0];
      }
    } catch (e) {
      // ignore
    }

    saveDatabase();
    return { lastInsertRowid };
  },
  query(sql, params = []) {
    const stmt = rawDb.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  },
  queryOne(sql, params = []) {
    const results = this.query(sql, params);
    return results[0] || null;
  },
  prepare(sql) {
    return {
      run: (...params) => {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        return dbWrapper.run(sql, flatParams);
      },
      all: (...params) => {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        return dbWrapper.query(sql, flatParams);
      },
      get: (...params) => {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        return dbWrapper.queryOne(sql, flatParams);
      }
    };
  }
};

export async function initDatabase() {
  const db = await getDb();

  const schema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'counselor', 'admin')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Students table
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      student_code TEXT UNIQUE NOT NULL,
      class_name TEXT NOT NULL,
      status TEXT CHECK(status IN ('ACTIVE', 'FOLLOW_UP', 'WAITING_APPOINTMENT', 'NO_FOLLOW_UP')) DEFAULT 'ACTIVE',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Counselors table
    CREATE TABLE IF NOT EXISTS counselors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      department TEXT DEFAULT 'งานแนะแนวและจิตวิทยา',
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Counseling records table
    CREATE TABLE IF NOT EXISTS counseling_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      counselor_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      topic TEXT NOT NULL,
      key_points TEXT,
      student_needs TEXT,
      discussion TEXT,
      follow_up_note TEXT,
      next_appointment TEXT,
      category TEXT DEFAULT 'ACADEMIC',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (counselor_id) REFERENCES counselors(id) ON DELETE RESTRICT
    );

    -- Mood check-ins table
    CREATE TABLE IF NOT EXISTS mood_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      mood TEXT CHECK(mood IN ('VERY_GOOD', 'GOOD', 'NEUTRAL', 'WORRIED', 'NOT_GOOD')) NOT NULL,
      note TEXT,
      checkin_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, checkin_date),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- Tree progress table
    CREATE TABLE IF NOT EXISTS tree_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER UNIQUE NOT NULL,
      growth_level INTEGER DEFAULT 0,
      consecutive_checkins INTEGER DEFAULT 0,
      total_checkins INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_checkin_date TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- Appointments table
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      counselor_id INTEGER NOT NULL,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      topic TEXT NOT NULL,
      status TEXT CHECK(status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')) DEFAULT 'SCHEDULED',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (counselor_id) REFERENCES counselors(id) ON DELETE RESTRICT
    );

    -- Follow-ups table
    CREATE TABLE IF NOT EXISTS followups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      counseling_record_id INTEGER,
      task TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT CHECK(status IN ('PENDING', 'COMPLETED', 'CANCELLED')) DEFAULT 'PENDING',
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (counseling_record_id) REFERENCES counseling_records(id) ON DELETE SET NULL
    );

    -- Gratitude Notes table (Self-Care Gratitude Jar)
    CREATE TABLE IF NOT EXISTS gratitude_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      color TEXT DEFAULT 'amber',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- Student Referrals table (Homeroom Teacher Referral System)
    CREATE TABLE IF NOT EXISTS student_referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      referred_by TEXT NOT NULL,
      teacher_role TEXT DEFAULT 'ครูประจำชั้น',
      reason TEXT NOT NULL,
      observed_behavior TEXT,
      urgency TEXT CHECK(urgency IN ('HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
      status TEXT CHECK(status IN ('PENDING', 'ACCEPTED', 'COMPLETED', 'DECLINED')) DEFAULT 'PENDING',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- SOS Emergency Alerts table
    CREATE TABLE IF NOT EXISTS sos_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      details TEXT,
      status TEXT CHECK(status IN ('ACTIVE', 'RESOLVED')) DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_name);
    CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);
    CREATE INDEX IF NOT EXISTS idx_mood_student_date ON mood_checkins(student_id, checkin_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date, status);
    CREATE INDEX IF NOT EXISTS idx_followups_due ON followups(due_date, status);
    CREATE INDEX IF NOT EXISTS idx_gratitude_student ON gratitude_notes(student_id);
    CREATE INDEX IF NOT EXISTS idx_referrals_status ON student_referrals(status, urgency);
  `;

  db.exec(schema);
  
  // Auto-seed production baseline if database is fresh
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
    if (userCount === 0) {
      const { seedProductionBase } = await import('./seed.js');
      await seedProductionBase();
    }
  } catch (seedErr) {
    console.warn('Auto-seed notice:', seedErr.message);
  }

  console.log('✅ SQLite Database schema initialized with Production extensions (Gratitude, Referrals, SOS)');
  return db;
}
