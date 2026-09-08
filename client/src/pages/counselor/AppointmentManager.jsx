import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import { AppointmentStatusBadge } from '../../components/common/StatusBadge';

export function AppointmentManager({ onNavigateToStudent }) {
  const [appointments, setAppointments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const [resAp, resSt] = await Promise.all([
        api.getAppointments(),
        api.getStudents()
      ]);
      setAppointments(resAp.appointments || []);
      setStudents(resSt.students || []);
      if (resSt.students && resSt.students[0]) {
        setStudentId(resSt.students[0].id);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!studentId || !topic || !date || !time) return;

    try {
      await api.createAppointment({
        student_id: parseInt(studentId),
        appointment_date: date,
        appointment_time: time,
        topic,
        notes
      });
      setIsModalOpen(false);
      setTopic('');
      setNotes('');
      await fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status);
      await fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณต้องการยกเลิก/ลบการนัดหมายนี้ใช่หรือไม่?')) return;
    try {
      await api.deleteAppointment(id);
      await fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-24 lg:pb-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ปฏิทินและตารางนัดหมายการให้คำปรึกษา 📅
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            จัดการตารางนัดหมายนักเรียน และเชื่อมต่อผลการให้คำปรึกษา
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างการนัดหมายใหม่</span>
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">กำลังโหลดรายการนัดหมาย...</div>
      ) : appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map((ap) => (
            <div
              key={ap.id}
              className="glass-card p-5 rounded-3xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <AppointmentStatusBadge status={ap.status} />
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                    {ap.appointment_date} ({ap.appointment_time} น.)
                  </span>
                  <span
                    onClick={() => onNavigateToStudent && onNavigateToStudent(ap.student_id)}
                    className="text-xs font-bold text-slate-900 hover:text-sky-700 cursor-pointer underline underline-offset-2"
                  >
                    {ap.student_name} ({ap.student_code} - ห้อง {ap.class_name})
                  </span>
                </div>

                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {ap.topic}
                </div>

                {ap.notes && <div className="text-xs text-slate-500">{ap.notes}</div>}
                <div className="text-[11px] text-slate-400">ผู้ให้คำปรึกษา: {ap.counselor_name}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {ap.status === 'SCHEDULED' && (
                  <>
                    <button
                      onClick={() => onNavigateToStudent && onNavigateToStudent(ap.student_id, 'counseling')}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
                      title="เปิดหน้าบันทึกการให้คำปรึกษา"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>บันทึกผลคำปรึกษา</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(ap.id, 'COMPLETED')}
                      className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition"
                      title="ทำเครื่องหมายว่าเสร็จสิ้น"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleDelete(ap.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="ยกเลิก/ลบนัดหมาย"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-60" />
          <p className="font-semibold text-slate-700">ยังไม่มีการนัดหมายในระบบ</p>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">สร้างการนัดหมายใหม่</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เลือกนักเรียน *</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.student_code} - {s.name} (ห้อง {s.class_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">วันที่ *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เวลา *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หัวข้อการนัดหมาย *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ปรึกษาเรื่องการเรียน, วางแผนอนาคต..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">สถานที่ / หมายเหตุ</label>
                <input
                  type="text"
                  placeholder="เช่น ห้องแนะแนว 1 อาคาร 3..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-sm"
                >
                  สร้างการนัดหมาย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
