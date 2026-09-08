import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckSquare, AlertCircle, Clock, Plus, ArrowRight, UserCheck, Sparkles, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import { FollowupUrgencyBadge, AppointmentStatusBadge, StudentStatusBadge } from '../../components/common/StatusBadge';

export function CounselorDashboard({ onNavigateToStudent, onNavigateToTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getCounselorDashboard();
      setData(res);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCompleteFollowup = async (id) => {
    try {
      await api.completeFollowup(id);
      await fetchDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const metrics = data?.metrics || {
    totalStudents: 0,
    studentsFollowed: 0,
    todayAppointmentsCount: 0,
    pendingFollowupsCount: 0,
    overdueFollowupsCount: 0,
    counselingThisMonth: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
            Counselor Management System
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            แดชบอร์ดงานให้คำปรึกษาและติดตามนักเรียน 📊
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ภาพรวมการดูแลนักเรียน นัดหมายประจำวัน และภารกิจติดตามผล (เชื่อมต่อ Real Database)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('students')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-nature-600 hover:bg-nature-700 text-white font-bold text-xs sm:text-sm shadow-sm transition"
          >
            <Users className="w-4 h-4" />
            <span>ค้นหานักเรียน</span>
          </button>
        </div>
      </div>

      {/* 5 Real Metrics Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Students being followed */}
        <div className="glass-card p-5 rounded-3xl border border-nature-100/80 bg-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-nature-800">นักเรียนในการติดตาม</span>
            <Users className="w-4 h-4 text-nature-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {metrics.studentsFollowed}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            จากทั้งหมด {metrics.totalStudents} คน
          </div>
        </div>

        {/* Card 2: Today's Appointments */}
        <div className="glass-card p-5 rounded-3xl border border-sky-100/80 bg-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-800">นัดหมายวันนี้</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-900">
            {metrics.todayAppointmentsCount}
          </div>
          <div className="text-[11px] text-sky-600 font-medium mt-1">
            รอบวันนี้ตามตาราง
          </div>
        </div>

        {/* Card 3: Pending Follow-ups */}
        <div className="glass-card p-5 rounded-3xl border border-amber-100/80 bg-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">งานติดตามรอดำเนินการ</span>
            <CheckSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900">
            {metrics.pendingFollowupsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Follow-up Tasks
          </div>
        </div>

        {/* Card 4: Overdue Follow-ups */}
        <div className="glass-card p-5 rounded-3xl border border-red-100/80 bg-red-50/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-800">เกินกำหนดติดตาม</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-700">
            {metrics.overdueFollowupsCount}
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-1">
            🔴 ต้องติดตามเร่งด่วน
          </div>
        </div>

        {/* Card 5: Sessions This Month */}
        <div className="glass-card p-5 rounded-3xl border border-purple-100/80 bg-white col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-800">การให้คำปรึกษาเดือนนี้</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-900">
            {metrics.counselingThisMonth}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ครั้งในเดือนปัจจุบัน
          </div>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Today's Appointments Agenda */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between pb-3 border-b mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-800">
                ตารางนัดหมายวันนี้ ({data?.todayAppointments?.length || 0})
              </h2>
            </div>
            <button
              onClick={() => onNavigateToTab('appointments')}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data?.todayAppointments && data.todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {data.todayAppointments.map((ap) => (
                <div
                  key={ap.id}
                  className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-start justify-between gap-3 hover:bg-sky-50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white text-sky-800 border border-sky-200">
                        {ap.appointment_time} น.
                      </span>
                      <span className="font-bold text-sm text-slate-900">{ap.student_name}</span>
                      <span className="text-xs text-slate-500">({ap.student_code} - {ap.class_name})</span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium">{ap.topic}</div>
                    {ap.notes && <div className="text-[11px] text-slate-400">{ap.notes}</div>}
                  </div>

                  <button
                    onClick={() => onNavigateToStudent(ap.student_id, 'counseling')}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-xs"
                  >
                    บันทึกผล
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              ไม่มีนัดหมายสำหรับวันนี้
            </div>
          )}
        </div>

        {/* Section 2: Overdue & Urgent Follow-up Tasks */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between pb-3 border-b mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-base font-bold text-slate-800">
                งานติดตามผลที่เกินกำหนด ({data?.overdueFollowups?.length || 0})
              </h2>
            </div>
            <button
              onClick={() => onNavigateToTab('followups')}
              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data?.overdueFollowups && data.overdueFollowups.length > 0 ? (
            <div className="space-y-3">
              {data.overdueFollowups.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-2xl bg-red-50/50 border border-red-100 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{f.student_name}</span>
                      <span className="text-xs text-slate-500">({f.student_code} - {f.class_name})</span>
                    </div>
                    <div className="text-xs text-slate-800 font-medium">{f.task}</div>
                    <div className="text-[11px] text-red-600 font-semibold">
                      ครบกำหนดเมื่อ: {f.due_date}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCompleteFollowup(f.id)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs"
                    title="บันทึกว่างานนี้เสร็จสิ้นแล้ว"
                  >
                    ทำเสร็จแล้ว ✓
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-emerald-600 font-medium">
              ✨ ยอดเยี่ยม! ไม่มีงานติดตามผลที่เกินกำหนด
            </div>
          )}
        </div>
      </div>

      {/* Lower Section: Recent Counseling Sessions History */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between pb-3 border-b mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-nature-600" />
            <h2 className="text-base font-bold text-slate-800">
              การให้คำปรึกษาล่าสุด (Counseling Activity)
            </h2>
          </div>
          <button
            onClick={() => onNavigateToTab('students')}
            className="text-xs text-nature-700 hover:text-nature-900 font-semibold"
          >
            บันทึกการให้คำปรึกษาใหม่ +
          </button>
        </div>

        {data?.recentCounseling && data.recentCounseling.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recentCounseling.map((rc) => (
              <div
                key={rc.id}
                onClick={() => onNavigateToStudent(rc.student_id, 'counseling')}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900">{rc.student_name}</div>
                  <span className="text-xs text-slate-400">{rc.date}</span>
                </div>
                <div className="text-xs font-semibold text-nature-800">{rc.topic}</div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {rc.discussion || rc.key_points}
                </p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 flex justify-between">
                  <span>ผู้ให้คำปรึกษา: {rc.counselor_name}</span>
                  <span className="text-nature-700 font-medium">ดูรายละเอียด →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">ยังไม่มีประวัติการให้คำปรึกษา</div>
        )}
      </div>
    </div>
  );
}
