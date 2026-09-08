import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { LoginPage } from './pages/auth/LoginPage';
import { DemoHelperModal } from './components/common/DemoHelperModal';
import { StudentPortal } from './pages/student/StudentPortal';
import { CounselorDashboard } from './pages/counselor/CounselorDashboard';
import { StudentListSearch } from './pages/counselor/StudentListSearch';
import { StudentProfileDetail } from './pages/counselor/StudentProfileDetail';
import { FollowupManager } from './pages/counselor/FollowupManager';
import { AppointmentManager } from './pages/counselor/AppointmentManager';
import { ReferralManager } from './pages/counselor/ReferralManager';
import { SchoolReportView } from './pages/counselor/SchoolReportView';
import { AdminManagement } from './pages/admin/AdminManagement';

export function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentInitialTab, setSelectedStudentInitialTab] = useState('overview');
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Global Ctrl + Q (or Cmd + Q) Keyboard Shortcut for Demo Mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        setShowDemoModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset tab on role switch
  useEffect(() => {
    if (user?.role === 'student') {
      setActiveTab('garden');
    } else if (user?.role === 'counselor' || user?.role === 'admin') {
      setActiveTab('dashboard');
    }
  }, [user?.role, user?.id]);

  // Navigate directly to a specific student profile and tab
  const handleNavigateToStudent = (studentId, tab = 'overview') => {
    setSelectedStudentId(studentId);
    setSelectedStudentInitialTab(tab);
    setActiveTab('student-detail');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl animate-bounce shadow-lg shadow-emerald-500/20">
          🌱
        </div>
        <h2 className="text-lg font-bold text-white mt-4 tracking-tight">MindNote Student</h2>
        <p className="text-xs text-emerald-300/80 mt-1">กำลังเตรียมสวนใจและเชื่อมต่อฐานข้อมูล...</p>
      </div>
    );
  }

  // If not logged in, render Production Login Page with Ctrl+Q listener
  if (!user) {
    return (
      <>
        <LoginPage onOpenDemoModal={() => setShowDemoModal(true)} />
        <DemoHelperModal 
          isOpen={showDemoModal} 
          onClose={() => setShowDemoModal(false)} 
        />
      </>
    );
  }

  // Student Views
  if (user.role === 'student') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenDemoModal={() => setShowDemoModal(true)} 
        />
        <main className="flex-1">
          <StudentPortal activeSubTab={activeTab} onTabChange={setActiveTab} />
        </main>
        <Footer />
        <DemoHelperModal 
          isOpen={showDemoModal} 
          onClose={() => setShowDemoModal(false)} 
        />
      </div>
    );
  }

  // Counselor & Admin Views
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200">
      <Navbar
        activeTab={activeTab === 'student-detail' ? 'students' : activeTab}
        setActiveTab={(t) => {
          setSelectedStudentId(null);
          setActiveTab(t);
        }}
        onOpenDemoModal={() => setShowDemoModal(true)}
      />
      <main className="flex-1">
        {activeTab === 'dashboard' || activeTab === 'home' ? (
          <CounselorDashboard
            onNavigateToStudent={handleNavigateToStudent}
            onNavigateToTab={setActiveTab}
          />
        ) : activeTab === 'students' ? (
          <StudentListSearch onSelectStudent={(id) => handleNavigateToStudent(id, 'overview')} />
        ) : activeTab === 'student-detail' ? (
          <StudentProfileDetail
            studentId={selectedStudentId}
            initialTab={selectedStudentInitialTab}
            onBack={() => setActiveTab('students')}
          />
        ) : activeTab === 'referrals' ? (
          <ReferralManager onNavigateToStudent={handleNavigateToStudent} />
        ) : activeTab === 'followups' ? (
          <FollowupManager onSelectStudent={(id) => handleNavigateToStudent(id, 'followup')} />
        ) : activeTab === 'appointments' ? (
          <AppointmentManager onNavigateToStudent={(id, tab) => handleNavigateToStudent(id, tab || 'appointment')} />
        ) : activeTab === 'report' ? (
          <SchoolReportView />
        ) : activeTab === 'admin' && user.role === 'admin' ? (
          <AdminManagement />
        ) : (
          <CounselorDashboard
            onNavigateToStudent={handleNavigateToStudent}
            onNavigateToTab={setActiveTab}
          />
        )}
      </main>
      <Footer />
      <DemoHelperModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-slate-200/60 bg-white/70 text-center text-xs text-slate-400 print:hidden">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-slate-600 font-medium">
          <span>🌱 MindNote Student (MNS)</span>
          <span>•</span>
          <span className="text-slate-400">ระบบบันทึกและติดตามการให้คำปรึกษาสำหรับนักเรียน</span>
        </div>
        <div>
          เชื่อมต่อฐานข้อมูลจริง (SQLite WASM) • ปลอดภัยตามหลัก RBAC & PDPA
        </div>
      </div>
    </footer>
  );
}
export default App;
