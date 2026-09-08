import React, { useState, useEffect } from 'react';
import { Users, Plus, CheckCircle, Clock, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';
import { request } from '../../services/api';

export function ReferralManager({ onNavigateToStudent }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await request(`/referrals?status=${statusFilter}`);
      setReferrals(res.referrals || []);
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await request(`/referrals/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      await fetchReferrals();
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
            ระบบรับเคสส่งต่อนักเรียน (Homeroom Referral) 🤝
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            รับเรื่องและประสานงานร่วมกับครูประจำชั้นเพื่อดูแลช่วยเหลือนักเรียนอย่างทันท่วงที
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st === 'ALL' ? 'ทั้งหมด' : st === 'PENDING' ? 'รอดำเนินการ' : st === 'ACCEPTED' ? 'รับเคสแล้ว' : 'เสร็จสิ้น'}
            </button>
          ))}
        </div>
      </div>

      {/* Referrals List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">กำลังโหลดรายการส่งต่อ...</div>
      ) : referrals.length > 0 ? (
        <div className="space-y-4">
          {referrals.map((r) => (
            <div
              key={r.id}
              className={`glass-card p-6 rounded-3xl border transition-all bg-white space-y-3 ${
                r.urgency === 'HIGH' ? 'border-red-200 bg-red-50/20' : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      r.urgency === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.urgency === 'HIGH' ? '🔴 เร่งด่วน' : '🟡 ปานกลาง'}
                  </span>
                  <span
                    onClick={() => onNavigateToStudent && onNavigateToStudent(r.student_id)}
                    className="font-bold text-sm sm:text-base text-slate-900 hover:text-nature-700 cursor-pointer underline underline-offset-2"
                  >
                    {r.student_name} ({r.student_code} - ห้อง {r.class_name})
                  </span>
                </div>

                <div className="text-xs text-slate-500">
                  ส่งต่อโดย: <strong className="text-slate-700">{r.referred_by}</strong> ({r.teacher_role})
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-700">
                <div>
                  <strong className="text-slate-900">เหตุผลการส่งต่อ:</strong> {r.reason}
                </div>
                {r.observed_behavior && (
                  <div>
                    <strong className="text-slate-900">พฤติกรรมที่สังเกตเห็น:</strong> {r.observed_behavior}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  วันที่ส่งเรื่อง: {new Date(r.created_at).toLocaleDateString('th-TH')}
                </span>

                <div className="flex items-center gap-2">
                  {r.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'ACCEPTED')}
                      className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs"
                    >
                      รับเคสและเริ่มดูแล
                    </button>
                  )}
                  <button
                    onClick={() => onNavigateToStudent && onNavigateToStudent(r.student_id, 'counseling')}
                    className="px-4 py-1.5 rounded-xl bg-nature-600 hover:bg-nature-700 text-white font-bold text-xs shadow-xs flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>เปิดโปรไฟล์นักเรียน</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-60" />
          <p className="font-semibold text-slate-700">ไม่มีรายการส่งต่อนักเรียนในขณะนี้</p>
        </div>
      )}
    </div>
  );
}
