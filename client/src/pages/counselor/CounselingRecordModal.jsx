import React, { useState } from 'react';
import { BookOpen, X, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export function CounselingRecordModal({ isOpen, onClose, student, appointmentId, onRecordCreated }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [studentNeeds, setStudentNeeds] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [nextAppointment, setNextAppointment] = useState('');
  const [createFollowupTask, setCreateFollowupTask] = useState(false);
  const [followupTask, setFollowupTask] = useState('');
  const [followupDueDate, setFollowupDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('กรุณากรอกหัวข้อการให้คำปรึกษา');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createCounselingRecord({
        student_id: student.id,
        date,
        topic: topic.trim(),
        key_points: keyPoints.trim(),
        student_needs: studentNeeds.trim(),
        discussion: discussion.trim(),
        follow_up_note: followUpNote.trim(),
        next_appointment: nextAppointment.trim(),
        create_followup_task: createFollowupTask,
        followup_task: followupTask.trim(),
        followup_due_date: followupDueDate,
        appointment_id: appointmentId || null
      });

      if (onRecordCreated) onRecordCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-nature-600 to-emerald-600 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>บันทึกการให้คำปรึกษา (Counseling Record)</span>
            </div>
            <h2 className="text-xl font-bold mt-1">
              {student.name} ({student.student_code} - {student.class_name})
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">วันที่ให้คำปรึกษา *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-nature-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">หัวข้อการให้คำปรึกษา (Topic) *</label>
              <input
                type="text"
                required
                placeholder="เช่น การปรับตัว, การวางแผนการเรียน, ปัญหาความเครียด..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-nature-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">ประเด็นสำคัญ (Key Points)</label>
            <textarea
              rows={2}
              placeholder="สรุปสาระสำคัญที่นักเรียนสะท้อนออกมา..."
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-nature-400 resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">ความต้องการของนักเรียน (Student Needs)</label>
            <textarea
              rows={2}
              placeholder="สิ่งที่นักเรียนต้องการความช่วยเหลือหรือเป้าหมายที่อยากพัฒนา..."
              value={studentNeeds}
              onChange={(e) => setStudentNeeds(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-nature-400 resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">เนื้อหาการพูดคุยและแนวทาง (Discussion & Guidance)</label>
            <textarea
              rows={3}
              placeholder="กระบวนการพูดคุย เทคนิคที่แนะนำ และข้อตกลงร่วมกัน..."
              value={discussion}
              onChange={(e) => setDiscussion(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-nature-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">บันทึกสำหรับการติดตามผล (Follow-up Note)</label>
              <input
                type="text"
                placeholder="สิ่งที่ต้องสังเกตหรือติดตามในครั้งต่อไป..."
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-nature-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">นัดหมายครั้งถัดไป (Next Appointment)</label>
              <input
                type="date"
                value={nextAppointment}
                onChange={(e) => setNextAppointment(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-nature-400"
              />
            </div>
          </div>

          {/* Follow-up Task Creation Integration */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="createTaskCheck"
                checked={createFollowupTask}
                onChange={(e) => setCreateFollowupTask(e.target.checked)}
                className="rounded border-amber-300 text-amber-600 focus:ring-amber-400 w-4 h-4"
              />
              <label htmlFor="createTaskCheck" className="font-semibold text-amber-900 cursor-pointer">
                🔔 สร้างงานติดตามผล (Follow-up Task) ในระบบอัตโนมัติ
              </label>
            </div>

            {createFollowupTask && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">ภารกิจที่ต้องติดตาม *</label>
                  <input
                    type="text"
                    required={createFollowupTask}
                    placeholder="เช่น ติดตามการส่งตารางอ่านหนังสือ..."
                    value={followupTask}
                    onChange={(e) => setFollowupTask(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">กำหนดส่ง (Due Date) *</label>
                  <input
                    type="date"
                    required={createFollowupTask}
                    value={followupDueDate}
                    onChange={(e) => setFollowupDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-200 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-nature-600 hover:bg-nature-700 text-white font-bold shadow-md transition disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลการให้คำปรึกษา'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
