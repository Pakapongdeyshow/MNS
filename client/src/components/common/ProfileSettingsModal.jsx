import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  User, 
  BookOpen, 
  Lock, 
  Mail, 
  GraduationCap, 
  Building, 
  Phone, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Sparkles,
  ShieldCheck,
  Camera,
  Upload,
  Trash2,
  Smile
} from 'lucide-react';

const PRESET_AVATARS = [
  '🌱', '🌸', '🌻', '🍀', '🌳', 
  '🐱', '🐶', '🦊', '🐼', '🐨', 
  '🦉', '🦁', '🐬', '🦄', '☀️', 
  '⭐', '🌈', '🎨', '🚀', '👑'
];

export function ProfileSettingsModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setClassName(user.class_name || '');
      setStudentCode(user.student_code || '');
      setDepartment(user.department || 'งานแนะแนวและจิตวิทยาการศึกษา');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setError(null);
      setSuccessMsg(null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Handle custom image file upload & compression
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(dataUrl);
        setError(null);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError('กรุณาระบุชื่อ-นามสกุล');
      return;
    }

    if (isChangingPassword && newPassword) {
      if (newPassword.length < 6) {
        setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('รหัสผ่านยืนยันไม่ตรงกัน');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        class_name: className.trim(),
        student_code: studentCode.trim(),
        department: department.trim(),
        phone: phone.trim(),
        avatar: avatar || null
      };

      if (isChangingPassword && newPassword) {
        payload.password = newPassword.trim();
      }

      await updateProfile(payload);
      setSuccessMsg('บันทึกการเปลี่ยนแปลงข้อมูลสำเร็จเรียบร้อย! ✨');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  }

  // Render Avatar Helper
  const renderAvatarPreview = () => {
    if (!avatar) {
      return (
        <span className="text-2xl font-bold text-white">
          {name ? name.charAt(0) : 'U'}
        </span>
      );
    }

    if (avatar.startsWith('data:image/') || avatar.startsWith('http')) {
      return (
        <img 
          src={avatar} 
          alt="Avatar Preview" 
          className="w-full h-full object-cover rounded-2xl" 
        />
      );
    }

    return <span className="text-3xl">{avatar}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30 overflow-hidden">
                {renderAvatarPreview()}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-emerald-700 shadow-md flex items-center justify-center hover:scale-110 transition cursor-pointer"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-1.5">
                ตั้งค่าข้อมูลส่วนตัว
                <Sparkles className="w-4 h-4 text-emerald-200" />
              </h3>
              <p className="text-xs text-emerald-100 opacity-90">
                {user?.role === 'student' ? 'บัญชีนักเรียน' : 'บัญชีครูแนะแนว / บุคลากร'} • {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Alerts */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs font-medium animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Avatar Selection Section */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-emerald-600" />
                รูปภาพโปรไฟล์ / อวตารน่ารัก
              </label>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>ใช้ตัวอักษรเริ่มต้น</span>
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />

            {/* Avatar Presets Grid */}
            <div className="grid grid-cols-10 gap-1.5 pt-1">
              {PRESET_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg hover:bg-emerald-100 hover:scale-110 transition cursor-pointer ${
                    avatar === emoji ? 'bg-emerald-200 ring-2 ring-emerald-500 scale-105 shadow-xs' : 'bg-white border border-slate-200/60'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Upload Custom Photo Button */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-700 hover:text-emerald-800 flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>อัปโหลดรูปภาพจากเครื่องของคุณ</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              ชื่อ - นามสกุล
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm font-medium text-slate-800 outline-none transition"
              placeholder="เช่น นายกฤตกานต์ สังข์ชุม"
            />
          </div>

          {/* Student Specific Fields */}
          {user?.role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Class Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  ระดับชั้น / ห้องเรียน
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm font-medium text-slate-800 outline-none transition"
                  placeholder="เช่น ม.6/3 หรือ ม.5/1"
                />
              </div>

              {/* Student Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  รหัสนักเรียน / โค้ด
                </label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm font-mono font-medium text-slate-800 outline-none transition"
                  placeholder="เช่น #34164"
                />
              </div>
            </div>
          )}

          {/* Counselor Specific Fields */}
          {user?.role === 'counselor' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  กลุ่มสาระ / หน่วยงาน
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm font-medium text-slate-800 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm font-medium text-slate-800 outline-none transition"
                  placeholder="08X-XXX-XXXX"
                />
              </div>
            </div>
          )}

          {/* Email (Read Only) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              อีเมลบัญชี (เชื่อมโยงในระบบ)
            </label>
            <div className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500 select-none flex items-center justify-between">
              <span>{user?.email}</span>
              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-sans">
                Verified
              </span>
            </div>
          </div>

          {/* Change Password Toggle */}
          <div className="pt-2 border-t border-slate-100">
            {!isChangingPassword ? (
              <button
                type="button"
                onClick={() => setIsChangingPassword(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 py-1 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>เปลี่ยนรหัสผ่านใหม่ (Change Password)</span>
              </button>
            ) : (
              <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ตั้งรหัสผ่านใหม่
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    ยกเลิกเปลี่ยนรหัส
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                    className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 text-xs text-slate-800 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                    className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm hover:shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>บันทึกข้อมูล</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
