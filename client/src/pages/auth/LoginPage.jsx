import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  HeartHandshake, 
  PhoneCall, 
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function LoginPage({ onOpenDemoModal }) {
  const { login, loginWithGoogle } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // If real Google Client ID is configured and GIS is available in window
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            try {
              setLoading(true);
              await loginWithGoogle({ credential: response.credential });
            } catch (err) {
              setError(err.message || 'การเข้าสู่ระบบด้วย Google ล้มเหลว');
            } finally {
              setLoading(false);
            }
          }
        });
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        console.warn('Google GIS prompt error:', e);
      }
    }

    // Otherwise show elegant Google Sign-In helper modal
    setShowGoogleModal(true);
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle({
        email: googleEmail.trim(),
        name: googleName.trim() || googleEmail.split('@')[0],
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${googleEmail.trim()}`
      });
      setShowGoogleModal(false);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
    } finally {
      setLoading(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(identifier.trim(), password);
    } catch (err) {
      setError(err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 flex flex-col justify-between text-white relative overflow-hidden">
      {/* Ambient background glow elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Branding Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900/80 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🌱</span>
            </div>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
              MindNote Student
            </h1>
            <p className="text-xs text-emerald-300/80 font-medium">
              ระบบดูแลและให้คำปรึกษาสุขภาพจิตนักเรียน
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 flex-1">
        
        {/* Left Column: Hero & Psychological Support Intro */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>พื้นที่ปลอดภัยและเป็นมิตรสำหรับเยาวชน</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            เติบโตอย่างมั่นคง <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
              ดูแลใจไปด้วยกันในทุกวัน
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
            บันทึกความรู้สึก รดน้ำต้นไม้แห่งจิตใจใน Mind Garden และรับการดูแลอย่างเข้าใจจากครูแนะแนวและนักจิตวิทยาโรงเรียน
          </p>

          {/* Key Value Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">ความลับปลอดภัย 100%</h4>
                <p className="text-xs text-slate-400 mt-0.5">ข้อมูลการปรึกษาถูกเข้ารหัสและปกป้องอย่างเคร่งครัด</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">จิตวิทยาเชิงบวก</h4>
                <p className="text-xs text-slate-400 mt-0.5">เสริมพลังใจด้วย Mind Garden ไม่มีการลงโทษหรือลดแต้ม</p>
              </div>
            </div>
          </div>

          {/* Emergency Hotline Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 via-red-500/10 to-amber-500/10 border border-rose-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-200">สายด่วนสุขภาพจิต กรมสุขภาพจิต</p>
                <p className="text-[11px] text-slate-300">โทรฟรี ปรึกษาได้ตลอด 24 ชั่วโมง</p>
              </div>
            </div>
            <a 
              href="tel:1323" 
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/30 transition flex items-center gap-1.5"
            >
              <span>1323</span>
            </a>
          </div>
        </div>

        {/* Right Column: Modern Glassmorphic Login Form */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 text-left relative">
            
            {/* Form Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">เข้าสู่ระบบ</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                กรุณากรอกรหัสนักเรียน หรืออีเมลโรงเรียนเพื่อเริ่มต้นใช้งาน
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Identifier (Email / Student Code / Username) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  รหัสนักเรียน หรือ อีเมลโรงเรียน
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="เช่น #001 หรือ student1@school.ac.th"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 focus:border-emerald-400 focus:bg-white/10 rounded-2xl text-sm text-white placeholder-slate-500 outline-none transition duration-200"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    รหัสผ่าน
                  </label>
                  <span className="text-[11px] text-emerald-300/80 hover:text-emerald-200 cursor-pointer">
                    ลืมรหัสผ่าน?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/15 focus:border-emerald-400 focus:bg-white/10 rounded-2xl text-sm text-white placeholder-slate-500 outline-none transition duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 focus:ring-1 cursor-pointer"
                  />
                  <span>จดจำการเข้าสู่ระบบ</span>
                </label>
                <span className="text-slate-500 text-[11px]">
                  เข้าใช้งานด้วยบัญชีโรงเรียน
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <span>เข้าสู่ระบบ</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 text-slate-400 font-medium">
                  หรือเข้าสู่ระบบด้วย
                </span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-2xl shadow-md transition duration-200 flex items-center justify-center gap-3 cursor-pointer hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="px-6 py-4 border-t border-white/10 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 relative z-10">
        <p>© 2026 MindNote Student (MNS) — แพลตฟอร์มดูแลสุขภาพจิตนักเรียนระดับมาตรฐานสถานศึกษา</p>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>นโยบายความเป็นส่วนตัว (PDPA)</span>
          <span>•</span>
          <span>ติดต่อผู้ดูแลระบบ</span>
        </div>
      </footer>

      {/* Google Sign-In Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl text-left animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">เข้าสู่ระบบด้วย Google</h3>
                  <p className="text-xs text-slate-400">ลงชื่อเข้าใช้ด้วยบัญชี Google ของสถานศึกษา</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomGoogleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  อีเมล Google (@gmail.com หรือ @school.ac.th)
                </label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="เช่น student@school.ac.th"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 focus:border-emerald-400 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  ชื่อ-นามสกุล ที่แสดง (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="เช่น นายธนาธิป เจริญสุข"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 focus:border-emerald-400 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 leading-relaxed">
                💡 <b>คำแนะนำ</b>: ระบบจะเชื่อมโยงหรือสร้างบัญชีนักเรียนอัตโนมัติ พร้อมตั้งค่าสวนใจ Mind Garden ให้อย่างสมบูรณ์
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/10"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  {loading ? 'กำลังเข้าสู่ระบบ...' : 'ยืนยันเข้าสู่ระบบ Google'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
