import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, CheckSquare, Calendar, TrendingUp, Sparkles, Plus, Clock, User, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { StudentStatusBadge, FollowupUrgencyBadge, AppointmentStatusBadge } from '../../components/common/StatusBadge';
import { CounselingRecordModal } from './CounselingRecordModal';
import { MoodTrendChart } from '../../components/mood/MoodTrendChart';
import { MoodJourneyView } from '../../components/mood/MoodJourneyView';

export function StudentProfileDetail({ studentId, initialTab = 'overview', onBack }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [data, setData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // New Followup form states
  const [newFollowupTask, setNewFollowupTask] = useState('');
  const [newFollowupDueDate, setNewFollowupDueDate] = useState('');

  // New Appointment form states
  const [newAppDate, setNewAppDate] = useState('');
  const [newAppTime, setNewAppTime] = useState('13:00');
  const [newAppTopic, setNewAppTopic] = useState('');
  const [newAppNotes, setNewAppNotes] = useState('');

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const [res, tr] = await Promise.all([
        api.getStudentDetail(studentId),
        api.getMoodTrend(studentId, 14)
      ]);
      setData(res);
      setTrendData(tr);
    } catch (err) {
      console.error('Error fetching student detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [studentId]);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.updateStudentStatus(studentId, newStatus);
      await fetchDetail();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteFollowup = async (followupId) => {
    try {
      await api.completeFollowup(followupId);
      await fetchDetail();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateFollowup = async (e) => {
    e.preventDefault();
    if (!newFollowupTask || !newFollowupDueDate) return;
    try {
      await api.createFollowup({
        student_id: studentId,
        task: newFollowupTask,
        due_date: newFollowupDueDate
      });
      setIsFollowupModalOpen(false);
      setNewFollowupTask('');
      setNewFollowupDueDate('');
      await fetchDetail();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!newAppDate || !newAppTime || !newAppTopic) return;
    try {
      await api.createAppointment({
        student_id: studentId,
        appointment_date: newAppDate,
        appointment_time: newAppTime,
        topic: newAppTopic,
        notes: newAppNotes
      });
      setIsAppointmentModalOpen(false);
      setNewAppTopic('');
      setNewAppNotes('');
      await fetchDetail();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-400">
        กำลังโหลดโปรไฟล์นักเรียน...
      </div>
    );
  }

  const student = data.student || data || {};
  const summary = data.summary || {
    totalCounseling: (data.counseling_records || data.counselingRecords || []).length,
    lastCounselingDate: (data.counseling_records || data.counselingRecords)?.[0]?.date || null,
    nextAppointment: (data.appointments || []).find(a => a.status === 'SCHEDULED') || null,
    pendingFollowupsCount: (data.followups || []).filter(f => f.status === 'PENDING').length
  };
  const counselingRecords = data.counseling_records || data.counselingRecords || [];
  const followups = data.followups || [];
  const appointments = data.appointments || [];
  const recentMoods = data.recent_moods || data.recentMoods || [];
  const growthLevel = student.growth_level ?? student.tree_progress?.growth_level ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-24 lg:pb-8 animate-in fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับหน้ารายชื่อนักเรียน</span>
      </button>

      {/* Student Profile Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-nature-200 via-emerald-100 to-sky-100 border border-nature-300 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
              {growthLevel >= 5 ? '🌳' : growthLevel >= 3 ? '🌳' : growthLevel >= 1 ? '🌿' : '🌱'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-nature-100 text-nature-800">
                  {student.student_code || '#000'}
                </span>
                <span className="text-xs text-slate-500 font-medium">ห้อง {student.class_name || 'ม.5/1'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {student.name || 'นักเรียน'}
              </h1>
              <div className="text-xs text-slate-500 mt-0.5">{student.email || ''}</div>
            </div>
          </div>

          {/* Status Changer Dropdown */}
          <div className="flex flex-col sm:items-end gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">สถานะการติดตาม</span>
            <select
              value={student.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-nature-400 bg-white"
            >
              <option value="ACTIVE">🟢 Active (ปกติ)</option>
              <option value="FOLLOW_UP">🟡 Follow-up (ติดตามผล)</option>
              <option value="WAITING_APPOINTMENT">🔵 Waiting (รอนัดหมาย)</option>
              <option value="NO_FOLLOW_UP">⚪ No Follow-up</option>
            </select>
          </div>
        </div>

        {/* 4 Summary Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div className="text-xs text-slate-400 font-medium">การให้คำปรึกษา</div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
              {summary.totalCounseling} ครั้ง
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div className="text-xs text-slate-400 font-medium">ให้คำปรึกษาล่าสุด</div>
            <div className="text-sm sm:text-base font-bold text-slate-800 mt-1">
              {summary.lastCounselingDate || 'ยังไม่มีประวัติ'}
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div className="text-xs text-slate-400 font-medium">นัดหมายครั้งต่อไป</div>
            <div className="text-sm sm:text-base font-bold text-sky-700 mt-1">
              {summary.nextAppointment ? `${summary.nextAppointment.appointment_date} (${summary.nextAppointment.appointment_time} น.)` : 'ไม่มีนัดหมาย'}
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div className="text-xs text-slate-400 font-medium">งานติดตามที่ค้าง</div>
            <div className="text-lg sm:text-xl font-extrabold text-amber-600 mt-0.5">
              {summary.pendingFollowupsCount} งาน
            </div>
          </div>
        </div>
      </div>

      {/* 5 Navigation Tabs Strip */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'ภาพรวม (Overview)', icon: Sparkles },
          { id: 'counseling', label: `บันทึกคำปรึกษา (${counselingRecords.length})`, icon: BookOpen },
          { id: 'followup', label: `งานติดตามผล (${followups.length})`, icon: CheckSquare },
          { id: 'appointment', label: `การนัดหมาย (${appointments.length})`, icon: Calendar },
          { id: 'mood', label: 'Mood Journey & กราฟ', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-nature-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span>🌱 ข้อมูล Mind Garden & Tree Growth</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-nature-50 rounded-2xl">
                <div className="text-xs text-slate-500">ระดับการเติบโต</div>
                <div className="text-lg font-bold text-nature-800">Stage {growthLevel}/5</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl">
                <div className="text-xs text-slate-500">เช็กอินต่อเนื่อง</div>
                <div className="text-lg font-bold text-amber-800">{student.consecutive_checkins || 0} วัน</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <div className="text-xs text-slate-500">สถิติสูงสุด</div>
                <div className="text-lg font-bold text-slate-800">{student.longest_streak || 0} วัน</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl">
                <div className="text-xs text-slate-500">เช็กอินสะสมทั้งหมด</div>
                <div className="text-lg font-bold text-emerald-800">{student.total_checkins || 0} วัน</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              บันทึกอารมณ์ล่าสุด (Recent Mood Checks)
            </h3>
            {recentMoods.length > 0 ? (
              <div className="space-y-2">
                {recentMoods.slice(0, 4).map((m) => (
                  <div key={m.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">
                        {m.mood === 'VERY_GOOD' ? '😊' : m.mood === 'GOOD' ? '🙂' : m.mood === 'NEUTRAL' ? '😐' : m.mood === 'WORRIED' ? '😟' : '😞'}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800">{m.checkin_date}</div>
                        <div className="text-slate-500">{m.note || 'ไม่มีบันทึกเพิ่มเติม'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">ยังไม่มีข้อมูลการเช็กอิน</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Counseling Records */}
      {activeTab === 'counseling' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">ประวัติการให้คำปรึกษาทั้งหมด</h3>
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-nature-600 hover:bg-nature-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกการให้คำปรึกษาใหม่</span>
            </button>
          </div>

          {counselingRecords.length > 0 ? (
            <div className="space-y-4">
              {counselingRecords.map((cr) => (
                <div key={cr.id} className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-3">
                  <div className="flex items-start justify-between pb-2 border-b">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">วันที่: {cr.date}</span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{cr.topic}</h4>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      ผู้ให้คำปรึกษา: {cr.counselor_name}
                    </span>
                  </div>

                  {cr.key_points && (
                    <div className="text-xs text-slate-700">
                      <strong className="text-slate-900">ประเด็นสำคัญ:</strong> {cr.key_points}
                    </div>
                  )}

                  {cr.student_needs && (
                    <div className="text-xs text-slate-700">
                      <strong className="text-slate-900">ความต้องการของนักเรียน:</strong> {cr.student_needs}
                    </div>
                  )}

                  {cr.discussion && (
                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <strong className="text-slate-900">เนื้อหาการพูดคุยและแนวทาง:</strong>
                      <p className="mt-1 leading-relaxed">{cr.discussion}</p>
                    </div>
                  )}

                  {cr.follow_up_note && (
                    <div className="text-xs text-amber-800 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                      <strong>บันทึกติดตามผล:</strong> {cr.follow_up_note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-slate-700">ยังไม่มีบันทึกการให้คำปรึกษา</p>
              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-nature-600 text-white text-xs font-bold"
              >
                เริ่มบันทึกครั้งแรก
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Follow-up Tasks */}
      {activeTab === 'followup' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">รายการภารกิจติดตามผล (Follow-up Tasks)</h3>
            <button
              onClick={() => setIsFollowupModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มงานติดตาม</span>
            </button>
          </div>

          {followups.length > 0 ? (
            <div className="space-y-3">
              {followups.map((f) => (
                <div
                  key={f.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    f.status === 'COMPLETED'
                      ? 'bg-slate-50 border-slate-200 opacity-75'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <FollowupUrgencyBadge urgency={f.urgency || (f.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING')} />
                      <span className="text-xs text-slate-400">กำหนด: {f.due_date}</span>
                    </div>
                    <div className={`text-sm font-bold ${f.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {f.task}
                    </div>
                    {f.counseling_topic && (
                      <div className="text-[11px] text-slate-500">
                        เชื่อมโยงกับการให้คำปรึกษา: {f.counseling_topic}
                      </div>
                    )}
                    {f.completed_at && (
                      <div className="text-[11px] text-emerald-700 font-medium">
                        ✓ เสร็จสิ้นเมื่อ: {f.completed_at}
                      </div>
                    )}
                  </div>

                  {f.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleCompleteFollowup(f.id)}
                      className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      ทำเสร็จแล้ว ✓
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
              <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-slate-700">ไม่มีงานติดตามผล</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Appointments */}
      {activeTab === 'appointment' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">ตารางนัดหมายการให้คำปรึกษา</h3>
            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างการนัดหมายใหม่</span>
            </button>
          </div>

          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((ap) => (
                <div key={ap.id} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-4 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AppointmentStatusBadge status={ap.status} />
                      <span className="text-xs font-bold text-slate-700">
                        {ap.appointment_date} เวลา {ap.appointment_time} น.
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{ap.topic}</div>
                    {ap.notes && <div className="text-xs text-slate-500">{ap.notes}</div>}
                    <div className="text-[11px] text-slate-400">ผู้ให้คำปรึกษา: {ap.counselor_name}</div>
                  </div>

                  {ap.status === 'SCHEDULED' && (
                    <button
                      onClick={() => {
                        setIsRecordModalOpen(true);
                      }}
                      className="shrink-0 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      บันทึกการให้คำปรึกษา
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-slate-700">ยังไม่มีการนัดหมาย</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Mood Journey & Trend */}
      {activeTab === 'mood' && (
        <div className="space-y-6">
          <MoodTrendChart trendData={trendData} periodDays={14} />
          <MoodJourneyView history={recentMoods} />
        </div>
      )}

      {/* Counseling Record Modal */}
      <CounselingRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        student={student}
        onRecordCreated={fetchDetail}
      />

      {/* New Followup Modal */}
      {isFollowupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">เพิ่มภารกิจติดตามผล</h3>
            <form onSubmit={handleCreateFollowup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่องาน/ภารกิจ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ติดตามการจัดตารางอ่านหนังสือ..."
                  value={newFollowupTask}
                  onChange={(e) => setNewFollowupTask(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">กำหนดส่ง (Due Date) *</label>
                <input
                  type="date"
                  required
                  value={newFollowupDueDate}
                  onChange={(e) => setNewFollowupDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFollowupModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-sm"
                >
                  สร้างงานติดตาม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">สร้างการนัดหมาย</h3>
            <form onSubmit={handleCreateAppointment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">วันที่ *</label>
                  <input
                    type="date"
                    required
                    value={newAppDate}
                    onChange={(e) => setNewAppDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เวลา *</label>
                  <input
                    type="time"
                    required
                    value={newAppTime}
                    onChange={(e) => setNewAppTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หัวข้อการนัดหมาย *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ปรึกษาเรื่องการเรียนต่อ..."
                  value={newAppTopic}
                  onChange={(e) => setNewAppTopic(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">สถานที่/หมายเหตุ</label>
                <input
                  type="text"
                  placeholder="เช่น ห้องแนะแนว 1 อาคาร 3..."
                  value={newAppNotes}
                  onChange={(e) => setNewAppNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAppointmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-sm"
                >
                  บันทึกการนัดหมาย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
