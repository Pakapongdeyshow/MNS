import React, { useState } from 'react';
import { TrendingUp, Award, Smile, Info, Heart } from 'lucide-react';

export function MoodTrendChart({ trendData, periodDays = 14 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!trendData || !trendData.records || trendData.records.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center text-slate-500">
        <TrendingUp className="w-8 h-8 text-nature-400 mx-auto mb-2 opacity-80" />
        <p className="font-semibold text-slate-700">ยังไม่มีข้อมูลแนวโน้มการเช็กอิน</p>
        <p className="text-xs text-slate-400 mt-1">
          เช็กอินอย่างสม่ำเสมอเพื่อดูเส้นทางการเติบโตของตนเอง
        </p>
      </div>
    );
  }

  const moodScore = {
    VERY_GOOD: 5,
    GOOD: 4,
    NEUTRAL: 3,
    WORRIED: 2,
    NOT_GOOD: 1,
  };

  const moodDetails = {
    VERY_GOOD: { emoji: '😊', label: 'ดีมาก', color: '#F59E0B' },
    GOOD: { emoji: '🙂', label: 'ดี', color: '#10B981' },
    NEUTRAL: { emoji: '😐', label: 'เฉย ๆ', color: '#64748B' },
    WORRIED: { emoji: '😟', label: 'กังวล', color: '#0EA5E9' },
    NOT_GOOD: { emoji: '😞', label: 'ไม่ค่อยดี', color: '#0D9488' },
  };

  const records = trendData.records;
  const dist = trendData.distribution || {};
  const total = dist.TOTAL || records.length;

  // Chart dimensions
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 30;
  const paddingY = 25;

  const points = records.map((r, i) => {
    const x = paddingX + (i / Math.max(records.length - 1, 1)) * (chartWidth - paddingX * 2);
    const score = moodScore[r.mood] || 3;
    const y = chartHeight - paddingY - ((score - 1) / 4) * (chartHeight - paddingY * 2);
    return { x, y, ...r };
  });

  // SVG Path Line
  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  return (
    <div className="space-y-6">
      {/* Title & Affirmation Note */}
      <div className="glass-card rounded-3xl p-5 border border-nature-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-nature-100 flex items-center justify-center text-nature-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                แนวโน้มการเช็กอิน (Mood Journey)
              </h3>
              <p className="text-xs text-slate-500">
                แสดงภาพรวมการรับรู้ความรู้สึกของตนเองย้อนหลัง {periodDays} วัน
              </p>
            </div>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-full bg-nature-100 text-nature-800 font-medium">
            เช็กอิน {records.length} ครั้ง
          </span>
        </div>

        {/* Visual Line Graph (SVG) */}
        <div className="relative mt-4 bg-white/70 rounded-2xl p-4 border border-slate-100 overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 sm:h-52 overflow-visible">
            {/* Horizontal Grid lines */}
            {[5, 4, 3, 2, 1].map((level) => {
              const y = chartHeight - paddingY - ((level - 1) / 4) * (chartHeight - paddingY * 2);
              return (
                <g key={level}>
                  <line
                    x1={paddingX - 10}
                    y1={y}
                    x2={chartWidth - paddingX + 10}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 18}
                    y={y + 4}
                    fontSize="11"
                    textAnchor="end"
                    fill="#94A3B8"
                  >
                    {level === 5 ? '😊' : level === 4 ? '🙂' : level === 3 ? '😐' : level === 2 ? '😟' : '😞'}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area Fill under line */}
            {points.length > 1 && (
              <path
                d={`${pathD} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`}
                fill="url(#trendGrad)"
                opacity="0.3"
              />
            )}

            <defs>
              <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4A7C59" />
                <stop offset="100%" stopColor="#D2E7D8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Main Trend Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#4A7C59"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Points */}
            {points.map((pt, i) => {
              const detail = moodDetails[pt.mood] || moodDetails.GOOD;
              const isHovered = hoveredIndex === i;

              return (
                <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 7 : 5}
                    fill="#FFFFFF"
                    stroke={detail.color}
                    strokeWidth="3"
                    className="transition-all duration-200"
                  />
                  {/* Point Emoji Indicator */}
                  {isHovered && (
                    <g>
                      <rect
                        x={Math.max(10, Math.min(chartWidth - 110, pt.x - 50))}
                        y={Math.max(10, pt.y - 45)}
                        width="100"
                        height="36"
                        rx="8"
                        fill="#1E293B"
                        className="shadow-lg"
                      />
                      <text
                        x={Math.max(60, Math.min(chartWidth - 60, pt.x))}
                        y={Math.max(26, pt.y - 28)}
                        fontSize="11"
                        fontWeight="bold"
                        fill="#FFFFFF"
                        textAnchor="middle"
                      >
                        {detail.emoji} {detail.label}
                      </text>
                      <text
                        x={Math.max(60, Math.min(chartWidth - 60, pt.x))}
                        y={Math.max(38, pt.y - 16)}
                        fontSize="9"
                        fill="#94A3B8"
                        textAnchor="middle"
                      >
                        {pt.checkin_date}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Date Axis labels preview */}
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-6">
            <span>{records[0]?.checkin_date}</span>
            <span>{records[Math.floor(records.length / 2)]?.checkin_date}</span>
            <span>{records[records.length - 1]?.checkin_date}</span>
          </div>
        </div>

        {/* Distribution Breakdown Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(moodDetails).map(([key, info]) => {
            const count = dist[key] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div
                key={key}
                className="bg-white/80 p-3 rounded-2xl border border-slate-100 flex flex-col items-center text-center shadow-xs"
              >
                <span className="text-2xl mb-1">{info.emoji}</span>
                <span className="text-xs font-semibold text-slate-700">{info.label}</span>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{count} <span className="text-[10px] font-normal text-slate-400">ครั้ง</span></div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: info.color }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Positive Affirmation Footer */}
        <div className="mt-4 p-3 bg-nature-50/70 rounded-2xl border border-nature-100/60 flex items-start gap-2.5 text-xs text-nature-900 leading-relaxed">
          <Heart className="w-4 h-4 text-nature-600 shrink-0 mt-0.5" />
          <span>
            <strong>ข้อคิดประจำใจ:</strong> ทุกความรู้สึกทั้งสุข เฉย หรือกังวล เป็นเรื่องธรรมชาติ การหมั่นสังเกตและรับรู้อารมณ์ของตนเองคือการเติบโตที่มีคุณค่ายิ่ง 🌱
          </span>
        </div>
      </div>
    </div>
  );
}
