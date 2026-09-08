import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Sparkles, 
  X, 
  Zap, 
  ArrowRight, 
  Database, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export function DemoHelperModal({ isOpen, onClose }) {
  const { user, quickDemoLogin, checkAuth } = useAuth();
  const [systemMode, setSystemMode] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadSystemMode();
    }
  }, [isOpen]);

  async function loadSystemMode() {
    try {
      const data = await api.getSystemMode();
      setSystemMode(data);
    } catch (err) {
      console.warn('Could not fetch system mode:', err);
    }
  }

  const DEMO_ACCOUNTS = [
    {
      role: 'student',
      title: 'นักเรียนเคสติดตาม (กิตติพงษ์)',
      badge: 'รหัส #001 (ม.5/1)',
      email: 'student1@school.ac.th',
      password: 'student123',
      identifier: '#001',
      desc: 'มีประวัติอารมณ์ 13 วัน, สถานะรอติดตาม (Follow-up), ต้นไม้ระยะที่ 3',
      icon: '🌱'
    },
    {
      role: 'student',
      title: 'นักเรียนต้นไม้สมบูรณ์ (พิมพ์ชนก)',
      badge: 'รหัส #002 (ม.5/1)',
      email: 'student2@school.ac.th',
      password: 'student123',
      identifier: '#002',
      desc: 'เช็กอินสม่ำเสมอ Streak 14 วัน, ต้นไม้เติบโตสมบูรณ์ระยะที่ 4',
      icon: '🌸'
    },
    {
      role: 'counselor',
      title: 'ครูแนะแนว / นักจิตวิทยา (อ.พิมพา)',
      badge: 'หัวหน้างานแนะแนว',
      email: 'counselor@school.ac.th',
      password: 'counselor123',
      identifier: 'counselor',
      desc: 'ดูแดชบอร์ดสถิติ, ค้นหาคัดกรองนักเรียน, บันทึกการให้คำปรึกษา, ออกรายงาน PDF',
      icon: '👩‍🏫'
    },
    {
      role: 'admin',
      title: 'ผู้ดูแลระบบโรงเรียน (Admin)',
      badge: 'ระบบบริหารส่วนกลาง',
      email: 'admin@school.ac.th',
      password: 'admin123',
      identifier: 'admin',
      desc: 'จัดการข้อมูลนักเรียน, เพิ่มบัญชีครูแนะแนว, ดูแลความปลอดภัยของระบบ',
      icon: '🛡️'
    }
  ];

  const handleSeedDemoData = async () => {
    setLoadingAction(true);
    setActionSuccess(null);
    try {
      await api.seedDemoMode();
      setActionSuccess('โหลดข้อมูลจำลองสำเร็จเรียบร้อยแล้ว');
      await loadSystemMode();
      // Auto login as Student 1 for quick demo
      await quickDemoLogin('student1@school.ac.th', 'student123');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCleanReset = async () => {
    setLoadingAction(true);
    setActionSuccess(null);
    try {
      await api.resetCleanMode();
      setActionSuccess('สลับกลับสู่โหมดข้อมูลจริง (Clean Baseline) สำเร็จ');
      await loadSystemMode();
      // Auto login as real counselor
      await quickDemoLogin('counselor@school.ac.th', 'counselor123');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSelectAccount = async (acc) => {
    setLoadingAction(true);
    try {
      // If system has 0 students and user clicked a student, auto seed demo first
      if (acc.role === 'student' && (!systemMode || systemMode.studentCount === 0)) {
        await api.seedDemoMode();
        await loadSystemMode();
      }
      await quickDemoLogin(acc.email, acc.password);
      onClose();
    } catch (err) {
      console.error('Failed demo login:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Demo Control Hub</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-mono font-bold">
                  Ctrl + Q
                </span>
              </div>
              <p className="text-xs text-slate-400">
                สลับโหมดข้อมูลจำลองเพื่อนำเสนอ (Demo) หรือสลับกลับสู่โหมดข้อมูลจริง (Production)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Status Notification */}
        {actionSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Mode Management Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">สถานะข้อมูลระบบปัจจุบัน:</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  systemMode?.isDemoMode 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {systemMode?.isDemoMode ? '🧪 Demo Mode (มีข้อมูลจำลอง)' : '🛡️ Clean Production (ข้อมูลจริง)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {systemMode?.isDemoMode 
                  ? `มีข้อมูลตัวอย่างนักเรียน ${systemMode?.studentCount} คน สำหรับการสาธิตระบบ` 
                  : 'ฐานข้อมูลเริ่มต้นสะอาด พร้อมสำหรับการบันทึกและจัดการนักเรียนจริง'}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!systemMode?.isDemoMode ? (
                <button
                  onClick={handleSeedDemoData}
                  disabled={loadingAction}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAction ? 'animate-spin' : ''}`} />
                  <span>โหลดข้อมูลตัวอย่าง</span>
                </button>
              ) : (
                <button
                  onClick={handleCleanReset}
                  disabled={loadingAction}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ล้างเป็นโหมดจริง</span>
                </button>
              )}
            </div>
          </div>

          {/* Account Switcher Grid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              คลิกเพื่อสลับเข้าสู่บทบาท (Role Switcher)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((acc, index) => {
                const isCurrent = user?.email === acc.email;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAccount(acc)}
                    disabled={loadingAction}
                    className={`p-3.5 rounded-2xl border text-left transition relative group flex flex-col justify-between cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-400/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/40 hover:scale-[1.01]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl p-1 rounded-xl bg-black/30 border border-white/10">
                            {acc.icon}
                          </span>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition">
                              {acc.title}
                            </h4>
                            <span className="inline-block text-[10px] font-medium text-emerald-400">
                              {acc.badge}
                            </span>
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shrink-0">
                            ใช้งานอยู่
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {acc.desc}
                      </p>
                    </div>

                    {/* Footer credential pill */}
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-400">{acc.email}</span>
                      <span className="text-emerald-400 font-semibold group-hover:translate-x-1 transition flex items-center gap-1">
                        <span>เข้าสู่ระบบ</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>กดแป้น <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">Ctrl + Q</kbd> เพื่อเปิด/ปิดหน้านี้</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
