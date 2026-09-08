import { supabase } from './supabaseClient.js';
import bcrypt from 'bcryptjs';

export const db = {
  // USERS
  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email.trim().toLowerCase())
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getUserByStudentCode(code) {
    const cleanCode = code.trim();
    const formattedCode = cleanCode.startsWith('#') ? cleanCode : `#${cleanCode}`;
    
    const { data: student, error } = await supabase
      .from('students')
      .select('user_id')
      .or(`student_code.eq.${cleanCode},student_code.eq.${formattedCode}`)
      .maybeSingle();
    
    if (error || !student) return null;
    return this.getUserById(student.user_id);
  },

  async createUser({ name, email, password, role }) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, name, email, role, created_at,
        students ( id, student_code, class_name, status ),
        counselors ( id, department, phone )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async deleteUser(userId) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    if (error) throw error;
    return true;
  },

  // STUDENTS
  async getStudentByUserId(userId) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getStudentById(studentId) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        users ( id, name, email, role )
      `)
      .eq('id', studentId)
      .maybeSingle();
    if (error) throw error;
    if (data && data.users) {
      data.name = data.users.name;
      data.email = data.users.email;
    }
    return data;
  },

  async getNextStudentCode() {
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    const num = (count || 0) + 1;
    return `#${String(num).padStart(3, '0')}`;
  },

  async createStudent({ userId, studentCode, className = 'ม.5/1', status = 'ACTIVE', avatar = null }) {
    const { data, error } = await supabase
      .from('students')
      .insert([{
        user_id: userId,
        student_code: studentCode,
        class_name: className,
        status,
        avatar
      }])
      .select()
      .single();
    if (error) throw error;

    // Initialize Tree Progress
    await supabase.from('tree_progress').insert([{
      student_id: data.id,
      growth_level: 0,
      consecutive_checkins: 0,
      total_checkins: 0,
      longest_streak: 0
    }]);

    return data;
  },

  async getStudents({ search = '', className = '', status = '', risk = '' } = {}) {
    let query = supabase
      .from('students')
      .select(`
        *,
        users ( id, name, email, role ),
        tree_progress ( growth_level, consecutive_checkins, total_checkins, longest_streak )
      `);

    if (className) {
      query = query.eq('class_name', className);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('id', { ascending: true });
    if (error) throw error;

    let students = (data || []).map(st => ({
      ...st,
      name: st.users?.name || 'ไม่ระบุชื่อ',
      email: st.users?.email || '',
      growth_level: st.tree_progress?.[0]?.growth_level || 0,
      tree_progress: st.tree_progress?.[0] || null
    }));

    if (search) {
      const s = search.toLowerCase();
      students = students.filter(st => 
        st.name.toLowerCase().includes(s) || 
        st.student_code.toLowerCase().includes(s) || 
        st.class_name.toLowerCase().includes(s) ||
        st.email.toLowerCase().includes(s)
      );
    }

    return students;
  },

  async updateStudentStatus(studentId, status) {
    const { data, error } = await supabase
      .from('students')
      .update({ status })
      .eq('id', studentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // COUNSELORS
  async getCounselorByUserId(userId) {
    const { data, error } = await supabase
      .from('counselors')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getCounselorById(counselorId) {
    const { data, error } = await supabase
      .from('counselors')
      .select(`
        *,
        users ( id, name, email, role )
      `)
      .eq('id', counselorId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createCounselor({ userId, name, department = 'งานแนะแนวและจิตวิทยา', phone = '' }) {
    const { data, error } = await supabase
      .from('counselors')
      .insert([{
        user_id: userId,
        name: name.trim(),
        department,
        phone
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAllCounselors() {
    const { data, error } = await supabase
      .from('counselors')
      .select(`
        *,
        users ( id, name, email, role )
      `)
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  // MOOD & MIND GARDEN
  async getTodayMood(studentId, todayDate) {
    const { data, error } = await supabase
      .from('mood_checkins')
      .select('*')
      .eq('student_id', studentId)
      .eq('checkin_date', todayDate)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async checkinMood(studentId, mood, note, checkinDate) {
    // Check if already checked in today
    const { data: existing } = await supabase
      .from('mood_checkins')
      .select('*')
      .eq('student_id', studentId)
      .eq('checkin_date', checkinDate)
      .maybeSingle();

    let record = null;
    if (existing) {
      const { data, error } = await supabase
        .from('mood_checkins')
        .update({ mood, note })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      record = data;
    } else {
      const { data, error } = await supabase
        .from('mood_checkins')
        .insert([{ student_id: studentId, mood, note, checkin_date: checkinDate }])
        .select()
        .single();
      if (error) throw error;
      record = data;
    }

    // Update Tree Progress
    let { data: progress } = await supabase
      .from('tree_progress')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (!progress) {
      const { data } = await supabase
        .from('tree_progress')
        .insert([{
          student_id: studentId,
          growth_level: 1,
          consecutive_checkins: 1,
          total_checkins: 1,
          longest_streak: 1,
          last_checkin_date: checkinDate
        }])
        .select()
        .single();
      progress = data;
    } else if (!existing) {
      const lastDate = progress.last_checkin_date ? new Date(progress.last_checkin_date) : null;
      const today = new Date(checkinDate);
      let isConsecutive = false;

      if (lastDate) {
        const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) isConsecutive = true;
      }

      const consecutive = isConsecutive ? (progress.consecutive_checkins || 0) + 1 : 1;
      const total = (progress.total_checkins || 0) + 1;
      const longest = Math.max(progress.longest_streak || 0, consecutive);
      const growthLevel = Math.min(5, Math.floor(total / 3));

      const { data } = await supabase
        .from('tree_progress')
        .update({
          growth_level: growthLevel,
          consecutive_checkins: consecutive,
          total_checkins: total,
          longest_streak: longest,
          last_checkin_date: checkinDate
        })
        .eq('id', progress.id)
        .select()
        .single();
      progress = data;
    }

    return { checkin: record, progress };
  },

  async getTreeProgress(studentId) {
    const { data, error } = await supabase
      .from('tree_progress')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    if (error) throw error;
    return data || {
      student_id: studentId,
      growth_level: 0,
      consecutive_checkins: 0,
      total_checkins: 0,
      longest_streak: 0
    };
  },

  async getMoodHistory(studentId, limit = 30) {
    const { data, error } = await supabase
      .from('mood_checkins')
      .select('*')
      .eq('student_id', studentId)
      .order('checkin_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async getMoodTrend(studentId, days = 14) {
    const { data, error } = await supabase
      .from('mood_checkins')
      .select('*')
      .eq('student_id', studentId)
      .order('checkin_date', { ascending: true })
      .limit(days);
    if (error) throw error;
    return data || [];
  },

  // COUNSELING RECORDS
  async getCounselingRecordsByStudent(studentId) {
    const { data, error } = await supabase
      .from('counseling_records')
      .select(`
        *,
        counselors ( id, name, department )
      `)
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => ({
      ...r,
      counselor_name: r.counselors?.name || 'ครูแนะแนว'
    }));
  },

  async createCounselingRecord(record) {
    const { data, error } = await supabase
      .from('counseling_records')
      .insert([record])
      .select(`
        *,
        counselors ( id, name, department )
      `)
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCounselingRecord(id) {
    const { error } = await supabase
      .from('counseling_records')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // APPOINTMENTS
  async getAppointments({ counselorId = null, studentId = null, date = null, status = null } = {}) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        students ( id, student_code, class_name, users ( id, name, email ) ),
        counselors ( id, name, department )
      `);

    if (counselorId) query = query.eq('counselor_id', counselorId);
    if (studentId) query = query.eq('student_id', studentId);
    if (date) query = query.eq('appointment_date', date);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('appointment_date', { ascending: true });
    if (error) throw error;

    return (data || []).map(a => ({
      ...a,
      student_name: a.students?.users?.name || 'นักเรียน',
      student_code: a.students?.student_code || '',
      class_name: a.students?.class_name || '',
      counselor_name: a.counselors?.name || 'ครูแนะแนว'
    }));
  },

  async createAppointment(data) {
    const { data: appt, error } = await supabase
      .from('appointments')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return appt;
  },

  async updateAppointmentStatus(id, status) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteAppointment(id) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // FOLLOW-UPS
  async getFollowups({ counselorId = null, studentId = null, status = null } = {}) {
    let query = supabase
      .from('followups')
      .select(`
        *,
        students ( id, student_code, class_name, users ( id, name, email ) )
      `);

    if (studentId) query = query.eq('student_id', studentId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('due_date', { ascending: true });
    if (error) throw error;

    return (data || []).map(f => ({
      ...f,
      student_name: f.students?.users?.name || 'นักเรียน',
      student_code: f.students?.student_code || '',
      class_name: f.students?.class_name || ''
    }));
  },

  async createFollowup(data) {
    const { data: res, error } = await supabase
      .from('followups')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return res;
  },

  async updateFollowupStatus(id, status) {
    const updateData = { status };
    if (status === 'COMPLETED') {
      updateData.completed_at = new Date().toISOString();
    }
    const { data, error } = await supabase
      .from('followups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteFollowup(id) {
    const { error } = await supabase
      .from('followups')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // GRATITUDE NOTES
  async getGratitudeNotes(studentId = null) {
    let query = supabase
      .from('gratitude_notes')
      .select(`
        *,
        students ( id, student_code, class_name, users ( id, name ) )
      `);
    if (studentId) query = query.eq('student_id', studentId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(n => ({
      ...n,
      student_name: n.students?.users?.name || 'นักเรียน'
    }));
  },

  async createGratitudeNote(studentId, message, color = 'amber') {
    const { data, error } = await supabase
      .from('gratitude_notes')
      .insert([{ student_id: studentId, message, color }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteGratitudeNote(id) {
    const { error } = await supabase
      .from('gratitude_notes')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // REFERRALS
  async getReferrals() {
    const { data, error } = await supabase
      .from('student_referrals')
      .select(`
        *,
        students ( id, student_code, class_name, users ( id, name, email ) )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => ({
      ...r,
      student_name: r.students?.users?.name || 'นักเรียน',
      student_code: r.students?.student_code || '',
      class_name: r.students?.class_name || ''
    }));
  },

  async createReferral(data) {
    const { data: res, error } = await supabase
      .from('student_referrals')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return res;
  },

  async updateReferralStatus(id, status, notes) {
    const updateData = { status };
    if (notes) updateData.notes = notes;
    const { data, error } = await supabase
      .from('student_referrals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // DASHBOARD STATS
  async getDashboardStats() {
    const [
      { count: totalStudents },
      { count: totalAppointments },
      { count: pendingFollowups },
      { count: totalSessions },
      { count: totalCheckins }
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'SCHEDULED'),
      supabase.from('followups').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('counseling_records').select('*', { count: 'exact', head: true }),
      supabase.from('mood_checkins').select('*', { count: 'exact', head: true })
    ]);

    // Risk students
    const { data: riskStudents } = await supabase
      .from('students')
      .select(`
        *,
        users ( id, name, email )
      `)
      .in('status', ['FOLLOW_UP', 'WAITING_APPOINTMENT'])
      .limit(10);

    // Recent Moods
    const { data: recentMoods } = await supabase
      .from('mood_checkins')
      .select(`
        *,
        students ( id, student_code, class_name, users ( id, name ) )
      `)
      .order('checkin_date', { ascending: false })
      .limit(10);

    return {
      totalStudents: totalStudents || 0,
      scheduledAppointments: totalAppointments || 0,
      pendingFollowups: pendingFollowups || 0,
      totalSessions: totalSessions || 0,
      totalCheckins: totalCheckins || 0,
      riskStudents: (riskStudents || []).map(s => ({
        ...s,
        name: s.users?.name || 'นักเรียน'
      })),
      recentMoods: (recentMoods || []).map(m => ({
        ...m,
        student_name: m.students?.users?.name || 'นักเรียน',
        student_code: m.students?.student_code || '',
        class_name: m.students?.class_name || ''
      }))
    };
  }
};
