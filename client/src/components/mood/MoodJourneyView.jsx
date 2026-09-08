import React, { useState } from 'react';
import { Calendar, Clock, MessageSquare, Sparkles } from 'lucide-react';

export function MoodJourneyView({ history = [] }) {
  const [selectedRecord, setSelectedRecord] = useState(null);

  const moodMap = {
    VERY_GOOD: { emoji: '😊', label: 'ดีมาก', weather: '☀️ แดดสดใส', bg: 'bg-amber-50 border-amber-200 text-amber-900' },
    GOOD: { emoji: '🙂', label: 'ดี', weather: '🌤️ มีแดดรำไร', bg: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
    NEUTRAL: { emoji: '😐', label: 'เฉย ๆ', weather: '☁️ เมฆลอยเอื่อย', bg: 'bg-slate-50 border-slate-200 text-slate-900' },
    WORRIED: { emoji: '😟', label: 'กังวล', weather: '🌧️ ฝนพรำนุ่มนวล', bg: 'bg-sky-50 border-sky-200 text-sky-900' },
    NOT_GOOD: { emoji: '😞', label: 'ไม่ค่อยดี', weather: '🌧️ สายฝนรดน้ำ', bg: 'bg-teal-50 border-teal-200 text-teal-900' },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (history.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center text-slate-500">
        <Sparkles className="w-8 h-8 text-nature-400 mx-auto mb-2 opacity-80" />
        <p className="font-semibold text-slate-700">ยังไม่มีประวัติการเช็กอิน</p>
        <p className="text-xs text-slate-400 mt-1">เริ่มเช็กอินวันนี้เพื่อบันทึกการเติบโตของคุณ 🌱</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-nature-600" />
          <span>บันทึกความรู้สึกย้อนหลัง (Mood Journey)</span>
        </h3>
        <span className="text-xs text-slate-400">ทั้งหมด {history.length} รายการ</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
        {history.map((item) => {
          const m = moodMap[item.mood] || moodMap.GOOD;
          const isSelected = selectedRecord?.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedRecord(isSelected ? null : item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${m.bg} ${
                isSelected ? 'ring-2 ring-nature-500 shadow-md' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{m.emoji}</span>
                  <div>
                    <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      {m.label}
                      <span className="text-[11px] font-normal text-slate-500">{m.weather}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDate(item.checkin_date)}
                    </div>
                  </div>
                </div>
              </div>

              {item.note ? (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs text-slate-700 flex items-start gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{item.note}</span>
                </div>
              ) : (
                <div className="mt-1 text-[11px] text-slate-400 italic">ไม่ได้ระบุบันทึกเพิ่มเติม</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
