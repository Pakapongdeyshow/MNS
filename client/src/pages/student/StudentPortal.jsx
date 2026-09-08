import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, TrendingUp, Heart, CheckCircle, Clock, Plus, Flame, Award, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MindGarden } from '../../components/mind-garden/MindGarden';
import { MoodCheckinModal } from '../../components/mood/MoodCheckinModal';
import { MoodJourneyView } from '../../components/mood/MoodJourneyView';
import { MoodTrendChart } from '../../components/mood/MoodTrendChart';
import { RealWeatherWidget } from '../../components/weather/RealWeatherWidget';
import { AppointmentStatusBadge } from '../../components/common/StatusBadge';

export function StudentPortal({ activeSubTab = 'garden', onTabChange }) {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(activeSubTab === 'home' ? 'garden' : activeSubTab);

  const handleTabSwitch = (tab) => {
    setCurrentTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  const [gardenData, setGardenData] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [counselingRecords, setCounselingRecords] = useState([]);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync with Navbar tab change
  useEffect(() => {
    if (activeSubTab === 'home') {
      setCurrentTab('garden');
    } else if (activeSubTab) {
      setCurrentTab(activeSubTab);
    }
  }, [activeSubTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gData, tData, hData, trData, apData] = await Promise.all([
        api.getGardenState(),
        api.getTodayMood(),
        api.getMoodHistory(null, 30),
        api.getMoodTrend(null, 14),
        api.getAppointments()
      ]);

      setGardenData(gData);
      setTodayStatus(tData);
      setHistory(hData.history || []);
      setTrendData(trData);
      setAppointments(apData.appointments || []);

      if (user?.student_id) {
        const crData = await api.getCounselingRecords(user.student_id).catch(() => ({ records: [] }));
        setCounselingRecords(crData.records || []);
      }
    } catch (err) {
      console.error('Error loading student portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCheckinSuccess = async (result) => {
    await fetchData();
  };

  const progress = gardenData?.progress || { growth_level: 0, consecutive_checkins: 0, total_checkins: 0, longest_streak: 0 };
  const currentMood = gardenData?.latestCheckin?.mood || 'GOOD';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-24 lg:pb-8 animate-in fade-in">
      {/* Student Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-nature-700 uppercase tracking-wider">
            <span>ยินดีต้อนรับกลับมา</span>
            <span>•</span>
            <span>{user?.student_code || '#001'} {user?.class_name ? `(ห้อง ${user?.class_name})` : ''}</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            สวัสดี, {user?.name} 🌱
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ทุกการสังเกตความรู้สึกคือการดูแลใจ และช่วยให้ต้นไม้ของคุณเติบโตอย่างมั่นคง
          </p>
        </div>

        {/* Daily Check-in CTA Button */}
        <div className="flex items-center gap-3">
          {todayStatus?.checkedIn ? (
            <button
              onClick={() => setIsCheckinOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs sm:text-sm transition shadow-xs cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>วันนี้เช็กอินแล้ว (ดูบันทึก)</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCheckinOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-nature-600 to-emerald-600 hover:from-nature-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-nature-500/25 transition transform hover:scale-[1.02] active:scale-95 animate-pulse-subtle cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
              <span>เช็กอินอารมณ์วันนี้</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs Selector Pill */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 bg-white/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-xs w-full sm:w-auto sm:max-w-fit overflow-x-auto">
        <button
          onClick={() => handleTabSwitch('garden')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            currentTab === 'garden'
              ? 'bg-nature-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>🌱 Mind Garden</span>
        </button>

        <button
          onClick={() => handleTabSwitch('history')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            currentTab === 'history'
              ? 'bg-nature-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Mood Journey</span>
        </button>

        <button
          onClick={() => handleTabSwitch('appointments')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            currentTab === 'appointments'
              ? 'bg-nature-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>นัดหมาย ({appointments.length})</span>
        </button>
      </div>

      {/* View 1: Mind Garden Tab */}
      {currentTab === 'garden' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Interactive Mind Garden */}
            <div className="lg:col-span-2 space-y-6">
              <MindGarden
                growthLevel={progress.growth_level}
                totalCheckins={progress.total_checkins}
                consecutiveCheckins={progress.consecutive_checkins}
                mood={currentMood}
                onGardenClick={() => {}}
              />

              {/* Progress Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-card p-4 rounded-3xl border border-nature-100 text-center">
                  <div className="text-2xl mb-1">🌱</div>
                  <div className="text-xs text-slate-400 font-medium">ระดับการเติบโต</div>
                  <div className="text-base sm:text-lg font-bold text-nature-800 mt-0.5">
                    Stage {progress.growth_level}/5
                  </div>
                </div>

                <div className="glass-card p-4 rounded-3xl border border-nature-100 text-center">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-xs text-slate-400 font-medium">สถิติต่อเนื่องปัจจุบัน</div>
                  <div className="text-base sm:text-lg font-bold text-amber-600 mt-0.5">
                    {progress.consecutive_checkins} วัน
                  </div>
                </div>

                <div className="glass-card p-4 rounded-3xl border border-nature-100 text-center">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-xs text-slate-400 font-medium">สถิติสูงสุด</div>
                  <div className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">
                    {progress.longest_streak || progress.consecutive_checkins} วัน
                  </div>
                </div>

                <div className="glass-card p-4 rounded-3xl border border-nature-100 text-center">
                  <div className="text-2xl mb-1">📅</div>
                  <div className="text-xs text-slate-400 font-medium">เช็กอินสะสมทั้งหมด</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-700 mt-0.5">
                    {progress.total_checkins} วัน
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Real Weather Widget & Today's Summary */}
            <div className="space-y-6">
              <RealWeatherWidget />

              {/* Today's Mood Snapshot */}
              <div className="glass-card rounded-3xl p-5 border border-nature-100 bg-white shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    บันทึกของวันนี้
                  </span>
                  <span className="text-xs text-nature-700 font-medium">
                    {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                {todayStatus?.checkedIn ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-nature-50/80 border border-nature-200">
                      <span className="text-3xl">
                        {todayStatus.todayCheckin?.mood === 'VERY_GOOD' ? '😊' :
                         todayStatus.todayCheckin?.mood === 'GOOD' ? '🙂' :
                         todayStatus.todayCheckin?.mood === 'NEUTRAL' ? '😐' :
                         todayStatus.todayCheckin?.mood === 'WORRIED' ? '😟' : '😞'}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-nature-900">
                          สภาพอากาศใจ: {todayStatus.weather?.label}
                        </div>
                        <div className="text-xs text-slate-500">
                          {todayStatus.todayCheckin?.note || 'ไม่ได้ระบุบันทึกเพิ่มเติม'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-slate-500 mb-3">
                      คุณยังไม่ได้เช็กอินอารมณ์สำหรับวันนี้
                    </p>
                    <button
                      onClick={() => setIsCheckinOpen(true)}
                      className="w-full py-2.5 rounded-2xl bg-nature-100 hover:bg-nature-200 text-nature-800 text-xs font-bold transition"
                    >
                      เริ่มเช็กอินตอนนี้ 🌱
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Navigation to History */}
              <div
                onClick={() => setCurrentTab('history')}
                className="glass-card rounded-3xl p-5 border border-slate-200 bg-white shadow-xs hover:border-nature-300 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-nature-50 border border-nature-200 flex items-center justify-center text-nature-700">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-nature-900">
                      ดูบันทึก Mood Journey ย้อนหลัง
                    </div>
                    <div className="text-xs text-slate-400">เช็กอินสะสมแล้ว {history.length} วัน</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-nature-700 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Mood Journey & Trends Tab */}
      {currentTab === 'history' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MoodTrendChart trendData={trendData} periodDays={14} />
            <MoodJourneyView history={history} />
          </div>
        </div>
      )}

      {/* View 3: Appointments Tab */}
      {currentTab === 'appointments' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white space-y-6">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <span>การนัดหมายและการให้คำปรึกษาของฉัน</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ตารางนัดหมายพูดคุยกับคุณครูแนะแนว
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-800 font-semibold border border-sky-200">
                ทั้งหมด {appointments.length} นัดหมาย
              </span>
            </div>

            {appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((ap) => (
                  <div
                    key={ap.id}
                    className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AppointmentStatusBadge status={ap.status} />
                        <span className="text-xs font-bold text-slate-800">
                          {ap.appointment_date} เวลา {ap.appointment_time} น.
                        </span>
                      </div>
                      <div className="text-base font-bold text-slate-900">{ap.topic}</div>
                      {ap.notes && <div className="text-xs text-slate-500">{ap.notes}</div>}
                      <div className="text-xs text-nature-800 font-medium">
                        ผู้ให้คำปรึกษา: {ap.counselor_name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-slate-700">ไม่มีการนัดหมายในขณะนี้</p>
                <p className="text-xs text-slate-400 mt-1">สามารถติดต่อคุณครูแนะแนวได้ที่ห้องแนะแนว อาคาร 3</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mood Check-in Modal */}
      <MoodCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        onCheckinSuccess={handleCheckinSuccess}
        todayCheckin={todayStatus?.todayCheckin}
        alreadyCheckedIn={todayStatus?.checkedIn}
      />
    </div>
  );
}
