import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, ChevronRight, BookOpen, Clock, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { StudentStatusBadge } from '../../components/common/StatusBadge';

export function StudentListSearch({ onSelectStudent }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [hasFollowupOnly, setHasFollowupOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedClass !== 'ALL') params.class_name = selectedClass;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (hasFollowupOnly) params.has_followup = 'true';

      const res = await api.getStudents(params);
      setStudents(res.students || []);
      if (res.classes) setClasses(res.classes);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedClass, selectedStatus, hasFollowupOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ค้นหาและจัดการข้อมูลนักเรียน 👥
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ค้นหารายชื่อนักเรียน ตรวจสอบสถานะการติดตาม และเปิดดูประวัติการให้คำปรึกษา
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
          พบทั้งหมด {students.length} คน
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200/80 bg-white space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาด้วยรหัสนักเรียน, ชื่อ-นามสกุล, หรือห้องเรียน..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-nature-400 focus:border-transparent"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-nature-400 focus:border-transparent bg-white text-slate-700"
            >
              <option value="ALL">ทุกห้องเรียน (All Classes)</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  ห้อง {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-nature-400 focus:border-transparent bg-white text-slate-700"
            >
              <option value="ALL">ทุกสถานะ (All Status)</option>
              <option value="ACTIVE">🟢 Active (ปกติ)</option>
              <option value="FOLLOW_UP">🟡 Follow-up (ติดตามผล)</option>
              <option value="WAITING_APPOINTMENT">🔵 Waiting (รอนัดหมาย)</option>
              <option value="NO_FOLLOW_UP">⚪ No Follow-up</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Checkbox */}
        <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
          <input
            type="checkbox"
            id="followupCheck"
            checked={hasFollowupOnly}
            onChange={(e) => setHasFollowupOnly(e.target.checked)}
            className="rounded border-slate-300 text-nature-600 focus:ring-nature-400 w-4 h-4"
          />
          <label htmlFor="followupCheck" className="cursor-pointer font-medium">
            แสดงเฉพาะนักเรียนที่มีงานติดตามผลค้างอยู่ (Pending Follow-up)
          </label>
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">กำลังค้นหาข้อมูลนักเรียน...</div>
      ) : students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((st) => (
            <div
              key={st.id}
              onClick={() => onSelectStudent(st.id)}
              className="glass-card rounded-3xl p-5 border border-slate-200/80 hover:border-nature-300 hover:shadow-md transition-all cursor-pointer bg-white group space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Strip */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-nature-100 to-emerald-50 border border-nature-200 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition">
                      {(st.growth_level || 0) >= 5 ? '🌳' : (st.growth_level || 0) >= 3 ? '🌳' : (st.growth_level || 0) >= 1 ? '🌿' : '🌱'}
                    </div>
                    <div>
                      <div className="font-bold text-base text-slate-900 group-hover:text-nature-900 transition">
                        {st.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {st.student_code} • ห้อง {st.class_name}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <StudentStatusBadge status={st.status} />
                  <span className="text-[11px] font-semibold text-nature-700 bg-nature-50 px-2 py-0.5 rounded-md border border-nature-200">
                    Tree Stage {st.growth_level || 0}/5
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-slate-400 text-[10px]">การให้คำปรึกษา</div>
                    <div className="font-bold text-slate-800 mt-0.5">{st.counseling_count || 0} ครั้ง</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-slate-400 text-[10px]">งานติดตามค้าง</div>
                    <div className="font-bold text-amber-600 mt-0.5">{st.pending_followups_count || 0}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-slate-400 text-[10px]">เช็กอินสะสม</div>
                    <div className="font-bold text-emerald-700 mt-0.5">{st.total_checkins || 0} วัน</div>
                  </div>
                </div>

                {st.last_counseling_date && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>ให้คำปรึกษาล่าสุด: {st.last_counseling_date}</span>
                  </div>
                )}
              </div>

              {/* Action Button Strip */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-nature-700 group-hover:text-nature-900">
                <span>ดูโปรไฟล์และบันทึกผล</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-semibold text-slate-700">ไม่พบนักเรียนตามเงื่อนไขการค้นหา</p>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองห้องเรียน</p>
        </div>
      )}
    </div>
  );
}
