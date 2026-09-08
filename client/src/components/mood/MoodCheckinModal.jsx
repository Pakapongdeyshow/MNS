import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, AlertCircle, X, Heart, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';

export function MoodCheckinModal({ isOpen, onClose, onCheckinSuccess, todayCheckin, alreadyCheckedIn }) {
  const [selectedMood, setSelectedMood] = useState('GOOD');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (todayCheckin) {
      setSelectedMood(todayCheckin.mood || 'GOOD');
      setNote(todayCheckin.note || '');
    } else {
      setSelectedMood('GOOD');
      setNote('');
    }
    setError(null);
    setSuccess(false);
  }, [isOpen, todayCheckin]);

  if (!isOpen) return null;

  const moodOptions = [
    {
      code: 'VERY_GOOD',
      emoji: '😊',
      label: 'ดีมาก',
      weather: '☀️ แดดสดใส อบอุ่น',
      color: 'hover:border-amber-400 hover:bg-amber-50',
      activeColor: 'border-amber-500 bg-amber-50 ring-2 ring-amber-300',
    },
    {
      code: 'GOOD',
      emoji: '🙂',
      label: 'ดี',
      weather: '🌤️ มีแดดรำไร เมฆโปร่ง',
      color: 'hover:border-emerald-400 hover:bg-emerald-50',
      activeColor: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300',
    },
    {
      code: 'NEUTRAL',
      emoji: '😐',
      label: 'เฉย ๆ',
      weather: '☁️ เมฆลอยเอื่อย ผ่อนคลาย',
      color: 'hover:border-slate-400 hover:bg-slate-50',
      activeColor: 'border-slate-500 bg-slate-50 ring-2 ring-slate-300',
    },
    {
      code: 'WORRIED',
      emoji: '😟',
      label: 'กังวล',
      weather: '🌧️ ฝนพรำนุ่มนวล ชุ่มชื้น',
      color: 'hover:border-sky-400 hover:bg-sky-50',
      activeColor: 'border-sky-500 bg-sky-50 ring-2 ring-sky-300',
    },
    {
      code: 'NOT_GOOD',
      emoji: '😞',
      label: 'ไม่ค่อยดี',
      weather: '🌧️ สายฝนรดน้ำหล่อเลี้ยงราก',
      color: 'hover:border-teal-400 hover:bg-teal-50',
      activeColor: 'border-teal-600 bg-teal-50 ring-2 ring-teal-300',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (alreadyCheckedIn) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.checkinMood(selectedMood, note);

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#4A7C59', '#7BB58D', '#FDE047', '#38BDF8', '#F472B6']
      });

      setSuccess(true);
      if (onCheckinSuccess) {
        onCheckinSuccess(result);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'ไม่สามารถบันทึกการเช็กอินได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-nature-100 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-nature-500 to-emerald-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Daily Mood Check-in</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">วันนี้ใจของคุณเป็นอย่างไรบ้าง?</h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            ทุกความรู้สึกมีคุณค่า และช่วยให้ต้นไม้ของคุณเติบโต 🌱
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {alreadyCheckedIn ? (
            <div className="p-4 rounded-2xl bg-nature-50 border border-nature-200 text-nature-800 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-nature-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">วันนี้คุณเช็กอินเรียบร้อยแล้ว ✨</div>
                <p className="text-xs text-nature-600 mt-0.5">
                  คุณได้บันทึกความรู้สึกของวันนี้แล้ว ต้นไม้ได้รับพลังใจและกำลังเติบโตอย่างงดงาม
                </p>
              </div>
            </div>
          ) : null}

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mood Options Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              เลือกสภาพอากาศใจของคุณวันนี้
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {moodOptions.map((opt) => {
                const isSelected = selectedMood === opt.code;
                return (
                  <button
                    type="button"
                    key={opt.code}
                    disabled={alreadyCheckedIn}
                    onClick={() => setSelectedMood(opt.code)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? opt.activeColor + ' shadow-md scale-[1.02]'
                        : 'border-slate-200 bg-white ' + opt.color
                    } ${alreadyCheckedIn ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
                  >
                    <span className="text-3xl mb-1.5 transform hover:scale-110 transition">{opt.emoji}</span>
                    <span className="text-sm font-bold text-slate-800">{opt.label}</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">{opt.weather.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              บันทึกสั้น ๆ เกี่ยวกับวันนี้ (ไม่บังคับ)
            </label>
            <textarea
              disabled={alreadyCheckedIn}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="อยากจดบันทึกอะไรไว้ให้ตัวเองไหม เช่น เรื่องดีๆ หรือสิ่งที่กำลังคิดอยู่..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-nature-400 focus:border-transparent resize-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {/* Weather preview footer */}
          <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-nature-600" />
              <span>ผลลัพธ์ในสวน:</span>
            </span>
            <span className="font-semibold text-nature-800">
              {moodOptions.find((m) => m.code === selectedMood)?.weather}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              {alreadyCheckedIn ? 'ปิดหน้าต่าง' : 'ยกเลิก'}
            </button>
            {!alreadyCheckedIn && (
              <button
                type="submit"
                disabled={loading || success}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-nature-500 to-emerald-600 hover:from-nature-600 hover:to-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span>กำลังบันทึก...</span>
                ) : success ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> บันทึกสำเร็จ!
                  </span>
                ) : (
                  <span>บันทึกการเช็กอิน 🌱</span>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
