import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  Calendar, 
  CheckSquare, 
  Shield, 
  LogOut, 
  Menu, 
  X, 
  ArrowRightLeft, 
  BookOpen, 
  LifeBuoy, 
  FileText, 
  User as UserIcon,
  ChevronDown,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EmergencyModal } from './EmergencyModal';
import { ProfileSettingsModal } from './ProfileSettingsModal';

export function Navbar({ activeTab, setActiveTab, onOpenDemoModal }) {
  const { user, logout } = useAuth();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {user?.student_code ? `${user.student_code} • ${user?.class_name || 'ม.5/1'}` : (user?.class_name || 'นักเรียน')}
          </span>
        );
      case 'counselor':
        return (
          <span className="bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ครูแนะแนว
          </span>
        );
      case 'admin':
        return (
          <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ผู้ดูแลระบบ
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab(user?.role === 'student' ? 'garden' : 'dashboard')}
                className="flex items-center gap-2.5 group text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-md group-hover:scale-105 transition duration-200 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
                      MindNote
                    </span>
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md uppercase tracking-wider border border-emerald-200/60">
                      MNS
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                    ระบบดูแลและให้คำปรึกษาสุขภาพจิตนักเรียน
                  </p>
                </div>
              </button>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
              {/* Student Navigation */}
              {user?.role === 'student' && (
                <>
                  <button
                    onClick={() => setActiveTab('garden')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'garden'
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <span>🌱 Mind Garden</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'history'
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <span>📈 Mood Journey</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('appointments')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'appointments'
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <span>📅 การนัดหมาย</span>
                  </button>
                </>
              )}

              {/* Counselor & Admin Navigation */}
              {(user?.role === 'counselor' || user?.role === 'admin') && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <span>📊 ภาพรวม</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('students')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'students'
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>รายชื่อนักเรียน</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('referrals')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'referrals'
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>เคสส่งต่อ</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('followups')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'followups'
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>ติดตามผล</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('appointments')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'appointments'
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>ปฏิทินนัดหมาย</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('report')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'report'
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>รายงานสถิติ</span>
                  </button>
                </>
              )}

              {/* Admin Special Tab */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-purple-700 hover:bg-purple-100/60'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>จัดการระบบ</span>
                </button>
              )}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2.5">
              {/* Emergency SOS Button */}
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shadow-xs cursor-pointer"
                title="ศูนย์ช่วยเหลือฉุกเฉินและสายด่วน 1323"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-rose-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>ช่วยเหลือด่วน (SOS)</span>
              </button>

              {/* User Profile & Logout Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200 text-left cursor-pointer"
                >
                  <div className="hidden sm:block text-right">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user?.name}
                    </div>
                    <div className="flex justify-end">{getRoleBadge(user?.role)}</div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
                    {user?.avatar ? (
                      user.avatar.startsWith('data:image/') || user.avatar.startsWith('http') ? (
                        <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base">{user.avatar}</span>
                      )
                    ) : (
                      user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-left"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email}</p>
                    </div>

                    {/* Profile Settings Option */}
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition cursor-pointer font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ตั้งค่าข้อมูลส่วนตัว (ชื่อ / ห้อง)</span>
                    </button>

                    <button
                      onClick={onOpenDemoModal}
                      className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                      <span>สลับสิทธิ์การใช้งาน (Ctrl+Q)</span>
                    </button>

                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ออกจากระบบ (Sign out)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 animate-in fade-in">
            <div className="p-3 bg-slate-50 rounded-2xl mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{user?.email}</p>
              </div>
              {getRoleBadge(user?.role)}
            </div>

            <button
              onClick={() => { setShowProfileModal(true); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-emerald-600" />
              <span>⚙️ ตั้งค่าข้อมูลส่วนตัว (ชื่อ / ห้อง)</span>
            </button>

            {user?.role === 'student' && (
              <>
                <button
                  onClick={() => { setActiveTab('garden'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  🌱 Mind Garden
                </button>
                <button
                  onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  📈 Mood Journey
                </button>
                <button
                  onClick={() => { setActiveTab('appointments'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  📅 การนัดหมาย
                </button>
              </>
            )}

            {(user?.role === 'counselor' || user?.role === 'admin') && (
              <>
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  📊 แดชบอร์ด
                </button>
                <button
                  onClick={() => { setActiveTab('students'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  👥 ค้นหานักเรียน
                </button>
                <button
                  onClick={() => { setActiveTab('referrals'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  🤝 เคสส่งต่อ (Referrals)
                </button>
                <button
                  onClick={() => { setActiveTab('followups'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  🔔 ติดตามผล (Follow-up)
                </button>
                <button
                  onClick={() => { setActiveTab('appointments'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  📅 ปฏิทินนัดหมาย
                </button>
                <button
                  onClick={() => { setActiveTab('report'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  📑 รายงานสถิติสถานศึกษา
                </button>
              </>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50"
              >
                👑 จัดการระบบ
              </button>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={logout}
                className="w-full py-2.5 rounded-xl bg-rose-50 text-xs font-semibold text-rose-600 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        )}
        {/* Mobile & Tablet Bottom Navigation Bar (iOS / iPad / Android Native App Experience) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around safe-bottom">
          {user?.role === 'student' && (
            <>
              <button
                onClick={() => setActiveTab('garden')}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition cursor-pointer min-w-[56px] ${
                  activeTab === 'garden' || activeTab === 'home'
                    ? 'text-emerald-700 font-bold bg-emerald-50/80 scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="text-lg">🌱</span>
                <span className="text-[10px] tracking-tight">สวนใจ</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition cursor-pointer min-w-[56px] ${
                  activeTab === 'history'
                    ? 'text-emerald-700 font-bold bg-emerald-50/80 scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="text-lg">📈</span>
                <span className="text-[10px] tracking-tight">บันทึกใจ</span>
              </button>

              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition cursor-pointer min-w-[56px] ${
                  activeTab === 'appointments'
                    ? 'text-emerald-700 font-bold bg-emerald-50/80 scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">นัดหมาย</span>
              </button>

              <button
                onClick={() => setShowEmergencyModal(true)}
                className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-rose-600 transition cursor-pointer min-w-[56px] hover:bg-rose-50"
              >
                <LifeBuoy className="w-5 h-5 mb-0.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-[10px] font-bold tracking-tight">SOS</span>
              </button>

              <button
                onClick={() => setShowProfileModal(true)}
                className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-500 hover:text-slate-800 transition cursor-pointer min-w-[56px]"
              >
                <Settings className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">โปรไฟล์</span>
              </button>
            </>
          )}

          {(user?.role === 'counselor' || user?.role === 'admin') && (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition cursor-pointer min-w-[52px] ${
                  activeTab === 'dashboard' || activeTab === 'home'
                    ? 'text-emerald-700 font-bold bg-emerald-50/80 scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="text-base">📊</span>
                <span className="text-[10px] tracking-tight">ภาพรวม</span>
              </button>

              <button
                onClick={() => setActiveTab('students')}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition cursor-pointer min-w-[52px] ${
                  activeTab === 'students' || activeTab === 'student-detail'
                    ? 'text-emerald-700 font-bold bg-emerald-50/80 scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] tracking-tight">นักเรียน</span>
              </button>

              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition cursor-pointer min-w-[52px] ${
                  activeTab === 'appointments'
                    ? 'text-emerald-700 font-bold bg-emerald-50/80 scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] tracking-tight">นัดหมาย</span>
              </button>

              <button
                onClick={() => setActiveTab('followups')}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition cursor-pointer min-w-[52px] ${
                  activeTab === 'followups'
                    ? 'text-emerald-700 font-bold bg-emerald-50/80 scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckSquare className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] tracking-tight">ติดตามผล</span>
              </button>

              <button
                onClick={() => setActiveTab(user?.role === 'admin' ? 'admin' : 'report')}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition cursor-pointer min-w-[52px] ${
                  activeTab === 'report' || activeTab === 'admin' || activeTab === 'referrals'
                    ? 'text-purple-700 font-bold bg-purple-50 scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {user?.role === 'admin' ? <Shield className="w-4 h-4 mb-0.5 text-purple-600" /> : <FileText className="w-4 h-4 mb-0.5 text-sky-600" />}
                <span className="text-[10px] tracking-tight">{user?.role === 'admin' ? 'ระบบ' : 'สถิติ'}</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Emergency SOS Modal */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />
    </>
  );
}
