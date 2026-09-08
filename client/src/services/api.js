const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('mns_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }

  if (!response.ok) {
    let errorMsg = data.error || data.message;
    if (!errorMsg) {
      if (response.status === 401) {
        errorMsg = 'ชื่อผู้ใช้งาน รหัสนักเรียน หรือรหัสผ่านไม่ถูกต้อง';
      } else if (response.status === 404) {
        errorMsg = 'ไม่พบบริการ API ที่ร้องขอ (404)';
      } else if (response.status >= 500) {
        errorMsg = 'เซิร์ฟเวอร์ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง';
      } else {
        errorMsg = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
      }
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth & System Mode
  login: (identifier, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: identifier, username: identifier, password })
  }),
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  loginWithGoogle: (credentialData) => request('/auth/google', {
    method: 'POST',
    body: JSON.stringify(credentialData)
  }),
  getMe: () => request('/auth/me'),
  getSystemMode: () => request('/auth/system-mode'),
  seedDemoMode: () => request('/auth/demo-seed', { method: 'POST' }),
  resetCleanMode: () => request('/auth/clean-reset', { method: 'POST' }),

  // Mood & Mind Garden
  checkinMood: (mood, note, date) => request('/mood/checkin', { method: 'POST', body: JSON.stringify({ mood, note, date }) }),
  getTodayMood: (studentId) => request(`/mood/today${studentId ? `?student_id=${studentId}` : ''}`),
  getGardenState: (studentId) => request(`/mood/garden${studentId ? `?student_id=${studentId}` : ''}`),
  getMoodHistory: (studentId, limit = 30) => request(`/mood/history?limit=${limit}${studentId ? `&student_id=${studentId}` : ''}`),
  getMoodTrend: (studentId, days = 14) => request(`/mood/trend?days=${days}${studentId ? `&student_id=${studentId}` : ''}`),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/students${query ? `?${query}` : ''}`);
  },
  getStudentDetail: (id) => request(`/students/${id}`),
  updateStudentStatus: (id, status) => request(`/students/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createStudent: (data) => request('/students', { method: 'POST', body: JSON.stringify(data) }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),

  // Counseling
  getCounselingRecords: (studentId) => request(`/counseling/student/${studentId}`),
  createCounselingRecord: (data) => request('/counseling', { method: 'POST', body: JSON.stringify(data) }),
  deleteCounselingRecord: (id) => request(`/counseling/${id}`, { method: 'DELETE' }),

  // Follow-ups
  getFollowups: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/followups${query ? `?${query}` : ''}`);
  },
  createFollowup: (data) => request('/followups', { method: 'POST', body: JSON.stringify(data) }),
  completeFollowup: (id) => request(`/followups/${id}/complete`, { method: 'PATCH' }),
  updateFollowupStatus: (id, status) => request(`/followups/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteFollowup: (id) => request(`/followups/${id}`, { method: 'DELETE' }),

  // Appointments
  getAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/appointments${query ? `?${query}` : ''}`);
  },
  createAppointment: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointmentStatus: (id, status) => request(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteAppointment: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),

  // Dashboard
  getCounselorDashboard: () => request('/dashboard/counselor'),

  // Admin
  getAdminUsers: () => request('/admin/users'),
  createCounselor: (data) => request('/admin/counselors', { method: 'POST', body: JSON.stringify(data) }),
  resetSeedData: () => request('/admin/seed-reset', { method: 'POST' }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
};
