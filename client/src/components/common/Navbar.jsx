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
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EmergencyModal } from './EmergencyModal';

export function Navbar({ activeTab, setActiveTab, onOpenDemoModal }) {
  const { user, logout } = useAuth();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {user?.student_code ? `${user.student_code} • ม.5/1` : 'นักเรียน'}
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
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none" 
              onClick={() => setActiveTab(user?.role === 'student' ? 'garden' : 'dashboard')}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <span className="text-xl">🌱</span>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                  MindNote <span className="text-emerald-700 font-semibold text-xs sm:text-sm px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">MNS</span>
                </div>
                <div className="text-[10px] text-slate-400 hidden sm:block">
                  ระบบดูแลและให้คำปรึกษาสุขภาพจิตนักเรียน
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {user?.role === 'student' && (
                <>
                  <button
                    onClick={() => setActiveTab('garden')}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      activeTab === 'garden' || activeTab === 'home'
                        ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🌱 Mind Garden
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      activeTab === 'history'
                        ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📈 Mood Journey
                  </button>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      activeTab === 'appointments'
                        ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📅 การนัดหมาย
                  </button>
                </>
              )}

              {(user?.role === 'counselor' || user?.role === 'admin') && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      activeTab === 'dashboard' || activeTab === 'home'
                        ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📊 แดชบอร์ด
                  </button>
                  <button
                    onClick={() => setActiveTab('students')}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      activeTab === 'students'
                        ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👥 ค้นหานักเรียน
                  </button>
                  <button
                    onClick={() => setActiveTab('referrals')}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      activeTab === 'referrals'
                        ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🤝 เคสส่งต่อ
                  </button>
                  <button
                    onClick={() => setActiveTab('followups')}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      activeTab === 'followups'
                        ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🔔 ติดตามผล
                  </button>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      activeTab === 'appointments'
                        ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📅 นัดหมาย
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      activeTab === 'report'
                        ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📑 รายงานสถิติ
                  </button>
                </>
              )}

              {user?.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-purple-100 text-purple-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  👑 จัดการระบบ
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.name?.charAt(0) || 'U'}
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
      </header>

      {/* Emergency SOS Modal */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />
    </>
  );
}
