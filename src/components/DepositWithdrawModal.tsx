import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { X, ArrowDownCircle, ArrowUpCircle, ShieldCheck, CheckCircle2, Clock, AlertCircle, Copy, Check } from 'lucide-react';

interface DepositWithdrawModalProps {
  initialTab?: 'deposit' | 'withdraw';
  onClose: () => void;
}

export const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({
  initialTab = 'deposit',
  onClose,
}) => {
  const {
    currentUser,
    requestDeposit,
    requestWithdraw,
    transactions,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(initialTab);
  const [method, setMethod] = useState<'easypaisa' | 'jazzcash' | 'bank'>('easypaisa');
  const [amount, setAmount] = useState<number>(1000);
  const [copied, setCopied] = useState<boolean>(false);

  // Deposit specific
  const [tid, setTid] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>(currentUser?.phone || '');

  // Withdraw specific
  const [accountTitle, setAccountTitle] = useState<string>(currentUser?.name || '');
  const [accountNumber, setAccountNumber] = useState<string>(currentUser?.phone || '');

  // Feedback message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const officialAccounts = {
    easypaisa: {
      bankName: 'EasyPaisa',
      accountNumber: '03217084743',
      accountTitle: 'S999 Official (Malik)',
    },
    jazzcash: {
      bankName: 'JazzCash',
      accountNumber: '03217084743',
      accountTitle: 'S999 Official (Malik)',
    },
    bank: {
      bankName: 'Meezan Bank Ltd',
      accountNumber: '01020304050607',
      accountTitle: 'S999 Gaming Hub',
    },
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = requestDeposit(amount, method, tid, senderPhone);
    if (res.success) {
      sounds.playWin();
      setFeedback({ type: 'success', message: res.message });
      setTid('');
      setTimeout(() => {
        setActiveTab('history');
      }, 1500);
    } else {
      sounds.playCrash();
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = requestWithdraw(amount, method, accountTitle, accountNumber);
    if (res.success) {
      sounds.playWin();
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setActiveTab('history');
      }, 1500);
    } else {
      sounds.playCrash();
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Filter transactions for current user
  const userTransactions = transactions.filter(
    (tx) => tx.userPhone === currentUser?.phone
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0e142e] border border-cyan-500/30 rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-cyan-500/20 bg-[#12193b]">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-gray-300 hover:text-white flex items-center gap-1 text-xs font-bold"
              title="واپس جائیں"
            >
              <span>← واپس</span>
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-black text-xs">
                S9
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white">پرس اور ادائیگیاں (Wallet)</h2>
                <span className="text-[10px] text-cyan-300 font-mono">
                  بیلنس: Rs {currentUser?.balance.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Prominent Cut / Close 'X' Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-bold shadow-md active:scale-95 transition-all"
            title="بند کریں"
          >
            <X className="w-4 h-4 text-red-400 stroke-[2.5]" />
            <span>بند کریں</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-[#090d20] border-b border-slate-800">
          <button
            onClick={() => { setActiveTab('deposit'); setFeedback(null); }}
            className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'deposit'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>ڈپازٹ (Deposit)</span>
          </button>

          <button
            onClick={() => { setActiveTab('withdraw'); setFeedback(null); }}
            className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'withdraw'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>ودڈرا (Withdraw)</span>
          </button>

          <button
            onClick={() => { setActiveTab('history'); setFeedback(null); }}
            className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>ہسٹری</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-4 mt-3 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/80 border border-red-500/50 text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* DEPOSIT TAB */}
          {activeTab === 'deposit' && (
            <form onSubmit={handleDepositSubmit} className="space-y-3.5">
              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">ادائیگی کا طریقہ منتخب کریں:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('easypaisa')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                      method === 'easypaisa'
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'bg-[#141b38] border-slate-700 text-gray-400'
                    }`}
                  >
                    <span className="text-base">🟢</span>
                    <span>EasyPaisa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('jazzcash')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                      method === 'jazzcash'
                        ? 'bg-red-950/60 border-red-400 text-red-300 ring-2 ring-red-500/30'
                        : 'bg-[#141b38] border-slate-700 text-gray-400'
                    }`}
                  >
                    <span className="text-base">🔴</span>
                    <span>JazzCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('bank')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                      method === 'bank'
                        ? 'bg-blue-950/60 border-blue-400 text-blue-300 ring-2 ring-blue-500/30'
                        : 'bg-[#141b38] border-slate-700 text-gray-400'
                    }`}
                  >
                    <span className="text-base">🏦</span>
                    <span>بینک ٹرانسفر</span>
                  </button>
                </div>
              </div>

              {/* Official Account Box */}
              <div className="p-3 rounded-2xl bg-[#141c3d] border border-cyan-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">اکاؤنٹ کا نام:</span>
                  <span className="font-bold text-white">{officialAccounts[method].accountTitle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">اکاؤنٹ نمبر:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-cyan-300 text-sm">{officialAccounts[method].accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(officialAccounts[method].accountNumber)}
                      className="p-1 rounded bg-slate-800 text-gray-300 hover:text-white"
                      title="Copy"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-amber-300/90 pt-1 border-t border-slate-700/60">
                  ⚠️ نوٹ: رقم بھیجنے کے بعد نیچے <strong>ٹرانزیکشن آئی ڈی (TID)</strong> درج کریں۔
                </p>
              </div>

              {/* Amount Quick Chips & Input */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-gray-300">ڈپازٹ رقم (کم از کم 500 روپے):</label>
                  <span className="text-amber-400 font-mono font-black">Rs {amount}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[500, 1000, 2500, 5000, 10000, 20000, 50000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                        amount === val
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow'
                          : 'bg-[#151c3c] text-gray-300 hover:bg-[#1d2754]'
                      }`}
                    >
                      Rs {val}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="500"
                    max="500000"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#141b38] border border-cyan-500/40 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm outline-none focus:border-cyan-400"
                    placeholder="رقم درج کریں (کم از کم 500)"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">PKR</span>
                </div>
              </div>

              {/* TID Input */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  ٹرانزیکشن آئی ڈی (TID / Trx ID) *
                </label>
                <input
                  type="text"
                  required
                  value={tid}
                  onChange={(e) => setTid(e.target.value)}
                  placeholder="مثال: 94820194820"
                  className="w-full bg-[#141b38] border border-cyan-500/40 rounded-xl px-3 py-2 text-white font-mono text-sm outline-none focus:border-cyan-400"
                />
              </div>

              {/* Sender Phone */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  بھیجنے والے کا فون نمبر
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full bg-[#141b38] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-black text-sm shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
              >
                ڈپازٹ کی تصدیق کی درخواست بھیجیں (Rs {amount})
              </button>
            </form>
          )}

          {/* WITHDRAW TAB */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
              {/* Method Selector */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">ودڈرا اکاؤنٹ منتخب کریں:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('easypaisa')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                      method === 'easypaisa'
                        ? 'bg-amber-950/60 border-amber-400 text-amber-300 ring-2 ring-amber-500/30'
                        : 'bg-[#141b38] border-slate-700 text-gray-400'
                    }`}
                  >
                    <span>🟢 EasyPaisa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('jazzcash')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                      method === 'jazzcash'
                        ? 'bg-amber-950/60 border-amber-400 text-amber-300 ring-2 ring-amber-500/30'
                        : 'bg-[#141b38] border-slate-700 text-gray-400'
                    }`}
                  >
                    <span>🔴 JazzCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('bank')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                      method === 'bank'
                        ? 'bg-amber-950/60 border-amber-400 text-amber-300 ring-2 ring-amber-500/30'
                        : 'bg-[#141b38] border-slate-700 text-gray-400'
                    }`}
                  >
                    <span>🏦 بینک</span>
                  </button>
                </div>
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  اکاؤنٹ ہولڈر کا پورا نام *
                </label>
                <input
                  type="text"
                  required
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  placeholder="محمد سلمان"
                  className="w-full bg-[#141b38] border border-cyan-500/40 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-cyan-400"
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  اکاؤنٹ / موبائل نمبر *
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="03001234567"
                  className="w-full bg-[#141b38] border border-cyan-500/40 rounded-xl px-3 py-2 text-white font-mono text-sm outline-none focus:border-cyan-400"
                />
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-gray-300">ودڈرا رقم (کم از کم 500 روپے):</label>
                  <span className="text-emerald-400 font-mono font-black">
                    دستیاب: Rs {currentUser?.balance.toFixed(2) || '0.00'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[500, 1000, 2000, 5000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                        amount === val
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow'
                          : 'bg-[#151c3c] text-gray-300 hover:bg-[#1d2754]'
                      }`}
                    >
                      Rs {val}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="500"
                    max={currentUser?.balance || 100000}
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#141b38] border border-cyan-500/40 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm outline-none focus:border-cyan-400"
                    placeholder="رقم درج کریں (کم از کم 500)"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">PKR</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-gray-400">
                ⚡ ودڈرا کی درخواست ایڈمن پینل کے پاس جمع ہو جائے گی اور تصدیق کے بعد رقم فوری آپ کے اکاؤنٹ میں منتقل کر دی جائے گی۔
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-black font-black text-sm shadow-lg shadow-amber-500/30 active:scale-95 transition-transform"
              >
                ودڈرا کی درخواست جمع کریں (Rs {amount})
              </button>
            </form>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-300 block mb-2">
                آپ کی ٹرانزیکشن ہسٹری
              </span>

              {userTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  کوئی ٹرانزیکشن موجود نہیں
                </div>
              ) : (
                userTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-[#141b3a] border border-cyan-500/20 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                        tx.type === 'deposit' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {tx.type === 'deposit' ? '↓' : '↑'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-white">
                            {tx.type === 'deposit' ? 'ڈپازٹ' : 'ودڈرا'}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-mono">({tx.method})</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm block text-white">
                        Rs {tx.amount.toLocaleString()}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                          tx.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : tx.status === 'rejected'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {tx.status === 'approved' ? 'منظور شدہ' : tx.status === 'rejected' ? 'مسترد' : 'زیر التواء'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bottom Back Button */}
        <div className="p-3 bg-[#090d20] border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span>← واپس گیمز پر جائیں (Back to Games)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
