import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, RefreshCw, Compass } from 'lucide-react';
import { getRealWeather } from '../../services/weatherApi';

export function RealWeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    const data = await getRealWeather();
    setWeather(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div className="glass-card rounded-3xl p-5 border border-sky-100/80 bg-gradient-to-br from-sky-50/60 via-white to-sky-50/30 shadow-sm relative overflow-hidden">
      {/* Decorative Sky Aura */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-sky-600" />
          <span>สภาพอากาศจริงภายนอก (Real Weather)</span>
        </div>
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="p-1 rounded-full text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
          title="รีเฟรชสภาพอากาศจริง"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
        </button>
      </div>

      {weather ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{weather.icon}</span>
            <div>
              <div className="text-xl font-bold text-slate-800 flex items-baseline gap-1">
                {weather.temp}°C
                <span className="text-xs font-normal text-slate-500">{weather.condition}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {weather.location} • อัปเดต {weather.updatedAt} น.
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-[11px] text-slate-600 border-l border-sky-100 pl-3">
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-sky-500" /> ความชื้น {weather.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-sky-500" /> ลม {weather.wind} km/h
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-400 py-2">กำลังโหลดสภาพอากาศ...</div>
      )}

      {/* Note about separation */}
      <div className="mt-3 pt-2.5 border-t border-sky-100/60 text-[11px] text-slate-500 leading-relaxed">
        ℹ️ ข้อมูลสภาพอากาศภายนอกแยกส่วนจาก <strong>สภาพอากาศใจใน Mind Garden</strong> เพื่อความแม่นยำในการดูแลตนเอง
      </div>
    </div>
  );
}
