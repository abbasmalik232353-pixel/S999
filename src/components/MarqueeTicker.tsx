import React, { useState } from 'react';
import { Volume2, Flame, Award, ChevronRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MarqueeTicker: React.FC = () => {
  const { liveWinners, language } = useApp();
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  const latestWinner = liveWinners[0] || {
    userName: '0301***928',
    game: 'Aviator',
    amount: 4850,
  };

  return (
    <>
      <div className="px-3 my-2">
        <div className="flex items-center justify-between bg-[#11172e] border border-cyan-500/20 rounded-xl px-2.5 py-1.5 shadow-md">
          {/* Sound & Icon */}
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Volume2 className="w-3.5 h-3.5" />
          </div>

          {/* Marquee Text */}
          <div className="flex-1 overflow-hidden mx-2 whitespace-nowrap text-[11px] text-gray-200">
            <div className="inline-block animate-marquee flex items-center gap-4">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Flame className="w-3 h-3 text-orange-400 fill-orange-400 animate-bounce" />
                {latestWinner.userName} نے {latestWinner.game} میں Rs {latestWinner.amount.toLocaleString()} جیتے!
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-cyan-300">
                ⚡ S999 آفیشل: کم از کم ڈپازٹ اور ودڈرا 500 روپے - کم از کم بیوٹ 1 روپیہ سے 100,000 روپے
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-amber-300">
                💎 رولٹ میں نمبر پر 9X پے آؤٹ اور ریڈ/بلیک پر 2X!
              </span>
            </div>
          </div>

          {/* تفصیل / Detail Button (Like in screenshot) */}
          <button
            onClick={() => setShowNoticeModal(true)}
            className="flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 text-black text-[10px] font-black shadow-md shadow-emerald-500/20 shrink-0 transition-transform active:scale-95"
          >
            <Flame className="w-3 h-3 text-red-600 fill-red-600" />
            <span>{language === 'ur' ? 'تفصیل' : 'Details'}</span>
          </button>
        </div>
      </div>

      {/* Notice Details Modal */}
      {showNoticeModal && (
        <div
          onClick={() => setShowNoticeModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#101633] border border-cyan-500/30 rounded-2xl p-5 max-w-sm w-full shadow-2xl relative"
          >
            <button
              onClick={() => setShowNoticeModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-xl bg-slate-800 text-gray-400 hover:text-white"
              title="بند کریں"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">S999 آفیشل قوانین و تفصیلات</h3>
            </div>

            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/20">
                <p className="font-bold text-amber-400 mb-1">💰 ڈپازٹ اور ودڈرا:</p>
                <p>• کم از کم ڈپازٹ: <strong>500 PKR</strong></p>
                <p>• کم از کم ودڈرا: <strong>500 PKR</strong></p>
                <p>• ادائیگی کے ذرائع: EasyPaisa, JazzCash, Bank Transfer</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/20">
                <p className="font-bold text-cyan-400 mb-1">🎯 گیم کے انعامات و خصوصیات:</p>
                <p>• <strong>Aviator</strong>: سلو سپیڈ اور آٹو کیش آؤٹ فیچر کے ساتھ۔</p>
                <p>• <strong>Roulette</strong>: نمبر پر بیٹنگ کا <strong>9X</strong> اور ریڈ/بلیک پر <strong>2X</strong>۔</p>
                <p>• <strong>Wingo</strong>: کلرز پر 2X/4.5X اور سنگل نمبر پر 9X۔</p>
                <p>• <strong>Dragon Tiger</strong>: ڈریگن اور ٹائیگر پر 2X، ٹائی پر 8X۔</p>
                <p>• شرط کی حد: <strong>1 روپیہ سے 100,000 روپے</strong> تک۔</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/20">
                <p className="font-bold text-emerald-400 mb-1">🛡️ ایڈمن سپورٹ:</p>
                <p>ادائیگی 15 سے 30 منٹ کے اندر ایڈمن کی تصدیق کے بعد اکاؤنٹ میں جمع کر دی جاتی ہے۔</p>
              </div>
            </div>

            <button
              onClick={() => setShowNoticeModal(false)}
              className="mt-4 w-full py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold rounded-xl shadow-lg active:scale-95"
            >
              ٹھیک ہے، سمجھ آ گئی
            </button>
          </div>
        </div>
      )}
    </>
  );
};
