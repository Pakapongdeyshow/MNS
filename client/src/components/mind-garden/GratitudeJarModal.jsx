import React, { useState, useEffect } from 'react';
import { Sparkles, X, Heart, Plus, Shuffle, Trash2, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { request } from '../../services/api';

export function GratitudeJarModal({ isOpen, onClose }) {
  const [notes, setNotes] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState('amber');
  const [randomNote, setRandomNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await request('/selfcare/gratitude');
      setNotes(res.notes || []);
    } catch (err) {
      console.error('Error loading gratitude notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
      setRandomNote(null);
      setIsAdding(false);
    }
  }, [isOpen]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await request('/selfcare/gratitude', {
        method: 'POST',
        body: JSON.stringify({ message: message.trim(), color: selectedColor })
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FDE047', '#34D399', '#60A5FA', '#F472B6']
      });

      setMessage('');
      setIsAdding(false);
      await fetchNotes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRandomDraw = () => {
    if (notes.length === 0) return;
    const drawn = notes[Math.floor(Math.random() * notes.length)];
    setRandomNote(drawn);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.5 },
      colors: ['#FBBF24', '#38BDF8', '#34D399']
    });
  };

  const handleDelete = async (id) => {
    try {
      await request(`/selfcare/gratitude/${id}`, { method: 'DELETE' });
      if (randomNote?.id === id) setRandomNote(null);
      await fetchNotes();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  const colorStyles = {
    amber: 'bg-amber-100 border-amber-300 text-amber-900',
    emerald: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    sky: 'bg-sky-100 border-sky-300 text-sky-900',
    rose: 'bg-rose-100 border-rose-300 text-rose-900',
    purple: 'bg-purple-100 border-purple-300 text-purple-900',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-100 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-100">
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span>Gratitude Jar • ขวดโหลสะสมสิ่งดีๆ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
            ความสุขเล็ก ๆ ประจำวัน 🍯
          </h2>
          <p className="text-xs text-amber-100 mt-0.5">
            เก็บสะสมช่วงเวลาดีๆ ไว้เติมพลังใจในวันที่ต้องการกำลังใจ
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Action Bar: Random Draw or Add New */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleRandomDraw}
              disabled={notes.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition disabled:opacity-50"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-600" />
              <span>สุ่มหยิบการ์ดพลังใจ 🌟</span>
            </button>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-2xl bg-nature-600 hover:bg-nature-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มเรื่องราวดีๆ</span>
            </button>
          </div>

          {/* Random Drawn Card Highlight */}
          {randomNote && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 shadow-lg text-center space-y-2 animate-in zoom-in-95">
              <div className="text-xs font-bold text-amber-800 flex items-center justify-center gap-1">
                <span>✨ ความทรงจำดีๆ ที่คุณเคยบันทึกไว้:</span>
              </div>
              <p className="text-base font-bold text-slate-800 leading-relaxed italic">
                "{randomNote.message}"
              </p>
              <div className="text-[11px] text-slate-400">
                {new Date(randomNote.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          )}

          {/* Add Note Form Drawer */}
          {isAdding && (
            <form onSubmit={handleAddNote} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-slate-700">
                วันนี้มีเรื่องอะไรที่ทำให้คุณรู้สึกขอบคุณหรือยิ้มได้? 🌱
              </label>
              <textarea
                required
                rows={2}
                placeholder="เช่น ได้กินขนมอร่อยๆ, เพื่อนช่วยเหลือ, หรือทำการบ้านเสร็จ..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 resize-none bg-white"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {['amber', 'emerald', 'sky', 'rose', 'purple'].map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`w-6 h-6 rounded-full border-2 transition transform ${
                        selectedColor === col ? 'scale-110 border-slate-800' : 'border-white'
                      } ${
                        col === 'amber' ? 'bg-amber-300' :
                        col === 'emerald' ? 'bg-emerald-300' :
                        col === 'sky' ? 'bg-sky-300' :
                        col === 'rose' ? 'bg-rose-300' : 'bg-purple-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  หย่อนลงขวดโหล 🍯
                </button>
              </div>
            </form>
          )}

          {/* List of All Saved Gratitude Slips */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>การ์ดทั้งหมดในโหล ({notes.length})</span>
            </div>

            {notes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl border flex items-start justify-between gap-2 shadow-xs transition hover:scale-[1.01] ${
                      colorStyles[n.color] || colorStyles.amber
                    }`}
                  >
                    <p className="text-xs font-medium leading-relaxed">{n.message}</p>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="opacity-40 hover:opacity-100 hover:text-red-600 text-slate-600 shrink-0 p-0.5"
                      title="ลบการ์ด"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                ขวดโหลยังว่างอยู่ เริ่มบันทึกเรื่องดีๆ เรื่องแรกเลย! ✨
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
