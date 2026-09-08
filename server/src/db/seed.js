import bcrypt from 'bcryptjs';
import { initDatabase, getDb } from './database.js';

// Clean Real Production Baseline (Real Staff, 0 Mock Students)
export async function seedProductionBase() {
  console.log('🏛️ Initializing clean Production baseline database...');
  const db = await initDatabase();

  db.exec(`
    DELETE FROM gratitude_notes;
    DELETE FROM student_referrals;
    DELETE FROM sos_alerts;
    DELETE FROM followups;
    DELETE FROM appointments;
    DELETE FROM mood_checkins;
    DELETE FROM tree_progress;
    DELETE FROM counseling_records;
    DELETE FROM counselors;
    DELETE FROM students;
    DELETE FROM users;
  `);

  const salt = bcrypt.genSaltSync(10);
  const adminPass = bcrypt.hashSync('admin123', salt);
  const counselorPass = bcrypt.hashSync('counselor123', salt);

  // Real Official Admin
  const userAdmin = db.prepare(`
    INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)
  `).run('admin@school.ac.th', adminPass, 'ผู้ดูแลระบบสถานศึกษา (Admin)', 'admin');

  // Real Counselor
  const userCounselor = db.prepare(`
    INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)
  `).run('counselor@school.ac.th', counselorPass, 'อ.พิมพา ใจดี', 'counselor');

  db.prepare(`
    INSERT INTO counselors (user_id, name, department, phone) VALUES (?, ?, ?, ?)
  `).run(userCounselor.lastInsertRowid, 'อ.พิมพา ใจดี', 'งานแนะแนวและจิตวิทยาการศึกษา', '081-234-5678');

  console.log('✅ Clean Production baseline ready.');
  return db;
}

