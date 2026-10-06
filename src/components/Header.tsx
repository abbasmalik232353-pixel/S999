import React from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, VolumeX, ShieldCheck, Wallet, Plus, User as UserIcon, LogIn, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    soundEnabled,
    setSoundEnabled,
    language,
    setLanguage,
    setShowAdminPanel,
    setShowAuthModal,
    setShowDepositModal,
    setActiveTab,
    setCurrentGame,
  } = useApp();

  const isSuperAdmin = currentUser?.phone === '03217084743';

  return (
    <header className="sticky top-0 z-40 bg-[#0d1124]/95 backdrop-blur-md border-b border-cyan-500/20 px-3 py-2.5 shadow-lg shadow-black/40">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setCurrentGame(null);
            setActiveTab('games');
          }}
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 shadow-md shadow-cyan-500/30 p-0.5">
            <div className="w-full h-full bg-[#090d1f] rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-400 to-amber-300 text-sm tracking-tighter">
              S9
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-amber-300 font-mono">
                S999
              </span>
              <span className="text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black px-1 rounded-sm uppercase tracking-tight">
                VIP
              </span>
            </div>
            <span className="text-[9px] text-gray-400 -mt-1 font-sans">
              {language === 'ur' ? 'گیمنگ پلیٹ فارم' : 'Gaming Hub'}
            </span>
          </div>
        </div>

        {/* Right side: Admin Pill (Only for 03217084743), Sound, Wallet, and Profile */}
        <div className="flex items-center gap-2">
          {/* Super Admin Panel Access Button - STRICTLY only for 03217084743 */}
          {isSuperAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-lg text-xs font-bold shadow-md shadow-red-900/40 border border-amber-400/50 animate-pulse"
              title="Admin Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">ایڈمن</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-cyan-400 transition-colors"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'ur' ? 'en' : 'ur')}
            className="px-1.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] font-bold text-cyan-300 hover:text-white transition-colors flex items-center gap-1"
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>{language === 'ur' ? 'EN' : 'اردو'}</span>
          </button>

          {/* Balance & Deposit Button (like in screenshot top right) */}
          {currentUser ? (
            <div className="flex items-center bg-[#141b36] rounded-xl border border-cyan-500/30 p-1 shadow-inner">
              <div
                className="flex items-center gap-1.5 px-2 cursor-pointer"
                onClick={() => setActiveTab('wallet')}
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-gray-400 leading-none">
                    {language === 'ur' ? 'بقیہ' : 'Balance'}
                  </span>
                  <span className="text-xs font-black text-cyan-300 font-mono leading-tight">
                    Rs {currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowDepositModal(true)}
                className="w-6 h-6 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black flex items-center justify-center font-black transition-transform active:scale-95 shadow-md shadow-emerald-500/30"
                title="Deposit"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'لاگ ان' : 'Login'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
