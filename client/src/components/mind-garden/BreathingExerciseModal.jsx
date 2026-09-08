import React, { useState, useEffect } from 'react';
import { Wind, X, Play, Pause, RotateCcw, Heart, Sparkles, CheckCircle } from 'lucide-react';

export function BreathingExerciseModal({ isOpen, onClose }) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('INHALE'); // 'INHALE' (4s) -> 'HOLD' (4s) -> 'EXHALE' (4s) -> 'REST' (4s)
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition phases
            if (phase === 'INHALE') {
              setPhase('HOLD');
              return 4;
            } else if (phase === 'HOLD') {
              setPhase('EXHALE');
              return 4;
            } else if (phase === 'EXHALE') {
              setPhase('REST');
              return 4;
            } else {
              setPhase('INHALE');
              setCyclesCompleted((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, phase]);

  const handleToggle = () => {
    if (!isActive) {
      setPhase('INHALE');
      setSecondsLeft(4);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('INHALE');
    setSecondsLeft(4);
    setCyclesCompleted(0);
  };

  if (!isOpen) return null;

  const phaseConfig = {
    INHALE: {
      text: 'หายใจเข้าช้า ๆ...',
      subtext: 'สูดรับพลังธรรมชาติและความสดชื่นเข้าสู่ร่างกาย',
      scale: 'scale-125',
      color: 'from-emerald-400 to-sky-400',
      textColor: 'text-emerald-700',
      ringColor: 'ring-emerald-300'
    },
    HOLD: {
      text: 'กักลมหายใจเบา ๆ...',
      subtext: 'รับรู้ความนิ่งสงบและผ่อนคลายภายในใจ',
      scale: 'scale-125 ring-8',
      color: 'from-sky-400 to-teal-400',
      textColor: 'text-sky-700',
      ringColor: 'ring-sky-300'
    },
    EXHALE: {
      text: 'ค่อย ๆ ผ่อนลมหายใจออก...',
      subtext: 'ปล่อยวางความตึงเครียดและความกังวลทั้งหมดออกไป',
      scale: 'scale-90',
      color: 'from-teal-400 to-amber-300',
      textColor: 'text-teal-800',
      ringColor: 'ring-teal-300'
    },
    REST: {
      text: 'พักสบาย ๆ...',
      subtext: 'พร้อมสำหรับลมหายใจแห่งพลังใจรอบใหม่',
      scale: 'scale-100',
      color: 'from-amber-300 to-emerald-300',
      textColor: 'text-nature-800',
      ringColor: 'ring-nature-200'
    }
  };

  const current = phaseConfig[phase];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-gradient-to-b from-cream-50 via-white to-nature-50 w-full max-w-lg rounded-3xl shadow-2xl border border-nature-200/80 p-6 sm:p-8 relative overflow-hidden flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-nature-700 uppercase tracking-wider mb-1">
          <Wind className="w-4 h-4" />
          <span>Mindful Breathing • การฝึกลมหายใจ 4-4-4</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          ชะลอใจ สูดพลังธรรมชาติ 🌱
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          การฝึกหายใจช้าๆ ช่วยลดฮอร์โมนความเครียดและคืนสมดุลให้จิตใจ
        </p>

        {/* Interactive Breathing Orb / Tree Centerpiece */}
        <div className="relative my-8 sm:my-10 w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          {/* Pulsing Outer Rings */}
          <div
            className={`absolute inset-0 rounded-full bg-nature-100/50 blur-xl transition-all duration-[4000ms] ease-in-out ${
              isActive ? current.scale : 'scale-100'
            }`}
          />

          {/* Main Breathing Orb */}
          <div
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr ${current.color} shadow-2xl flex flex-col items-center justify-center transition-all duration-[4000ms] ease-in-out text-white relative z-10 ${
              isActive ? current.scale : 'scale-100'
            }`}
          >
            <span className="text-3xl sm:text-4xl mb-1 animate-pulse">🌱</span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight">
              {isActive ? secondsLeft : '4'}
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-90">วินาที</span>
          </div>
        </div>

        {/* Phase Guidance Text */}
        <div className="space-y-1 min-h-[56px]">
          <div className={`text-lg sm:text-xl font-bold transition-all duration-500 ${current.textColor}`}>
            {isActive ? current.text : 'กด "เริ่มฝึกหายใจ" เพื่อเริ่มทำสมาธิ'}
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isActive ? current.subtext : 'ปล่อยวางเรื่องราวต่างๆ และใช้เวลานี้อยู่กับตัวเอง'}
          </p>
        </div>

        {/* Cycle Counter */}
        <div className="mt-4 px-3 py-1 rounded-full bg-white/80 border border-nature-200 text-xs font-semibold text-nature-800">
          ✨ ฝึกสำเร็จแล้ว {cyclesCompleted} รอบ
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition transform hover:scale-105 active:scale-95 ${
              isActive
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                : 'bg-gradient-to-r from-nature-600 to-emerald-600 hover:from-nature-700 hover:to-emerald-700 shadow-nature-500/25'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>พักชั่วคราว</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>{cyclesCompleted > 0 ? 'ฝึกต่อ' : 'เริ่มฝึกหายใจ'}</span>
              </>
            )}
          </button>

          {cyclesCompleted > 0 && (
            <button
              onClick={handleReset}
              className="p-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 transition"
              title="เริ่มรอบใหม่"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
