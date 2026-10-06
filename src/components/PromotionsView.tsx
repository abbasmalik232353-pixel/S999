import React from 'react';
import { useApp } from '../context/AppContext';
import { Gift, Zap, ShieldCheck, Flame, Trophy, ArrowRight, ChevronLeft } from 'lucide-react';

export const PromotionsView: React.FC = () => {
  const { setCurrentGame, setActiveTab, setShowDepositModal } = useApp();

  const promos = [
    {
      id: '1',
      title: 'ڈیلی سلاٹ اور کریش ٹریژر چیسٹ',
      subtitle: 'DAILY SLOTS TREASURE CHEST',
      desc: 'روزانہ کھیلنے پر 100,000 روپے تک کا جیک پاٹ جیتنے کا موقع۔',
      badge: '99.99x ملٹی پلائر',
      color: 'from-amber-600 via-yellow-600 to-orange-700',
      action: () => { setCurrentGame('aviator'); },
    },
    {
      id: '2',
      title: 'رولٹ 9X نمبرنگ بونس',
      subtitle: 'ROULETTE SPECIAL 9X PAYOUT',
      desc: 'بورڈ پر کسی بھی نمبر پر شرط لگائیں اور فوری 9 گنا انعام پائیں!',
      badge: '9.00x PAYOUT',
      color: 'from-emerald-700 via-teal-700 to-cyan-800',
      action: () => { setCurrentGame('roulette'); },
    },
    {
      id: '3',
      title: 'فوری 24/7 ڈپازٹ و ودڈرا',
      subtitle: 'INSTANT JAZZCASH & EASYPAISA',
      desc: 'کم از کم 500 روپے ڈپازٹ اور ودڈرا بغیر کسی فیس کے 15 منٹ میں۔',
      badge: '0% فیس',
      color: 'from-purple-700 via-indigo-700 to-blue-800',
      action: () => { setShowDepositModal(true); },
    },
  ];

  return (
    <div className="max-w-md mx-auto p-3 pb-24 space-y-3">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('games')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-gray-200 hover:text-white text-xs font-bold active:scale-95 transition-all shadow-sm"
          title="واپس گیمز"
        >
          <ChevronLeft className="w-5 h-5 text-cyan-400 stroke-[2.5]" />
          <span>← واپس گیمز (Back)</span>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
          <Gift className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-white">پروموشنز اور آفرز</h2>
          <p className="text-[10px] text-gray-400">S999 کی تازہ ترین خصوصی آفرز</p>
        </div>
      </div>

      <div className="space-y-3">
        {promos.map((p) => (
          <div
            key={p.id}
            onClick={p.action}
            className={`p-4 rounded-3xl bg-gradient-to-r ${p.color} border border-white/20 shadow-xl cursor-pointer hover:scale-[1.01] transition-transform`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black/40 text-amber-300">
                {p.badge}
              </span>
              <span className="text-[10px] text-white/80 font-mono">S999 OFFICIAL</span>
            </div>

            <h3 className="text-lg font-black text-white mt-2 leading-tight">
              {p.title}
            </h3>
            <p className="text-xs font-bold text-amber-200/90 font-mono">
              {p.subtitle}
            </p>
            <p className="text-xs text-white/90 mt-1">
              {p.desc}
            </p>

            <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-xs font-black text-white">
              <span>ابھی شامل ہوں</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
