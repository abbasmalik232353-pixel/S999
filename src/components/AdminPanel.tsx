import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Check, X, Users, Sliders, DollarSign, AlertTriangle, RefreshCw, Zap, Lock, LogOut } from 'lucide-react';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    currentUser,
    users,
    transactions,
    approveTransaction,
    rejectTransaction,
    adminControls,
    updateAdminControls,
    adminAdjustBalance,
    logout,
  } = useApp();

  // SECURE AUTHENTICATION CHECK: Only phone 03217084743 has access
  const isAuthorizedAdmin = currentUser?.phone === '03217084743';

  const [activeTab, setActiveTab] = useState<'requests' | 'games' | 'bots' | 'users'>('requests');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'deposit' | 'withdraw'>('pending');
  const [rejectNote, setRejectNote] = useState<{ [id: string]: string }>({});

  // Form states for game controls
  const [aviatorTarget, setAviatorTarget] = useState<string>('5.00');
  const [rouletteTarget, setRouletteTarget] = useState<string>('7');
  const [wingoTarget, setWingoTarget] = useState<string>('7');
  const [dragonWinner, setDragonWinner] = useState<'dragon' | 'tiger' | 'tie'>('dragon');

  // User balance adjustment
  const [selectedUserPhone, setSelectedUserPhone] = useState<string>('');
  const [newBalanceInput, setNewBalanceInput] = useState<string>('');

  if (!isAuthorizedAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="bg-[#121633] border border-red-500/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center mx-auto mb-3 text-red-400">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-white">رسائی ممنوع ہے (Access Denied)</h2>
          <p className="text-xs text-gray-300 mt-2">
            ایڈمن پینل صرف مجاز اکاؤنٹ <strong>03217084743</strong> کے لیے مخصوص ہے۔
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700"
          >
            بند کریں
          </button>
        </div>
      </div>
    );
  }

  // Filter transactions
  const filteredTxs = transactions.filter((tx) => {
    if (filterType === 'pending') return tx.status === 'pending';
    if (filterType === 'deposit') return tx.type === 'deposit';
    if (filterType === 'withdraw') return tx.type === 'withdraw';
    return true;
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b0f24] border-2 border-red-500/40 rounded-3xl w-full max-w-lg max-h-[94vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Admin Header */}
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-red-950/90 via-[#181133] to-slate-900 border-b border-red-500/30">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-600/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-sm text-white">S999 سپر ایڈمن پینل</h2>
                <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-md">
                  مالک صاحب
                </span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono">
                موبائل: 03217084743
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-bold shadow-md active:scale-95"
            title="بند کریں"
          >
            <X className="w-4 h-4 text-red-400 stroke-[2.5]" />
            <span>بند کریں</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-[#080c1d] border-b border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>درخواستیں</span>
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
              activeTab === 'games'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>گیم کنٹرول</span>
          </button>

          <button
            onClick={() => setActiveTab('bots')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
              activeTab === 'bots'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>جعلی ممبرز</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>صارفین</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 overflow-y-auto flex-1 space-y-3">
          {/* TAB 1: TRANSACTIONS & APPROVALS */}
          {activeTab === 'requests' && (
            <div>
              {/* Filter Row */}
              <div className="flex items-center justify-between gap-1 mb-3">
                {(['pending', 'deposit', 'withdraw', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      filterType === f
                        ? 'bg-amber-500 text-black shadow'
                        : 'bg-slate-800 text-gray-300'
                    }`}
                  >
                    {f === 'pending' ? 'زیر التواء' : f === 'deposit' ? 'ڈپازٹ' : f === 'withdraw' ? 'ودڈرا' : 'تمام'}
                  </button>
                ))}
              </div>

              {filteredTxs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  کوئی درخواست موجود نہیں ہے۔
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-2xl bg-[#12183b] border border-cyan-500/20 text-xs shadow-md"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black uppercase px-2 py-0.5 rounded-full text-[10px] ${
                              tx.type === 'deposit'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {tx.type === 'deposit' ? 'ڈپازٹ درخواست' : 'ودڈرا درخواست'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {tx.method.toUpperCase()}
                          </span>
                        </div>

                        <span className="font-mono font-black text-sm text-cyan-300">
                          Rs {tx.amount.toLocaleString()}
                        </span>
                      </div>

                      {/* Transaction Details */}
                      <div className="py-2 space-y-1 text-[11px] text-gray-300">
                        <div className="flex justify-between">
                          <span className="text-gray-400">صارف کا فون:</span>
                          <span className="font-mono text-white">{tx.userPhone} ({tx.userName})</span>
                        </div>
                        {tx.type === 'deposit' && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">ٹرانزیکشن TID:</span>
                            <span className="font-mono font-bold text-amber-400">{tx.transactionId || 'N/A'}</span>
                          </div>
                        )}
                        {tx.type === 'withdraw' && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">کھاتہ دار / نمبر:</span>
                            <span className="font-mono text-emerald-300">{tx.accountTitle} - {tx.accountNumber}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>وقت:</span>
                          <span>{new Date(tx.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Actions for Pending */}
                      {tx.status === 'pending' ? (
                        <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                          <button
                            onClick={() => approveTransaction(tx.id)}
                            className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-600/30 active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>منظور کریں (Approve)</span>
                          </button>

                          <button
                            onClick={() => rejectTransaction(tx.id, rejectNote[tx.id] || 'درخواست مسترد')}
                            className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-md shadow-red-600/30 active:scale-95"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>مسترد کریں (Reject)</span>
                          </button>
                        </div>
                      ) : (
                        <div className="pt-1.5 border-t border-slate-800 text-right">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              tx.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {tx.status === 'approved' ? 'منظور شدہ ✓' : 'مسترد شدہ ✗'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GAME CONTROLS & RIGGING */}
          {activeTab === 'games' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>یہاں سے آپ اگلا رزلٹ اپنی مرضی سے سیٹ کر سکتے ہیں!</span>
              </div>

              {/* Aviator Rigging */}
              <div className="p-3 rounded-2xl bg-[#12193b] border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-white text-xs">✈️ Aviator اگلا کریش ملٹی پلائر</span>
                  {adminControls.aviatorNextCrash && (
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-mono">
                      سیٹ ہے: {adminControls.aviatorNextCrash}x
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="100"
                    value={aviatorTarget}
                    onChange={(e) => setAviatorTarget(e.target.value)}
                    placeholder="مثال: 5.00"
                    className="w-24 bg-[#182147] border border-cyan-500/40 rounded-xl px-2 py-1.5 text-xs text-center font-mono font-bold text-amber-300 outline-none"
                  />
                  <button
                    onClick={() => updateAdminControls({ aviatorNextCrash: parseFloat(aviatorTarget) || 2.0 })}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs shadow hover:bg-cyan-400"
                  >
                    سیٹ کریں
                  </button>
                  <button
                    onClick={() => updateAdminControls({ aviatorNextCrash: null })}
                    className="px-2 py-1.5 rounded-xl bg-slate-800 text-gray-300 text-xs"
                  >
                    عام موڈ
                  </button>
                </div>
              </div>

              {/* Roulette Rigging */}
              <div className="p-3 rounded-2xl bg-[#12193b] border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-white text-xs">🎡 Roulette اگلا جیتنے والا نمبر (0-36)</span>
                  {adminControls.rouletteNextNumber !== null && (
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">
                      سیٹ ہے: {adminControls.rouletteNextNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="36"
                    value={rouletteTarget}
                    onChange={(e) => setRouletteTarget(e.target.value)}
                    placeholder="نمبر 0-36"
                    className="w-24 bg-[#182147] border border-cyan-500/40 rounded-xl px-2 py-1.5 text-xs text-center font-mono font-bold text-emerald-300 outline-none"
                  />
                  <button
                    onClick={() => updateAdminControls({ rouletteNextNumber: parseInt(rouletteTarget) || 0 })}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow hover:bg-emerald-400"
                  >
                    سیٹ کریں
                  </button>
                  <button
                    onClick={() => updateAdminControls({ rouletteNextNumber: null })}
                    className="px-2 py-1.5 rounded-xl bg-slate-800 text-gray-300 text-xs"
                  >
                    عام موڈ
                  </button>
                </div>
              </div>

              {/* Wingo Rigging */}
              <div className="p-3 rounded-2xl bg-[#12193b] border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-white text-xs">🎱 Wingo اگلا نمبر (0-9)</span>
                  {adminControls.wingoNextNumber !== null && (
                    <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-mono">
                      سیٹ ہے: {adminControls.wingoNextNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="9"
                    value={wingoTarget}
                    onChange={(e) => setWingoTarget(e.target.value)}
                    placeholder="0-9"
                    className="w-24 bg-[#182147] border border-cyan-500/40 rounded-xl px-2 py-1.5 text-xs text-center font-mono font-bold text-purple-300 outline-none"
                  />
                  <button
                    onClick={() => updateAdminControls({ wingoNextNumber: parseInt(wingoTarget) || 0 })}
                    className="px-3 py-1.5 rounded-xl bg-purple-500 text-white font-extrabold text-xs shadow hover:bg-purple-400"
                  >
                    سیٹ کریں
                  </button>
                  <button
                    onClick={() => updateAdminControls({ wingoNextNumber: null })}
                    className="px-2 py-1.5 rounded-xl bg-slate-800 text-gray-300 text-xs"
                  >
                    عام موڈ
                  </button>
                </div>
              </div>

              {/* Dragon Tiger Rigging */}
              <div className="p-3 rounded-2xl bg-[#12193b] border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-white text-xs">🐉 Dragon Tiger اگلا فاتح</span>
                  {adminControls.dragonTigerNextWinner && (
                    <span className="text-[10px] bg-amber-600 text-black font-black px-2 py-0.5 rounded-full uppercase">
                      سیٹ ہے: {adminControls.dragonTigerNextWinner}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => updateAdminControls({ dragonTigerNextWinner: 'dragon' })}
                    className="py-1.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs"
                  >
                    ڈریگن (Dragon)
                  </button>
                  <button
                    onClick={() => updateAdminControls({ dragonTigerNextWinner: 'tiger' })}
                    className="py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs"
                  >
                    ٹائیگر (Tiger)
                  </button>
                  <button
                    onClick={() => updateAdminControls({ dragonTigerNextWinner: 'tie' })}
                    className="py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    برابر (Tie)
                  </button>
                  <button
                    onClick={() => updateAdminControls({ dragonTigerNextWinner: null })}
                    className="py-1.5 rounded-xl bg-slate-800 text-gray-300 text-xs"
                  >
                    عام
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BOTS / FAKE MEMBERS SETTINGS */}
          {activeTab === 'bots' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#12193b] border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-white">جعلی ممبرز ایکٹیوٹی (Fake Members)</h3>
                    <p className="text-[10px] text-gray-400">تمام گیمز میں خودکار پلیئرز لائیو کھیلیں گے</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={adminControls.botsEnabled}
                    onChange={(e) => updateAdminControls({ botsEnabled: e.target.checked })}
                    className="w-5 h-5 text-emerald-500 rounded bg-slate-900 border-slate-700"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="text-xs text-gray-300 block mb-1">ایکٹیویٹی کی رفتار:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => updateAdminControls({ botIntensity: lvl })}
                        className={`py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                          adminControls.botIntensity === lvl
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow'
                            : 'bg-slate-800 text-gray-400'
                        }`}
                      >
                        {lvl === 'low' ? 'کم (Low)' : lvl === 'medium' ? 'درمیانہ (Med)' : 'زیادہ (High)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USERS & BALANCE EDITOR */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#12193b] border border-cyan-500/20 space-y-2">
                <span className="font-bold text-xs text-white block">صارف کا بیلنس تبدیل کریں:</span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedUserPhone}
                    onChange={(e) => setSelectedUserPhone(e.target.value)}
                    className="flex-1 bg-[#182147] border border-slate-700 rounded-xl px-2 py-2 text-xs text-white outline-none"
                  >
                    <option value="">صارف منتخب کریں...</option>
                    {users.map((u) => (
                      <option key={u.phone} value={u.phone}>
                        {u.name} ({u.phone}) - Rs {u.balance}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={newBalanceInput}
                    onChange={(e) => setNewBalanceInput(e.target.value)}
                    placeholder="نیا بیلنس"
                    className="w-24 bg-[#182147] border border-slate-700 rounded-xl px-2 py-2 text-xs text-amber-300 font-mono font-bold outline-none"
                  />

                  <button
                    onClick={() => {
                      if (selectedUserPhone && newBalanceInput) {
                        adminAdjustBalance(selectedUserPhone, parseFloat(newBalanceInput) || 0);
                        setNewBalanceInput('');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow active:scale-95"
                  >
                    محفوظ کریں
                  </button>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u.phone} className="p-2.5 rounded-xl bg-[#141b38] flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{u.name}</span>
                        {u.isAdmin && (
                          <span className="text-[9px] bg-red-600 text-white px-1.5 rounded font-black">ایڈمن</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{u.phone}</span>
                    </div>

                    <div className="font-mono font-black text-cyan-300">
                      Rs {u.balance.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
