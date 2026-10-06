import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Phone, User, CheckCircle2, AlertCircle, ShieldAlert, KeyRound } from 'lucide-react';
import { sounds } from '../utils/audio';

export const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { login, register, language } = useApp();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!phone.trim()) {
      setError('براہ کرم فون نمبر درج کریں');
      return;
    }
    if (!password.trim()) {
      setError('براہ کرم پاس ورڈ درج کریں');
      return;
    }

    if (isRegister) {
      const res = register(phone, password, name);
      if (res.success) {
        sounds.playWin();
        setSuccess(res.message);
        setTimeout(onClose, 1000);
      } else {
        sounds.playCrash();
        setError(res.message);
      }
    } else {
      const res = login(phone, password);
      if (res.success) {
        sounds.playWin();
        setSuccess(res.message);
        setTimeout(onClose, 1000);
      } else {
        sounds.playCrash();
        setError(res.message);
      }
    }
  };

  // Helper quick fill for super admin specified in prompt
  const handleFillAdmin = () => {
    setIsRegister(false);
    setPhone('03217084743');
    setPassword('malik1122');
    setError(null);
  };

  // Helper quick fill for normal player
  const handleFillUser = () => {
    setIsRegister(false);
    setPhone('03001234567');
    setPassword('user123');
    setError(null);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f1430] border border-cyan-500/40 rounded-3xl w-full max-w-sm p-5 shadow-2xl relative overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-bold shadow-md active:scale-95 transition-all"
          title="بند کریں"
        >
          <X className="w-4 h-4 text-red-400 stroke-[2.5]" />
          <span>بند کریں</span>
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 via-cyan-500 to-blue-600 flex items-center justify-center text-black font-black text-xl mx-auto shadow-lg shadow-cyan-500/30 mb-2">
            S9
          </div>
          <h2 className="text-lg font-black text-white">
            {isRegister ? 'نیا اکاؤنٹ بنائیں' : 'لاگ ان کریں'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            S999 آفیشل گیمنگ ایپ میں خوش آمدید
          </p>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                آپ کا نام
              </label>
              <div className="flex items-center bg-[#172044] border border-slate-700 rounded-xl px-3 py-2 text-xs">
                <User className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="محمد علی"
                  className="w-full bg-transparent text-white outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">
              موبائل فون نمبر (03...)
            </label>
            <div className="flex items-center bg-[#172044] border border-slate-700 rounded-xl px-3 py-2 text-xs">
              <Phone className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03217084743"
                className="w-full bg-transparent text-white font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">
              پاس ورڈ
            </label>
            <div className="flex items-center bg-[#172044] border border-slate-700 rounded-xl px-3 py-2 text-xs">
              <Lock className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="پاس ورڈ درج کریں"
                className="w-full bg-transparent text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all mt-2"
          >
            {isRegister ? 'اکاؤنٹ بنائیں' : 'لاگ ان کریں'}
          </button>
        </form>

        {/* Quick Credentials Helpers */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <span className="text-[10px] text-gray-400 block mb-1.5 font-bold">
            فوری ٹیسٹ لاگ ان بٹن:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleFillAdmin}
              className="py-1.5 px-2 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-red-900/60 transition-colors"
            >
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span>ایڈمن لاگ ان (مالک)</span>
            </button>

            <button
              type="button"
              onClick={handleFillUser}
              className="py-1.5 px-2 rounded-lg bg-slate-800 border border-slate-700 text-gray-300 text-[10px] font-bold hover:bg-slate-700 transition-colors"
            >
              عام پلیئر لاگ ان
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="mt-3 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-cyan-400 hover:underline font-bold"
          >
            {isRegister
              ? 'پہلے سے اکاؤنٹ ہے؟ لاگ ان کریں'
              : 'نیا اکاؤنٹ بنانا چاہتے ہیں؟ رجسٹر کریں'}
          </button>
        </div>
      </div>
    </div>
  );
};
