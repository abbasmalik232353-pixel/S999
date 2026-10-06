import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Headphones,
  MessageSquare,
  Copy,
  Check,
  RefreshCw,
  Wallet,
  CreditCard,
  Crown,
  FileText,
  ChevronRight,
  User as UserIcon,
  ShieldCheck,
  Search,
  Edit2,
  CheckCircle2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AccountView: React.FC = () => {
  const {
    currentUser,
    logout,
    setShowAuthModal,
    setShowDepositModal,
    setShowWithdrawModal,
    setShowAdminPanel,
    setActiveTab,
    claimCommission,
    language,
  } = useApp();

  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [copiedName, setCopiedName] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.phone === '03217084743';

  const handleCopy = (text: string, type: 'id' | 'name') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedName(true);
      setTimeout(() => setCopiedName(false), 2000);
    }
  };

  const handleRefreshBalance = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleClaimCommission = () => {
    const res = claimCommission();
    if (res.success) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch { /* ignore */ }
      setClaimFeedback(res.message);
      setTimeout(() => setClaimFeedback(null), 3000);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#141b3a] border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 text-2xl">
          👤
        </div>
        <h2 className="text-base font-black text-white">آپ لاگ ان نہیں ہیں</h2>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          اپنے اکاؤنٹ، بیلنس اور پرافٹ دیکھنے کے لیے لاگ ان کریں۔
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          لاگ ان یا رجسٹر کریں
        </button>
      </div>
    );
  }

  const userId = currentUser.userId || '146902833';
  const username = currentUser.name || 'bobx4743';
  const unclaimedCommission = currentUser.unclaimedCommission ?? 350.00;
  const subordinatesCount = currentUser.subordinatesCount ?? '0(0)';
  const yesterdayPerformance = currentUser.yesterdayPerformance ?? 0.00;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#111216] text-white flex flex-col pb-28 text-left">
      {/* Top Header matching 99y888 / screenshot */}
      <div className="flex items-center justify-between px-3 py-3 bg-[#111216] sticky top-0 z-30">
        <button
          onClick={() => setActiveTab('games')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-gray-200 hover:text-white text-xs font-bold active:scale-95 transition-all shadow-sm"
          title="واپس گیمز"
        >
          <ChevronLeft className="w-5 h-5 text-cyan-400 stroke-[2.5]" />
          <span>← واپس گیمز (Back)</span>
        </button>

        <div className="flex items-center gap-4 text-gray-300">
          <button
            onClick={() => setActiveTab('support')}
            className="p-1 hover:text-white"
            title="Support"
          >
            <Headphones className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className="p-1 hover:text-white"
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* User Identity Row */}
        <div className="flex items-center gap-3 pt-1">
          {/* Avatar with edit badge */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600 shadow-md">
              <img
                src={currentUser.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-md">
              <Edit2 className="w-2.5 h-2.5" />
            </div>
          </div>

          {/* User details */}
          <div className="flex-1">
            {/* Username with dropdown arrow and copy icon */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400">▼</span>
              <span className="font-extrabold text-sm text-gray-100">{username}</span>
              <button
                onClick={() => handleCopy(username, 'name')}
                className="text-gray-400 hover:text-white"
                title="Copy name"
              >
                {copiedName ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {isSuperAdmin && (
                <span className="ml-1 text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded">
                  ADMIN
                </span>
              )}
            </div>

            {/* ID with copy icon */}
            <div className="flex items-center gap-1.5 text-xs text-gray-300 mt-0.5 font-mono">
              <span className="font-semibold text-gray-200">ID: {userId}</span>
              <button
                onClick={() => handleCopy(userId, 'id')}
                className="text-gray-400 hover:text-white"
                title="Copy ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Balance Row with Pakistan Flag & Action Buttons */}
        <div className="flex items-center justify-between py-2 pt-3">
          {/* Left: Pakistan flag & Balance */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-base shrink-0 shadow-sm border border-emerald-600 bg-emerald-800">
              🇵🇰
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-sm font-black text-white">
                Rs {currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button
                onClick={handleRefreshBalance}
                className="text-gray-400 hover:text-white transition-transform"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right: Deposit & Withdraw buttons with +10% badge */}
          <div className="flex items-center gap-5">
            {/* Deposit button with +10% tag */}
            <div className="relative flex flex-col items-center">
              <span className="absolute -top-3.5 -right-2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-sm whitespace-nowrap">
                +10%
              </span>
              <button
                onClick={() => setShowDepositModal(true)}
                className="flex flex-col items-center gap-1 text-gray-300 hover:text-white active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-[#2a2318] border border-amber-600/50 flex items-center justify-center text-amber-500 shadow-sm">
                  <Wallet className="w-5 h-5 fill-amber-500/20" />
                </div>
                <span className="text-[11px] font-semibold text-gray-300">Deposit</span>
              </button>
            </div>

            {/* Withdraw button */}
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex flex-col items-center gap-1 text-gray-300 hover:text-white active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-[#2d1b2d] border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-sm">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-gray-300">Withdraw</span>
            </button>
          </div>
        </div>

        {/* Big Card: Manage withdrawal */}
        <div
          onClick={() => setShowWithdrawModal(true)}
          className="bg-[#1b1c22] hover:bg-[#22242c] cursor-pointer rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 border border-slate-800 transition-colors shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-200">
            Manage withdrawal
          </span>
        </div>

        {/* VIP and My Records Cards */}
        <div className="space-y-2">
          {/* VIP Card */}
          <div
            onClick={() => setActiveTab('promotions')}
            className="bg-[#1b1c22] hover:bg-[#22242c] cursor-pointer rounded-2xl p-3.5 flex items-center justify-between border border-slate-800 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-black font-black text-xs shadow-md">
                <Crown className="w-4 h-4 fill-black" />
              </div>
              <span className="font-extrabold text-xs text-white">VIP</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                1
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* My Records Card */}
          <div
            onClick={() => setShowDepositModal(true)}
            className="bg-[#1b1c22] hover:bg-[#22242c] cursor-pointer rounded-2xl p-3.5 flex items-center justify-between border border-slate-800 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xs text-white">My Records</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-purple-400 max-w-[170px] truncate text-right">
                Details, records, reports, recover balance
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Invite & Agency Profit Section (Exactly like screenshot!) */}
        <div className="bg-[#1b1c22] rounded-2xl p-3.5 border border-slate-800 shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
            <span className="font-extrabold text-xs text-gray-200">Invite (پرافٹ اور کمیشن)</span>
            <button
              onClick={() => setActiveTab('invite')}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center"
            >
              <span>More</span>
              <ChevronRight className="w-3.5 h-3.5 inline" />
            </button>
          </div>

          {/* Claim feedback banner if claimed */}
          {claimFeedback && (
            <div className="mb-2 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{claimFeedback}</span>
            </div>
          )}

          {/* 3 Stats Columns & Claim Button */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Direct Subordinates */}
            <div className="flex flex-col">
              <span className="font-mono font-bold text-sm text-white">
                {subordinatesCount}
              </span>
              <span className="text-[9px] text-gray-400 leading-tight mt-0.5 max-w-[70px]">
                Direct subordinates...
              </span>
            </div>

            {/* Direct Performance Yesterday */}
            <div className="flex flex-col">
              <span className="font-mono font-bold text-sm text-white">
                {yesterdayPerformance.toFixed(2)}
              </span>
              <span className="text-[9px] text-gray-400 leading-tight mt-0.5 max-w-[80px]">
                Direct performance yesterday
              </span>
            </div>

            {/* Commission Not Claimed (Profit in Gold) */}
            <div className="flex flex-col">
              <span className="font-mono font-extrabold text-sm text-amber-400">
                {unclaimedCommission.toFixed(2)}
              </span>
              <span className="text-[9px] text-gray-400 leading-tight mt-0.5 max-w-[80px]">
                Commission not claimed
              </span>
            </div>

            {/* Claim Button */}
            <button
              onClick={handleClaimCommission}
              disabled={unclaimedCommission <= 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                unclaimedCommission > 0
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-amber-500/20 active:scale-95'
                  : 'bg-slate-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              Claim
            </button>
          </div>
        </div>

        {/* Super Admin Control Shortcut (Strictly for 03217084743) */}
        {isSuperAdmin && (
          <div
            onClick={() => setShowAdminPanel(true)}
            className="bg-gradient-to-r from-red-950 via-[#26152a] to-slate-900 border-2 border-red-500/60 rounded-2xl p-3 cursor-pointer shadow-lg hover:border-red-400 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">سپر ایڈمن مینجمنٹ</h4>
                <p className="text-[9px] text-amber-300">ڈپازٹ/ودڈرا منظوری، رگنگ اور فیک ممبرز</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </div>
        )}

        {/* Menu Items List: Profile, Security Center, Find us */}
        <div className="bg-[#1b1c22] rounded-2xl divide-y divide-slate-800/80 border border-slate-800 shadow-sm text-xs">
          {/* Profile */}
          <div
            onClick={() => setShowAuthModal(true)}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#22242c] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-gray-200">Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>

          {/* Security Center */}
          <div
            onClick={() => setShowAuthModal(true)}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#22242c] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-gray-200">Security Center</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>

          {/* Find us */}
          <div
            onClick={() => setActiveTab('support')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#22242c] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-gray-200">Find us</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500">
                Prevent it from opening
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-2 text-center">
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-red-400 font-bold transition-colors py-1"
          >
            اکاؤنٹ سے لاگ آؤٹ کریں (Logout)
          </button>
        </div>
      </div>
    </div>
  );
};
