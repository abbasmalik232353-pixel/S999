import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { Gift, MessageCircle, X, CheckCircle2, Sparkles, Smartphone, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FloatingWidgets: React.FC = () => {
  const { updateBalance } = useApp();
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [giftClaimed, setGiftClaimed] = useState<boolean>(false);
  const [showHomeScreenToast, setShowHomeScreenToast] = useState<boolean>(false);
  const [homeScreenPillVisible, setHomeScreenPillVisible] = useState<boolean>(true);

  const handleClaimGift = () => {
    if (giftClaimed) return;
    const bonus = 100;
    updateBalance(bonus);
    sounds.playWin();
    setGiftClaimed(true);
    try { confetti({ particleCount: 50, spread: 60 }); } catch { /* ignore */ }
  };

  return (
    <>
      {/* Floating Action Circles on Right (Exact layout as screenshot) */}
      <div className="fixed right-3 bottom-24 z-30 flex flex-col items-center gap-2.5">
        {/* Gift Treasure Box (Animated bounce) */}
        <button
          onClick={() => setShowGiftModal(true)}
          className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-0.5 shadow-lg shadow-pink-500/30 active:scale-95 transition-transform animate-bounce"
          title="Daily Gift Box"
        >
          <div className="w-full h-full bg-[#120a21] rounded-full flex items-center justify-center text-xl">
            🎁
          </div>
          <span className="absolute -top-1 -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
          </span>
        </button>

        {/* Lucky Wheel Floating */}
        <button
          onClick={() => setShowGiftModal(true)}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform"
          title="Lucky Wheel"
        >
          <div className="w-full h-full bg-[#0a1520] rounded-full flex items-center justify-center text-xl animate-spin-slow">
            🎡
          </div>
        </button>

        {/* Live Support WhatsApp Chat Floating Icon */}
        <button
          onClick={() => setShowChatModal(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-green-600 p-0.5 shadow-lg shadow-green-500/40 active:scale-95 transition-transform"
          title="Customer Care"
        >
          <div className="w-full h-full bg-[#051c0d] rounded-full flex items-center justify-center text-emerald-300">
            <MessageCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
        </button>
      </div>

      {/* "ہوم اسکرین میں شامل کریں" Bottom Floating Pill (Matched directly from screenshot!) */}
      {homeScreenPillVisible && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-sm">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 p-0.5 rounded-full shadow-2xl shadow-emerald-500/30">
            <div className="bg-[#0b1b19] px-3 py-1.5 rounded-full flex items-center justify-between">
              <div
                onClick={() => setShowHomeScreenToast(true)}
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center text-[10px] font-black text-black">
                  S9
                </div>
                <span className="text-xs font-black text-emerald-300">
                  ہوم اسکرین میں شامل کریں (Install App)
                </span>
              </div>

              <button
                onClick={() => setHomeScreenPillVisible(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Chest Modal */}
      {showGiftModal && (
        <div
          onClick={() => setShowGiftModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121633] border border-amber-500/40 rounded-3xl p-5 max-w-xs w-full text-center shadow-2xl relative"
          >
            <button
              onClick={() => setShowGiftModal(false)}
              className="absolute top-3 right-3 p-1 rounded-xl bg-slate-800 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>

            <div className="text-4xl my-2">🎁</div>
            <h3 className="font-black text-base text-white">روزانہ ٹریژر چیسٹ ریوارڈ</h3>
            <p className="text-xs text-gray-300 mt-1">
              {giftClaimed ? 'آپ آج کا بونس وصول کر چکے ہیں!' : 'اپنا مفت 100 روپے کا ڈیلی ریوارڈ کلیم کریں!'}
            </p>

            <button
              onClick={handleClaimGift}
              disabled={giftClaimed}
              className={`mt-4 w-full py-2.5 rounded-2xl font-black text-xs shadow-lg transition-all ${
                giftClaimed
                  ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-amber-500/30 active:scale-95'
              }`}
            >
              {giftClaimed ? 'کلیم ہو چکا ✓' : 'کلیم کریں (Rs 100)'}
            </button>

            <button
              onClick={() => setShowGiftModal(false)}
              className="mt-2 w-full py-1 text-[11px] text-gray-400 hover:text-white"
            >
              بند کریں (Close)
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp / Customer Care Modal */}
      {showChatModal && (
        <div
          onClick={() => setShowChatModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f1c1a] border border-emerald-500/40 rounded-3xl p-5 max-w-xs w-full shadow-2xl relative"
          >
            <button
              onClick={() => setShowChatModal(false)}
              className="absolute top-3 right-3 p-1 rounded-xl bg-slate-800 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl mx-auto mb-2">
              💬
            </div>

            <h3 className="font-black text-base text-white text-center">S999 کسٹمر سپورٹ 24/7</h3>
            <p className="text-xs text-gray-300 text-center mt-1">
              ڈپازٹ، ودڈرا یا گیم سے متعلق کسی بھی مدد کے لیے ہمارے ہیلپ ڈیسک پر رابطہ کریں۔
            </p>

            <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-center space-y-1">
              <span className="text-gray-400 block text-[10px]">آفیشل واٹس ایپ ہیلپ لائن:</span>
              <span className="font-mono font-black text-emerald-300 text-sm">03217084743</span>
            </div>

            <button
              onClick={() => setShowChatModal(false)}
              className="mt-4 w-full py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20"
            >
              بند کریں (Close)
            </button>
          </div>
        </div>
      )}

      {/* Add To Home Screen Instructions Toast */}
      {showHomeScreenToast && (
        <div
          onClick={() => setShowHomeScreenToast(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#101633] border border-cyan-500/30 rounded-3xl p-5 max-w-xs w-full text-center shadow-2xl relative"
          >
            <button
              onClick={() => setShowHomeScreenToast(false)}
              className="absolute top-3 right-3 p-1 rounded-xl bg-slate-800 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>

            <Smartphone className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
            <h3 className="font-black text-base text-white">ہوم اسکرین میں شامل کریں</h3>
            <p className="text-xs text-gray-300 mt-2 text-right leading-relaxed">
              1. اپنے براؤزر کے مینو (3 نقطے یا شیئر آئیکن) پر کلک کریں۔<br />
              2. <strong>'Add to Home Screen'</strong> منتخب کریں۔<br />
              3. S999 ایک الگ ایپ کی طرح آپ کے موبائل میں شامل ہو جائے گی۔
            </p>

            <button
              onClick={() => setShowHomeScreenToast(false)}
              className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs"
            >
              بند کریں (Close)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
