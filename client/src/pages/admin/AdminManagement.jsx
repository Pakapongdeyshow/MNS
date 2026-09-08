import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Trash2, RefreshCw, Sparkles, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { api } from '../../services/api';

export function AdminManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState(null); // 'student' | 'counselor' | null
  const [msg, setMsg] = useState(null);

  // Student Form
  const [stName, setStName] = useState('');
  const [stEmail, setStEmail] = useState('');
  const [stCode, setStCode] = useState('');
  const [stClass, setStClass] = useState('M.5/1');
  const [stPass, setStPass] = useState('student123');

  // Counselor Form
  const [coName, setCoName] = useState('');
  const [coEmail, setCoEmail] = useState('');
  const [coDept, setCoDept] = useState('งานแนะแนวและจิตวิทยาการศึกษา');
  const [coPhone, setCoPhone] = useState('081-000-0000');
  const [coPass, setCoPass] = useState('counselor123');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers();
      setUsers(res.users || []);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.createStudent({
        name: stName,
        email: stEmail,
        student_code: stCode,
        class_name: stClass,
        password: stPass
      });
      setMsg({ type: 'success', text: 'เพิ่มข้อมูลนักเรียนเรียบร้อยแล้ว' });
      setActiveForm(null);
      setStName('');
      setStEmail('');
      setStCode('');
      await fetchUsers();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleAddCounselor = async (e) => {
    e.preventDefault();
    try {
      await api.createCounselor({
        name: coName,
        email: coEmail,
        department: coDept,
        phone: coPhone,
        password: coPass
      });
      setMsg({ type: 'success', text: 'เพิ่มข้อมูลครูแนะแนว/ผู้ให้คำปรึกษาเรียบร้อยแล้ว' });
      setActiveForm(null);
      setCoName('');
      setCoEmail('');
      await fetchUsers();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้ออกจากระบบ?')) return;
    try {
      await api.deleteUser(id);
      setMsg({ type: 'success', text: 'ลบผู้ใช้งานเรียบร้อยแล้ว' });
      await fetchUsers();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('คำเตือน: การรีเซ็ตข้อมูลตัวอย่างจะลบและสร้างฐานข้อมูลใหม่ทั้งหมด คุณต้องการดำเนินการต่อหรือไม่?')) return;
    try {
      setLoading(true);
      await api.resetSeedData();
      setMsg({ type: 'success', text: 'รีเซ็ตข้อมูลตัวอย่าง (Demo Seed Data) สำเร็จแล้ว!' });
      await fetchUsers();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-24 lg:pb-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            จัดการระบบและผู้ใช้งาน 👑
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            จัดการบัญชีผู้ใช้ เพิ่มนักเรียนและครูแนะแนว และควบคุมฐานข้อมูล
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveForm(activeForm === 'student' ? null : 'student')}
            className="px-4 py-2 rounded-2xl bg-nature-600 hover:bg-nature-700 text-white font-bold text-xs shadow-sm transition"
          >
            + เพิ่มนักเรียน
          </button>
          <button
            onClick={() => setActiveForm(activeForm === 'counselor' ? null : 'counselor')}
            className="px-4 py-2 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition"
          >
            + เพิ่มผู้ให้คำปรึกษา
          </button>
          <button
            onClick={handleResetSeed}
            className="px-4 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            title="รีเซ็ต Demo Data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
            <span>รีเซ็ต Demo Data</span>
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Add Student Form Drawer */}
      {activeForm === 'student' && (
        <div className="glass-card rounded-3xl p-6 border border-nature-200 bg-white space-y-4 animate-in slide-in-from-top-2">
          <h3 className="font-bold text-base text-slate-900">เพิ่มนักเรียนเข้าสู่ระบบ</h3>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
              <input
                type="text"
                required
                placeholder="เช่น กานต์ธีรา สดใส"
                value={stName}
                onChange={(e) => setStName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสนักเรียน *</label>
              <input
                type="text"
                required
                placeholder="เช่น #006"
                value={stCode}
                onChange={(e) => setStCode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ห้องเรียน *</label>
              <input
                type="text"
                required
                placeholder="เช่น M.5/1 หรือ M.6/2"
                value={stClass}
                onChange={(e) => setStClass(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล *</label>
              <input
                type="email"
                required
                placeholder="student6@school.ac.th"
                value={stEmail}
                onChange={(e) => setStEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-nature-600 hover:bg-nature-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                บันทึกนักเรียน
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Counselor Form Drawer */}
      {activeForm === 'counselor' && (
        <div className="glass-card rounded-3xl p-6 border border-sky-200 bg-white space-y-4 animate-in slide-in-from-top-2">
          <h3 className="font-bold text-base text-slate-900">เพิ่มครูแนะแนว / ผู้ให้คำปรึกษา</h3>
          <form onSubmit={handleAddCounselor} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
              <input
                type="text"
                required
                placeholder="เช่น อ.กฤษณะ เมตตาธรรม"
                value={coName}
                onChange={(e) => setCoName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล *</label>
              <input
                type="email"
                required
                placeholder="counselor3@school.ac.th"
                value={coEmail}
                onChange={(e) => setCoEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">กลุ่มสาระ / แผนก</label>
              <input
                type="text"
                value={coDept}
                onChange={(e) => setCoDept(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                บันทึกผู้ให้คำปรึกษา
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <span>รายชื่อผู้ใช้งานทั้งหมดในระบบ ({users.length})</span>
          </h2>
          <span className="text-xs text-slate-400">ฐานข้อมูล SQLite WASM Real DB</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">ชื่อ-นามสกุล</th>
                <th className="px-5 py-3.5">อีเมล (Login)</th>
                <th className="px-5 py-3.5">บทบาท (Role)</th>
                <th className="px-5 py-3.5">รหัส / ห้อง / แผนก</th>
                <th className="px-5 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'counselor'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {u.role === 'student'
                      ? `${u.student_code} (ห้อง ${u.class_name})`
                      : u.role === 'counselor'
                      ? u.department
                      : 'ผู้ดูแลระบบสูงสุด'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="ลบผู้ใช้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
