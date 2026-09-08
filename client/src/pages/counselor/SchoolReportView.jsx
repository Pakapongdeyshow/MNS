import React, { useState, useEffect } from 'react';
import { Printer, BookOpen, Award, CheckCircle, TrendingUp, Users, Calendar, Download } from 'lucide-react';
import { request } from '../../services/api';

export function SchoolReportView() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await request('/report/executive-summary');
      setReport(data);
    } catch (err) {
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading || !report) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-400">
        กำลังประมวลผลรายงานสถิติสถานศึกษา...
      </div>
    );
  }

  const { overview, classStats, topics, moodDistribution, schoolName, academicYear, generatedAt } = report;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-24 lg:pb-8 animate-in fade-in">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            รายงานสถิติภาพรวมระดับสถานศึกษา 📊
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            สถิติรวมแบบไม่ระบุตัวตน (Anonymized) สำหรับฝ่ายบริหารและประกอบการประเมิน สมศ./สพฐ.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>พิมพ์รายงาน / บันทึกเป็น PDF</span>
        </button>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-200 bg-white space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Document Formal Header */}
        <div className="border-b pb-6 text-center space-y-2">
          <div className="text-3xl">🌱</div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            รายงานสรุปผลการดำเนินงานระบบดูแลช่วยเหลือและให้คำปรึกษานักเรียน
          </h2>
          <div className="text-sm font-semibold text-slate-700">
            {schoolName} • ภาคเรียนที่ {academicYear}
          </div>
          <div className="text-xs text-slate-400">
            ประมวลผลข้อมูล ณ วันที่: {generatedAt} • อ้างอิงระบบ MindNote Student (MNS)
          </div>
        </div>

        {/* 1. Executive Summary 4-Grid Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            1. สรุปภาพรวมเชิงปริมาณ (Executive Quantitative Summary)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs text-slate-500">นักเรียนในระบบทั้งหมด</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{overview.totalStudents} คน</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs text-slate-500">การให้คำปรึกษาสะสม</div>
              <div className="text-2xl font-extrabold text-nature-700 mt-1">{overview.totalSessions} ครั้ง</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs text-slate-500">ความสำเร็จงานติดตามผล</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{overview.followupSuccessRate}%</div>
              <div className="text-[10px] text-slate-400">({overview.completedFollowups}/{overview.totalFollowups} งาน)</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs text-slate-500">การเช็กอินสะสม (Mind Check)</div>
              <div className="text-2xl font-extrabold text-sky-700 mt-1">{overview.totalCheckins} ครั้ง</div>
            </div>
          </div>
        </div>

        {/* 2. Breakdown by Grade / Class */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            2. สถิติการให้บริการจำแนกตามห้องเรียน (Class Breakdown)
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="p-3">ระดับชั้น / ห้องเรียน</th>
                  <th className="p-3 text-center">จำนวนนักเรียน</th>
                  <th className="p-3 text-center">ครั้งการให้คำปรึกษา</th>
                  <th className="p-3 text-center">การเช็กอินอารมณ์สะสม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStats.map((c) => (
                  <tr key={c.class_name}>
                    <td className="p-3 font-bold text-slate-900">ห้อง {c.class_name}</td>
                    <td className="p-3 text-center text-slate-700">{c.student_count} คน</td>
                    <td className="p-3 text-center font-bold text-nature-800">{c.counseling_count} ครั้ง</td>
                    <td className="p-3 text-center text-slate-700">{c.checkin_count} ครั้ง</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Counseling Topics Distribution */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            3. หัวข้อการให้คำปรึกษาหลัก (Top Guidance Topics)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topics.map((t, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{t.topic}</span>
                <span className="font-bold px-2 py-0.5 rounded-full bg-nature-100 text-nature-800">
                  {t.count} ครั้ง
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Formal Accreditation Seal Footer */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
          <div>
            <div className="font-bold text-slate-900">งานแนะแนวและจิตวิทยาการศึกษา</div>
            <div className="mt-8 border-t border-slate-300 pt-1 w-48 mx-auto">
              (......................................................)
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">ครูหัวหน้างานแนะแนว</div>
          </div>
          <div>
            <div className="font-bold text-slate-900">รับรองรายงานฝ่ายบริหารสถานศึกษา</div>
            <div className="mt-8 border-t border-slate-300 pt-1 w-48 mx-auto">
              (......................................................)
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">ผู้อำนวยการสถานศึกษา</div>
          </div>
        </div>
      </div>
    </div>
  );
}
