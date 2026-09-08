import React from 'react';
import { PhoneCall, Heart, X, ShieldAlert, LifeBuoy, Sparkles, AlertTriangle } from 'lucide-react';

export function EmergencyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const hotlines = [
    {
      name: 'สายด่วนสุขภาพจิต (Mental Health Hotline)',
      number: '1323',
      desc: 'โทรฟรี ตลอด 24 ชั่วโมง โดยกรมสุขภาพจิต พร้อมผู้เชี่ยวชาญรับฟังและให้คำปรึกษา',
      color: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      badge: '24 ชม. ฟรี'
    },
    {
      name: 'ศูนย์ช่วยเหลือสังคมและเยาวชน (OSCC)',
      number: '1300',
      desc: 'กระทรวงการพัฒนาสังคมและความมั่นคงของมนุษย์ (พม.) ช่วยเหลือปัญหาความรุนแรงและครอบครัว',
      color: 'bg-sky-50 border-sky-300 text-sky-900',
      badge: '24 ชม.'
    },
    {
      name: 'มูลนิธิสายเด็ก (Childline Thailand)',
      number: '1387',
      desc: 'รับฟังและช่วยเหลือเยาวชนทุกเรื่องโดยไม่ตัดสิน',
      color: 'bg-purple-50 border-purple-300 text-purple-900',
      badge: 'ฟรี'
    },
    {
      name: 'ห้องแนะแนวและพยาบาลประจำโรงเรียน',
      number: '02-123-4567',
      desc: 'ติดต่อครูแนะแนวเวรประจำวัน หรือห้องพยาบาล อาคาร 3 ชั้น 1',
      color: 'bg-amber-50 border-amber-300 text-amber-900',
      badge: 'ในเวลาทำการ'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-red-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-100">
            <LifeBuoy className="w-4 h-4 text-white" />
            <span>Emergency Support • ศูนย์ช่วยเหลือด่วน</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
            คุณไม่ได้อยู่คนเดียว ❤️
          </h2>
          <p className="text-xs text-red-100 mt-0.5 leading-relaxed">
            หากกำลังเผชิญช่วงเวลาที่ยากลำบาก มีคนที่พร้อมรับฟังและเคียงข้างคุณเสมอ
          </p>
        </div>

        {/* Hotlines List */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {hotlines.map((h, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${h.color}`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{h.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200">
                    {h.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{h.desc}</p>
              </div>

              <a
                href={`tel:${h.number.replace(/-/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 transition shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>โทร {h.number}</span>
              </a>
            </div>
          ))}

          {/* Reassurance Footer */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>ความรู้สึกของคุณสำคัญเสมอ</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              การขอความช่วยเหลือไม่ใช่ความอ่อนแอ แต่คือความกล้าหาญในการดูแลตัวเอง 🌱
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
