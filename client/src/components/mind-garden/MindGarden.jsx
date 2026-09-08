import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, Cloud, CloudRain, Volume2, VolumeX, Info, Wind, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ambientAudio } from '../../services/ambientAudio';
import { BreathingExerciseModal } from './BreathingExerciseModal';
import { GratitudeJarModal } from './GratitudeJarModal';

export function MindGarden({ growthLevel = 0, totalCheckins = 0, consecutiveCheckins = 0, mood = 'GOOD', onGardenClick }) {
  const [interactiveEffects, setInteractiveEffects] = useState([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isGratitudeOpen, setIsGratitudeOpen] = useState(false);

  // Growth Stage info
  const stages = [
    { name: 'เมล็ดพันธุ์แห่งใจ (Seed)', desc: 'จุดเริ่มต้นของการดูแลตัวเอง', min: 0, max: 0, icon: '🌱' },
    { name: 'ต้นกล้าผลิใบ (Sprout)', desc: 'ใบอ่อนเริ่มผลิรับแสงแดด (1-2 วัน)', min: 1, max: 2, icon: '🌱' },
    { name: 'ต้นไม้วัยเยาว์ (Young Plant)', desc: 'ลำต้นตั้งตรง แตกกิ่งก้าน (3-6 วัน)', min: 3, max: 6, icon: '🌿' },
    { name: 'ต้นไม้เริ่มเติบใหญ่ (Small Tree)', desc: 'พุ่มใบเขียวขจี ให้ร่มเงา (7-13 วัน)', min: 7, max: 13, icon: '🌳' },
    { name: 'ต้นไม้แผ่กิ่งก้าน (Growing Tree)', desc: 'รากหยั่งลึก มีดอกไม้เบ่งบาน (14-29 วัน)', min: 14, max: 29, icon: '🌳' },
    { name: 'ต้นไม้ใหญ่สมบูรณ์ (Mature Tree)', desc: 'ร่มรื่น สวยงาม และแข็งแกร่ง (30+ วัน)', min: 30, max: 999, icon: '🌳' },
  ];

  const currentStage = stages[Math.min(growthLevel, 5)] || stages[0];

  // Weather config based on mood
  const weatherConfig = {
    VERY_GOOD: {
      skyGradient: 'linear-gradient(180deg, #BAE6FD 0%, #E0F2FE 40%, #FEF3C7 75%, #D1FAE5 100%)',
      sunOpacity: 1,
      sunGlow: '#FDE047',
      cloudCount: 2,
      cloudOpacity: 0.35,
      isRaining: false,
      rainIntensity: 0,
      label: 'แดดสดใส อบอุ่น',
      icon: '☀️',
    },
    GOOD: {
      skyGradient: 'linear-gradient(180deg, #93C5FD 0%, #BAE6FD 45%, #FEF9C3 80%, #DCFCE7 100%)',
      sunOpacity: 0.85,
      sunGlow: '#FEF08A',
      cloudCount: 3,
      cloudOpacity: 0.5,
      isRaining: false,
      rainIntensity: 0,
      label: 'มีแดดรำไร เมฆโปร่งสบาย',
      icon: '🌤️',
    },
    NEUTRAL: {
      skyGradient: 'linear-gradient(180deg, #CBD5E1 0%, #E2E8F0 50%, #F1F5F9 80%, #E2E8F0 100%)',
      sunOpacity: 0.4,
      sunGlow: '#F1F5F9',
      cloudCount: 5,
      cloudOpacity: 0.75,
      isRaining: false,
      rainIntensity: 0,
      label: 'เมฆลอยเอื่อย ผ่อนคลาย',
      icon: '☁️',
    },
    WORRIED: {
      skyGradient: 'linear-gradient(180deg, #94A3B8 0%, #CBD5E1 45%, #E2E8F0 75%, #D1FAE5 100%)',
      sunOpacity: 0.2,
      sunGlow: '#CBD5E1',
      cloudCount: 6,
      cloudOpacity: 0.85,
      isRaining: true,
      rainIntensity: 12,
      label: 'ฝนพรำนุ่มนวล ชุ่มชื้น',
      icon: '🌧️',
    },
    NOT_GOOD: {
      skyGradient: 'linear-gradient(180deg, #64748B 0%, #94A3B8 40%, #CBD5E1 75%, #CCFBF1 100%)',
      sunOpacity: 0.1,
      sunGlow: '#94A3B8',
      cloudCount: 7,
      cloudOpacity: 0.95,
      isRaining: true,
      rainIntensity: 24,
      label: 'สายฝนรดน้ำหล่อเลี้ยงราก',
      icon: '🌧️',
    }
  };

  const weather = weatherConfig[mood] || weatherConfig.GOOD;

  const handleToggleAudio = (e) => {
    e.stopPropagation();
    const playing = ambientAudio.toggle(0.2);
    setIsAudioPlaying(playing);
  };

  const handleCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newEffect = {
      id: Date.now() + Math.random(),
      x,
      y,
      emoji: ['✨', '🌸', '🍃', '💧', '🌼', '🍀'][Math.floor(Math.random() * 6)]
    };

    setInteractiveEffects((prev) => [...prev.slice(-10), newEffect]);
    if (onGardenClick) onGardenClick();
  };

  useEffect(() => {
    if (interactiveEffects.length > 0) {
      const timer = setTimeout(() => {
        setInteractiveEffects((prev) => prev.slice(1));
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [interactiveEffects]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      ambientAudio.stopNatureAmbiance();
    };
  }, []);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-nature-200/80 bg-white select-none transition-all duration-700">
      {/* Garden Sky & Canvas */}
      <div
        className="relative w-full h-[390px] sm:h-[450px] cursor-pointer overflow-hidden transition-all duration-1000"
        style={{ background: weather.skyGradient }}
        onClick={handleCanvasClick}
      >
        {/* Sun Halo */}
        <div
          className="absolute top-6 right-10 sm:right-16 pointer-events-none transition-all duration-1000"
          style={{ opacity: weather.sunOpacity }}
        >
          <div
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full blur-2xl transition-all duration-1000"
            style={{ backgroundColor: weather.sunGlow, opacity: 0.6 }}
          />
          <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-full shadow-lg shadow-amber-300/50 animate-pulse-subtle flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-yellow-100/40 blur-sm" />
          </div>
          <div className="absolute -inset-4 border border-yellow-300/30 rounded-full animate-spin" style={{ animationDuration: '40s' }} />
        </div>

        {/* Animated Clouds */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-8 -left-20 w-48 h-20 bg-white/80 rounded-full blur-[1px] shadow-sm transition-all duration-1000"
            style={{ opacity: weather.cloudOpacity, animation: 'float 22s linear infinite', transform: 'scale(1.1)' }}
          >
            <div className="absolute -top-6 left-8 w-20 h-20 bg-white/90 rounded-full" />
            <div className="absolute -top-10 left-20 w-24 h-24 bg-white/95 rounded-full" />
          </div>

          <div
            className="absolute top-20 right-12 w-44 h-16 bg-white/75 rounded-full blur-[1px] transition-all duration-1000"
            style={{ opacity: weather.cloudOpacity * 0.9, animation: 'float 28s ease-in-out infinite reverse' }}
          >
            <div className="absolute -top-7 left-12 w-20 h-20 bg-white/85 rounded-full" />
          </div>
        </div>

        {/* Dynamic Falling Rain Particles */}
        {weather.isRaining && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: weather.rainIntensity }).map((_, i) => (
              <div
                key={i}
                className="absolute w-[2px] h-6 bg-gradient-to-b from-sky-300/20 to-sky-400/80 rounded-full animate-rain-drop"
                style={{
                  left: `${(i * 100) / weather.rainIntensity + (i % 3) * 2}%`,
                  top: `${-20 - (i % 5) * 15}px`,
                  animationDuration: `${0.8 + (i % 5) * 0.2}s`,
                  animationDelay: `${(i * 0.15)}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Rolling Hills (SVG) */}
        <div className="absolute bottom-0 inset-x-0 h-44 sm:h-48 pointer-events-none">
          <svg viewBox="0 0 1200 320" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hillGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7BB58D" />
                <stop offset="100%" stopColor="#4A7C59" />
              </linearGradient>
              <linearGradient id="hillGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8EC49F" />
                <stop offset="100%" stopColor="#3A6346" />
              </linearGradient>
              <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4A7C59" />
                <stop offset="60%" stopColor="#2F5038" />
                <stop offset="100%" stopColor="#1E3A25" />
              </linearGradient>
            </defs>
            <path d="M0,180 Q350,110 700,160 T1200,140 L1200,320 L0,320 Z" fill="url(#hillGrad1)" opacity="0.85" />
            <path d="M0,210 Q400,140 800,190 T1200,180 L1200,320 L0,320 Z" fill="url(#hillGrad2)" />
            <path d="M0,260 Q600,240 1200,260 L1200,320 L0,320 Z" fill="url(#soilGrad)" />
          </svg>
        </div>

        {/* Tree Centerpiece */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
          <TreeVisual growthLevel={growthLevel} mood={mood} />
        </div>

        {/* Ground Flowers */}
        <div className="absolute bottom-2 inset-x-0 h-10 flex justify-around items-end px-6 pointer-events-none">
          <span className="text-xl animate-sway opacity-90">🌱</span>
          {growthLevel >= 1 && <span className="text-lg opacity-85">🌼</span>}
          {growthLevel >= 2 && <span className="text-xl opacity-90 animate-bounce" style={{ animationDuration: '4s' }}>🌸</span>}
          {growthLevel >= 3 && <span className="text-2xl opacity-90">🌺</span>}
          {growthLevel >= 4 && <span className="text-xl opacity-90">🌻</span>}
          {growthLevel >= 5 && <span className="text-2xl opacity-90 animate-pulse">🌷</span>}
          <span className="text-xl animate-sway opacity-85" style={{ animationDelay: '1s' }}>🌿</span>
        </div>

        {/* Interactive Click Particles */}
        {interactiveEffects.map((effect) => (
          <div
            key={effect.id}
            className="absolute pointer-events-none text-2xl font-bold transition-all transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${effect.x}px`,
              top: `${effect.y}px`,
              animation: 'float 1.2s ease-out forwards',
              opacity: 0.95
            }}
          >
            {effect.emoji}
          </div>
        ))}

        {/* Top Header Overlay inside Mind Garden */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
          {/* Weather Pill */}
          <div className="flex items-center gap-2 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-white/60 text-xs sm:text-sm font-medium text-slate-700">
            <span className="text-base">{weather.icon}</span>
            <span>สภาพอากาศใจ: <strong className="text-nature-700">{weather.label}</strong></span>
          </div>

          {/* Action Tools (Audio + Growth Tooltip) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleAudio}
              className={`p-2 rounded-full backdrop-blur-md shadow-sm border transition flex items-center justify-center ${
                isAudioPlaying
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-400/30'
                  : 'bg-white/85 hover:bg-white text-slate-600 border-white/60'
              }`}
              title={isAudioPlaying ? 'ปิดเสียงบรรยากาศธรรมชาติ' : 'เปิดเสียงบรรยากาศธรรมชาติ (Ambient Sound)'}
            >
              {isAudioPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(!showTooltip);
              }}
              className="flex items-center gap-1.5 bg-white/85 hover:bg-white backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/60 text-xs font-semibold text-nature-800 transition"
              title="ดูข้อมูลการเติบโต"
            >
              <span>{currentStage.icon}</span>
              <span className="hidden sm:inline">{currentStage.name}</span>
              <Info className="w-3.5 h-3.5 text-nature-600" />
            </button>
          </div>
        </div>

        {/* Info Modal / Tooltip Popover */}
        {showTooltip && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-14 right-4 z-30 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-nature-100 text-xs text-slate-700 animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-center justify-between border-b pb-2 mb-2 font-semibold text-nature-800">
              <span className="flex items-center gap-1">🌱 ระดับการเติบโตของต้นไม้</span>
              <button onClick={() => setShowTooltip(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <p className="text-slate-500 mb-2 leading-relaxed">
              ต้นไม้ใน Mind Garden เติบโตจาก <strong>ความสม่ำเสมอในการเช็กอิน</strong> ไม่ใช่จากการมีอารมณ์ดี ทุกความรู้สึกมีคุณค่าและช่วยให้ต้นไม้เติบโต
            </p>
            <div className="space-y-1.5">
              {stages.map((st, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-1.5 rounded-lg ${
                    growthLevel === idx ? 'bg-nature-100/90 font-medium text-nature-900 border border-nature-300' : 'text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{st.icon}</span>
                    <span>{st.name.split(' (')[0]}</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {idx === 0 ? '0 วัน' : idx === 5 ? '30+ วัน' : `${st.min}-${st.max} วัน`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floating Self-Care Tools Center Overlay */}
        <div className="absolute top-16 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsBreathingOpen(true);
            }}
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-emerald-200 text-xs font-bold text-emerald-800 transition transform hover:scale-105 active:scale-95"
          >
            <Wind className="w-3.5 h-3.5 text-emerald-600" />
            <span>ฝึกลมหายใจ</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsGratitudeOpen(true);
            }}
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-amber-200 text-xs font-bold text-amber-800 transition transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ขวดโหลความสุข</span>
          </button>
        </div>

        {/* Bottom Banner */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
          <div className="bg-slate-900/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] sm:text-xs">
            แตะที่สวนเพื่อรดน้ำและส่งพลังใจ ✨
          </div>
          <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-nature-800 text-[11px] sm:text-xs font-medium">
            เช็กอินสะสม: <strong>{totalCheckins}</strong> วัน
          </div>
        </div>
      </div>

      {/* Garden Stats Summary Footer */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-cream-50 via-white to-nature-50 border-t border-nature-100 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-nature-100 flex items-center justify-center text-xl shadow-inner">
            {currentStage.icon}
          </div>
          <div>
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              {currentStage.name}
              <span className="text-xs px-2 py-0.5 rounded-full bg-nature-100 text-nature-800 font-medium">
                Stage {growthLevel}/5
              </span>
            </div>
            <p className="text-xs text-slate-500">{currentStage.desc}</p>
          </div>
        </div>

        {/* Streak Indicator */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">ความสม่ำเสมอต่อเนื่อง</div>
            <div className="text-base font-bold text-nature-700 flex items-center justify-end gap-1">
              🔥 {consecutiveCheckins} วัน
            </div>
          </div>
        </div>
      </div>

      {/* Breathing Exercise Modal */}
      <BreathingExerciseModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      {/* Gratitude Jar Modal */}
      <GratitudeJarModal
        isOpen={isGratitudeOpen}
        onClose={() => setIsGratitudeOpen(false)}
      />
    </div>
  );
}

// Procedural Tree Graphics for All 6 Growth Stages
function TreeVisual({ growthLevel, mood }) {
  if (growthLevel <= 0) {
    return (
      <div className="relative flex flex-col items-center mb-1">
        <div className="w-16 h-16 bg-amber-200/30 rounded-full blur-md absolute -top-4" />
        <div className="w-6 h-8 bg-amber-800 rounded-full border border-amber-900/60 shadow-md relative flex items-center justify-center transform rotate-12">
          <div className="w-1.5 h-3 bg-amber-600/60 rounded-full" />
          <div className="absolute -top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full" />
        </div>
        <div className="w-16 h-4 bg-amber-950/80 rounded-full mt-1 blur-[0.5px]" />
      </div>
    );
  }

  if (growthLevel === 1) {
    return (
      <div className="relative flex flex-col items-center mb-1 animate-sway">
        <div className="w-2 h-14 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full relative">
          <div className="absolute top-1 -left-5 w-6 h-4 bg-emerald-400 rounded-tl-full rounded-br-full transform -rotate-45 shadow-sm border border-emerald-300">
            <div className="w-1.5 h-1.5 bg-sky-200 rounded-full absolute top-1 left-2 shadow" />
          </div>
          <div className="absolute top-2 -right-5 w-6 h-4 bg-emerald-500 rounded-tr-full rounded-bl-full transform rotate-45 shadow-sm border border-emerald-400" />
        </div>
        <div className="w-12 h-3 bg-emerald-950/40 rounded-full blur-[1px]" />
      </div>
    );
  }

  if (growthLevel === 2) {
    return (
      <div className="relative flex flex-col items-center mb-2 animate-sway" style={{ animationDuration: '5s' }}>
        <div className="w-3 h-24 bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-400 rounded-full relative">
          <div className="absolute top-12 -left-8 w-9 h-5 bg-emerald-500 rounded-tl-full rounded-br-full transform -rotate-30 shadow" />
          <div className="absolute top-14 -right-8 w-9 h-5 bg-emerald-600 rounded-tr-full rounded-bl-full transform rotate-30 shadow" />
          <div className="absolute top-4 -left-7 w-8 h-5 bg-emerald-400 rounded-tl-full rounded-br-full transform -rotate-45 shadow" />
          <div className="absolute top-6 -right-7 w-8 h-5 bg-emerald-500 rounded-tr-full rounded-bl-full transform rotate-45 shadow" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-7 bg-emerald-300 rounded-full shadow" />
        </div>
        <div className="w-16 h-4 bg-emerald-950/40 rounded-full blur-[1px]" />
      </div>
    );
  }

  if (growthLevel === 3) {
    return (
      <div className="relative flex flex-col items-center mb-2">
        <div className="relative -mb-4 z-10">
          <div className="w-32 h-28 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-400 rounded-full shadow-lg relative flex items-center justify-center animate-pulse-subtle">
            <div className="absolute top-2 left-4 w-12 h-10 bg-emerald-300/40 rounded-full blur-xs" />
            <div className="absolute bottom-3 right-4 w-10 h-8 bg-emerald-700/30 rounded-full" />
            <div className="absolute -top-3 left-6 w-16 h-14 bg-emerald-400 rounded-full opacity-90" />
            <div className="absolute top-3 -right-3 w-16 h-14 bg-emerald-500 rounded-full opacity-90" />
          </div>
        </div>
        <div className="w-6 h-28 bg-gradient-to-b from-amber-800 to-amber-900 rounded-b-lg relative shadow-inner">
          <div className="w-1.5 h-16 bg-amber-950/40 mx-auto mt-2 rounded-full" />
        </div>
        <div className="w-24 h-5 bg-emerald-950/50 rounded-full -mt-2 blur-[1px]" />
      </div>
    );
  }

  if (growthLevel === 4) {
    return (
      <div className="relative flex flex-col items-center mb-2">
        <div className="relative -mb-6 z-10">
          <div className="w-48 h-36 bg-gradient-to-tr from-emerald-700 via-emerald-500 to-green-300 rounded-full shadow-xl relative flex items-center justify-center">
            <div className="absolute -top-5 left-10 w-24 h-20 bg-emerald-400 rounded-full opacity-95 shadow" />
            <div className="absolute -top-2 right-6 w-24 h-20 bg-emerald-500 rounded-full opacity-95 shadow" />
            <div className="absolute top-10 -left-5 w-20 h-18 bg-emerald-600 rounded-full opacity-95 shadow" />
            <div className="absolute top-12 -right-5 w-20 h-18 bg-emerald-600 rounded-full opacity-95 shadow" />
            <span className="absolute top-4 left-14 text-sm animate-bounce">🌸</span>
            <span className="absolute top-8 right-16 text-sm animate-bounce" style={{ animationDelay: '1s' }}>🌺</span>
            <span className="absolute bottom-8 left-20 text-sm">🌼</span>
          </div>
        </div>
        <div className="w-9 h-32 bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 rounded-b-xl relative shadow-md">
          <div className="absolute top-2 -left-4 w-6 h-2.5 bg-amber-800 rounded-l-full transform -rotate-25" />
          <div className="absolute top-4 -right-4 w-6 h-2.5 bg-amber-800 rounded-r-full transform rotate-25" />
        </div>
        <div className="w-32 h-6 bg-emerald-950/60 rounded-full -mt-2 blur-[2px]" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center mb-2">
      <div className="relative -mb-8 z-10">
        <div className="w-60 h-44 bg-gradient-to-tr from-emerald-800 via-emerald-600 to-green-300 rounded-full shadow-2xl relative flex items-center justify-center">
          <div className="absolute -top-7 left-12 w-32 h-24 bg-emerald-400 rounded-full opacity-95 shadow" />
          <div className="absolute -top-4 right-8 w-32 h-24 bg-emerald-500 rounded-full opacity-95 shadow" />
          <div className="absolute top-12 -left-7 w-28 h-22 bg-emerald-700 rounded-full opacity-95 shadow" />
          <div className="absolute top-14 -right-7 w-28 h-22 bg-emerald-600 rounded-full opacity-95 shadow" />
          <span className="absolute top-6 left-16 text-base animate-pulse">🌸</span>
          <span className="absolute top-10 right-20 text-base animate-pulse" style={{ animationDelay: '0.8s' }}>🍎</span>
          <span className="absolute bottom-10 left-24 text-base">🌼</span>
          <span className="absolute bottom-8 right-24 text-base">🌺</span>
          <span className="absolute -top-6 right-6 text-xl animate-float-slow">🦋</span>
        </div>
      </div>
      <div className="w-12 h-36 bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 rounded-b-2xl relative shadow-xl">
        <div className="absolute top-2 left-2 w-1.5 h-20 bg-amber-950/40 rounded-full" />
        <div className="absolute top-6 right-3 w-1.5 h-16 bg-amber-950/50 rounded-full" />
        <div className="absolute top-1 -left-7 w-9 h-3 bg-amber-800 rounded-l-full transform -rotate-30" />
        <div className="absolute top-3 -right-7 w-9 h-3 bg-amber-800 rounded-r-full transform rotate-30" />
      </div>
      <div className="w-44 h-7 bg-emerald-950/70 rounded-full -mt-2 blur-[2px]" />
    </div>
  );
}
