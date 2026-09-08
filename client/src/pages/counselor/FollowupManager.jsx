import React, { useState, useEffect } from 'react';
import { CheckSquare, Filter, Clock, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { FollowupUrgencyBadge } from '../../components/common/StatusBadge';

export function FollowupManager({ onSelectStudent }) {
  const [followups, setFollowups] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const res = await api.getFollowups({ status: statusFilter });
      setFollowups(res.followups || []);
    } catch (err) {
      console.error('Error loading followups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [statusFilter]);

  const handleComplete = async (id) => {
    try {
      await api.completeFollowup(id);
      await fetchFollowups();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบงานติดตามนี้?')) return;
    try {
      await api.deleteFollowup(id);
      await fetchFollowups();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ระบบติดตามผลนักเรียน (Follow-up System) 🔔
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ติดตามภารกิจ ข้อตกลง และความก้าวหน้าของนักเรียนตามกำหนดเวลา
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'PENDING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            รอดำเนินการ (Pending)
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'COMPLETED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            เสร็จสิ้นแล้ว (Completed)
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ทั้งหมด (All)
          </button>
        </div>
      </div>

      {/* Followup Tasks List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">กำลังโหลดรายการงานติดตาม...</div>
      ) : followups.length > 0 ? (
        <div className="space-y-3">
          {followups.map((f) => (
            <div
              key={f.id}
              className={`glass-card p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white ${
                f.status === 'COMPLETED' ? 'opacity-80 border-slate-200' : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <FollowupUrgencyBadge urgency={f.urgency} />
                  <span
                    onClick={() => onSelectStudent && onSelectStudent(f.student_id)}
                    className="text-xs font-bold text-slate-900 hover:text-nature-700 cursor-pointer underline underline-offset-2"
                  >
                    {f.student_name} ({f.student_code} - ห้อง {f.class_name})
                  </span>
                  <span className="text-xs text-slate-400">กำหนดส่ง: {f.due_date}</span>
                </div>

                <div className={`text-sm sm:text-base font-bold ${f.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {f.task}
                </div>

                {f.counseling_topic && (
                  <div className="text-xs text-slate-500">
                    หัวข้อคำปรึกษา: {f.counseling_topic}
                  </div>
                )}

                {f.completed_at && (
                  <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>เสร็จสิ้นเมื่อ: {f.completed_at}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {f.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleComplete(f.id)}
                    className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition transform active:scale-95"
                  >
                    ทำเสร็จแล้ว ✓
                  </button>
                )}
                <button
                  onClick={() => handleDelete(f.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="ลบงานติดตาม"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
          <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-60" />
          <p className="font-semibold text-slate-700">ไม่มีงานติดตามผลในสถานะนี้</p>
        </div>
      )}
    </div>
  );
}