export async function seedDemoData() {
  console.log('🌱 Seeding MindNote Student database with rich Demo presentation data...');
  const db = await initDatabase();

  // Clear existing data in reverse order of foreign keys
  db.exec(`
    DELETE FROM gratitude_notes;
    DELETE FROM student_referrals;
    DELETE FROM sos_alerts;
    DELETE FROM followups;
    DELETE FROM appointments;
    DELETE FROM mood_checkins;
    DELETE FROM tree_progress;
    DELETE FROM counseling_records;
    DELETE FROM counselors;
    DELETE FROM students;
    DELETE FROM users;
  `);

  const salt = bcrypt.genSaltSync(10);
  const adminPass = bcrypt.hashSync('admin123', salt);
  const counselorPass = bcrypt.hashSync('counselor123', salt);
  const studentPass = bcrypt.hashSync('student123', salt);

  // 1. Insert Users
  const userAdmin = db.prepare(`
    INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)
  `).run('admin@school.ac.th', adminPass, 'ผู้ดูแลระบบ (Admin)', 'admin');

  const userCounselor1 = db.prepare(`
    INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)
  `).run('counselor@school.ac.th', counselorPass, 'อ.พิมพา ใจดี', 'counselor');

  const userCounselor2 = db.prepare(`
    INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)
  `).run('counselor2@school.ac.th', counselorPass, 'อ.วิชาญ เมตตา', 'counselor');

  // Insert Counselors
  const counselor1 = db.prepare(`
    INSERT INTO counselors (user_id, name, department, phone) VALUES (?, ?, ?, ?)
  `).run(userCounselor1.lastInsertRowid, 'อ.พิมพา ใจดี', 'งานแนะแนวและจิตวิทยาการศึกษา', '081-234-5678');

  const counselor2 = db.prepare(`
    INSERT INTO counselors (user_id, name, department, phone) VALUES (?, ?, ?, ?)
  `).run(userCounselor2.lastInsertRowid, 'อ.วิชาญ เมตตา', 'งานแนะแนวและพัฒนาศักยภาพ', '089-876-5432');

  // Insert Students Data
  const studentData = [
    { code: '#001', name: 'กิตติพงษ์ สุขสวัสดิ์', email: 'student1@school.ac.th', class: 'M.5/1', status: 'FOLLOW_UP', streak: 7, total: 12, growth: 3 },
    { code: '#002', name: 'พิมพ์ชนก วิริยะ', email: 'student2@school.ac.th', class: 'M.5/1', status: 'ACTIVE', streak: 14, total: 22, growth: 4 },
    { code: '#003', name: 'ชานนท์ รุ่งเรือง', email: 'student3@school.ac.th', class: 'M.5/2', status: 'WAITING_APPOINTMENT', streak: 3, total: 5, growth: 2 },
    { code: '#004', name: 'ณัฐธิดา สดใส', email: 'student4@school.ac.th', class: 'M.5/2', status: 'ACTIVE', streak: 30, total: 35, growth: 5 },
    { code: '#005', name: 'ธนภัทร มุ่งมั่น', email: 'student5@school.ac.th', class: 'M.6/1', status: 'NO_FOLLOW_UP', streak: 0, total: 0, growth: 0 },
  ];

  const studentIds = [];

  for (const s of studentData) {
    const u = db.prepare(`
      INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)
    `).run(s.email, studentPass, s.name, 'student');

    const st = db.prepare(`
      INSERT INTO students (user_id, student_code, class_name, status) VALUES (?, ?, ?, ?)
    `).run(u.lastInsertRowid, s.code, s.class, s.status);

    studentIds.push({ id: st.lastInsertRowid, ...s });

    // Tree progress
    db.prepare(`
      INSERT INTO tree_progress (student_id, growth_level, consecutive_checkins, total_checkins, longest_streak, last_checkin_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(st.lastInsertRowid, s.growth, s.streak, s.total, Math.max(s.streak, 10), '2026-09-07');
  }

  // Generate Mood Check-ins for Student 1
  const today = new Date('2026-09-08');
  const moodsPool = ['VERY_GOOD', 'GOOD', 'GOOD', 'NEUTRAL', 'WORRIED', 'GOOD', 'VERY_GOOD'];
  const notesPool = [
    'วันนี้เริ่มเข้าใจวิชาฟิสิกส์มากขึ้น รู้สึกโล่งใจ',
    'ได้คุยกับเพื่อนตอนพักเที่ยง สนุกดี',
    'ทำการบ้านเสร็จตามเวลาที่วางไว้',
    'รู้สึกเหนื่อยนิดหน่อยจากการซ้อมกีฬา',
    'กังวลเรื่องสอบย่อยสัปดาห์หน้า แต่จะพยายามเตรียมตัว',
    'ได้ฟังเพลงที่ชอบแล้วรู้สึกผ่อนคลาย',
    'วันนี้รู้สึกสดชื่นและมีพลังใจดี'
  ];

  for (let i = 13; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const mood = moodsPool[i % moodsPool.length];
    const note = notesPool[i % notesPool.length];

    db.prepare(`
      INSERT INTO mood_checkins (student_id, mood, note, checkin_date)
      VALUES (?, ?, ?, ?)
    `).run(studentIds[0].id, mood, note, dateStr);
  }

  // Student 2 Moods (20 days)
  for (let i = 20; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const mood = i % 4 === 0 ? 'NEUTRAL' : (i % 3 === 0 ? 'VERY_GOOD' : 'GOOD');
    db.prepare(`
      INSERT INTO mood_checkins (student_id, mood, note, checkin_date)
      VALUES (?, ?, ?, ?)
    `).run(studentIds[1].id, mood, 'บันทึกความรู้สึกประจำวัน', dateStr);
  }

  // Insert Counseling Records
  const rec1 = db.prepare(`
    INSERT INTO counseling_records (student_id, counselor_id, date, topic, key_points, student_needs, discussion, follow_up_note, next_appointment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    studentIds[0].id,
    counselor1.lastInsertRowid,
    '2026-08-25',
    'การปรับตัวและการจัดการความเครียดเรื่องการเรียน',
    'นักเรียนมีความกังวลเรื่องการเตรียมตัวสอบและจัดเวลาอ่านหนังสือไม่ทัน',
    'ต้องการแนวทางการวางตารางอ่านหนังสือและเทคนิคการผ่อนคลาย',
    'พูดคุยเรื่องการจัดลำดับความสำคัญ (Eisenhower Matrix) และการพักผ่อนอย่างมีคุณภาพ',
    'ติดตามการนำตารางอ่านหนังสือไปปรับใช้จริงใน 1 สัปดาห์',
    '2026-09-01'
  );

  const rec2 = db.prepare(`
    INSERT INTO counseling_records (student_id, counselor_id, date, topic, key_points, student_needs, discussion, follow_up_note, next_appointment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    studentIds[0].id,
    counselor1.lastInsertRowid,
    '2026-09-01',
    'ติดตามผลการจัดการเวลาและสัมพันธภาพกับเพื่อน',
    'นักเรียนปรับตารางได้ดีขึ้น มีเวลาพักผ่อนมากขึ้น ความกังวลลดลง',
    'เสริมสร้างความมั่นใจในการทำกิจกรรมกลุ่ม',
    'ประเมินความก้าวหน้า ชื่นชมความพยายาม และวางเป้าหมายระยะสั้นสำหรับสัปดาห์ถัดไป',
    'ติดตามการทำแบบฝึกหัดร่วมกับกลุ่มเพื่อน',
    '2026-09-15'
  );

  // Insert Follow-up tasks
  db.prepare(`
    INSERT INTO followups (student_id, counseling_record_id, task, due_date, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(studentIds[0].id, rec1.lastInsertRowid, 'ส่งแบบบันทึกตารางการอ่านหนังสือประจำสัปดาห์', '2026-09-05', 'PENDING');

  db.prepare(`
    INSERT INTO followups (student_id, counseling_record_id, task, due_date, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(studentIds[0].id, rec2.lastInsertRowid, 'ติดตามการปรับตารางอ่านหนังสือและพักผ่อน 8 ชม.', '2026-09-08', 'PENDING');

  db.prepare(`
    INSERT INTO followups (student_id, counseling_record_id, task, due_date, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(studentIds[2].id, null, 'นัดพูดคุยสรุปเป้าหมายการเลือกสายการเรียนต่อระดับอุดมศึกษา', '2026-09-15', 'PENDING');

  db.prepare(`
    INSERT INTO followups (student_id, counseling_record_id, task, due_date, status, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(studentIds[1].id, null, 'ทบทวนเป้าหมายการสอบเข้ามหาวิทยาลัยรอบ Portfolio', '2026-09-02', 'COMPLETED', '2026-09-02 14:30:00');

  // Insert Appointments
  db.prepare(`
    INSERT INTO appointments (student_id, counselor_id, appointment_date, appointment_time, topic, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(studentIds[0].id, counselor1.lastInsertRowid, '2026-09-08', '14:00', 'ติดตามความก้าวหน้าการเรียนและวางแผนสอบกลางภาค', 'SCHEDULED', 'ห้องแนะแนว 2 อาคาร 3');

  db.prepare(`
    INSERT INTO appointments (student_id, counselor_id, appointment_date, appointment_time, topic, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(studentIds[2].id, counselor1.lastInsertRowid, '2026-09-10', '10:30', 'ปรึกษาแนวทางการเลือกคณะและการสอบ TGAT/TPAT', 'SCHEDULED', 'ห้องแนะแนว 1 อาคาร 3');

  // Insert Gratitude Jar Notes for Student 1
  const gratitudeList = [
    { msg: 'ขอบคุณเพื่อนสนิทที่แบ่งปันสรุปวิชาเคมีให้', color: 'emerald' },
    { msg: 'วันนี้ได้เห็นท้องฟ้าโปร่งและมีลมพัดเย็นสบาย', color: 'sky' },
    { msg: 'คุณแม่ทำอาหารเช้าเมนูโปรดให้ก่อนมาโรงเรียน', color: 'amber' },
    { msg: 'ภูมิใจที่จัดตารางอ่านหนังสือได้สำเร็จครบ 3 วัน', color: 'rose' }
  ];

  for (const g of gratitudeList) {
    db.prepare(`
      INSERT INTO gratitude_notes (student_id, message, color)
      VALUES (?, ?, ?)
    `).run(studentIds[0].id, g.msg, g.color);
  }

  // Insert Homeroom Teacher Referrals
  db.prepare(`
    INSERT INTO student_referrals (student_id, referred_by, teacher_role, reason, observed_behavior, urgency, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    studentIds[2].id,
    'ครูสมชาย รักเรียน',
    'ครูประจำชั้น ม.5/2',
    'นักเรียนดูเงียบผิดปกติและขาดส่งงานในรายวิชาหลัก',
    'มักนั่งเหม่อลอยในคาบเรียนช่วงบ่าย อยากให้คุณครูแนะแนวช่วยพูดคุยสำรวจสภาพจิตใจ',
    'MEDIUM',
    'PENDING',
    'ประสานงานผ่านห้องแนะแนว'
  );

  db.prepare(`
    INSERT INTO student_referrals (student_id, referred_by, teacher_role, reason, observed_behavior, urgency, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    studentIds[0].id,
    'ครูรัตนา เมตตา',
    'ครูประจำชั้น ม.5/1',
    'นักเรียนมีความกังวลเรื่องการสอบแข่งขันวิชาการ',
    'ตั้งใจเรียนดีมาก แต่อยากได้รับการเสริมทักษะการผ่อนคลายความเครียด',
    'LOW',
    'ACCEPTED',
    'ได้นัดหมายในตารางแล้ว'
  );

  console.log('✅ Production demo seed data created successfully!');
}

export const seedDatabase = seedDemoData;

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDemoData().catch(console.error);
}

