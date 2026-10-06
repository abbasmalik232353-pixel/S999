import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import { ChevronLeft, RotateCw, Users, Trash2, Trophy, Clock, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

// European Roulette Numbers order on standard wheel
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export const RouletteGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const {
    currentUser,
    updateBalance,
    adminControls,
    updateAdminControls,
    botMembers,
    language,
    setShowDepositModal,
  } = useApp();

  const [selectedChip, setSelectedChip] = useState<number>(50);
  const [bets, setBets] = useState<{ [key: string]: number }>({});
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([7, 24, 0, 18, 32, 15, 9, 26]);

  // 10-SECOND BETTING TIMER REQUESTED BY USER!
  const [bettingTimer, setBettingTimer] = useState<number>(10);
  const [phase, setPhase] = useState<'betting' | 'spinning' | 'result'>('betting');

  // Wheel animation angles
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [ballRotation, setBallRotation] = useState<number>(0);

  // Bot bets on roulette board
  const [botBets, setBotBets] = useState<{ name: string; target: string; amount: number; avatar: string }[]>([]);

  // Calculate total bet amount
  const totalBet = Object.values(bets).reduce((sum, v) => sum + v, 0);

  // Refs to prevent stale state in timer callbacks
  const betsRef = useRef(bets);
  betsRef.current = bets;
  const isSpinningRef = useRef(isSpinning);
  isSpinningRef.current = isSpinning;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Spin function defined with useCallback
  const executeSpin = useCallback(() => {
    if (isSpinningRef.current) return;
    setIsSpinning(true);
    setPhase('spinning');
    setWinningNumber(null);
    setLastWinAmount(0);

    const currentBets = betsRef.current;
    const currentTotalBet = Object.values(currentBets).reduce((s, v) => s + v, 0);

    // If user placed bets, deduct balance now
    if (currentTotalBet > 0 && currentUser) {
      if (currentUser.balance >= currentTotalBet) {
        updateBalance(-currentTotalBet);
      } else {
        setShowDepositModal(true);
        setIsSpinning(false);
        setPhase('betting');
        setBettingTimer(10);
        return;
      }
    }

    // Determine target winning number
    let targetNum: number;
    if (adminControls.rouletteNextNumber !== null && adminControls.rouletteNextNumber >= 0 && adminControls.rouletteNextNumber <= 36) {
      targetNum = adminControls.rouletteNextNumber;
      updateAdminControls({ rouletteNextNumber: null });
    } else {
      targetNum = WHEEL_NUMBERS[Math.floor(Math.random() * WHEEL_NUMBERS.length)];
    }

    sounds.playTick();

    // Wheel animation rotation
    const numIndex = WHEEL_NUMBERS.indexOf(targetNum);
    const anglePerSlice = 360 / WHEEL_NUMBERS.length;
    const targetAngle = 360 * 5 + (360 - numIndex * anglePerSlice);

    setWheelRotation((prev) => prev + targetAngle);
    setBallRotation((prev) => prev - (360 * 7 + numIndex * anglePerSlice));

    // Spin completes after 4 seconds
    setTimeout(() => {
      setIsSpinning(false);
      setPhase('result');
      setWinningNumber(targetNum);
      setHistory((prev) => [targetNum, ...prev.slice(0, 9)]);

      // Calculate Winnings:
      // Numbering: 9X payout
      // Red / Black: 2X payout
      // Even / Odd: 2X payout
      let totalWon = 0;

      if (currentBets[targetNum.toString()]) {
        totalWon += currentBets[targetNum.toString()] * 9;
      }

      const isRed = RED_NUMBERS.has(targetNum);
      const isBlack = targetNum !== 0 && !isRed;

      if (isRed && currentBets['RED']) {
        totalWon += currentBets['RED'] * 2;
      }
      if (isBlack && currentBets['BLACK']) {
        totalWon += currentBets['BLACK'] * 2;
      }

      if (targetNum !== 0) {
        if (targetNum % 2 === 0 && currentBets['EVEN']) {
          totalWon += currentBets['EVEN'] * 2;
        }
        if (targetNum % 2 !== 0 && currentBets['ODD']) {
          totalWon += currentBets['ODD'] * 2;
        }
      }

      if (totalWon > 0) {
        setLastWinAmount(totalWon);
        updateBalance(totalWon);
        sounds.playWin();
        try {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        } catch { /* ignore */ }
      } else if (currentTotalBet > 0) {
        sounds.playCrash();
      }

      // Rest for 3.5 seconds then start a fresh 10s betting round!
      setTimeout(() => {
        setBets({});
        setPhase('betting');
        setBettingTimer(10);
      }, 3500);
    }, 4000);
  }, [currentUser, updateBalance, adminControls, updateAdminControls, setShowDepositModal]);

  // 10-SECOND COUNTDOWN TIMER EFFECT
  useEffect(() => {
    if (phase !== 'betting') return;

    const interval = setInterval(() => {
      setBettingTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          executeSpin();
          return 0;
        }
        if (prev <= 4) {
          sounds.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, executeSpin]);

  // Generate bot bets periodically
  useEffect(() => {
    if (phase !== 'betting') return;
    const targets = ['RED', 'BLACK', 'EVEN', 'ODD', '7', '18', '24', '0', '32', '12', '19', '36'];
    const fakeBets = [];
    for (let i = 0; i < 5; i++) {
      const bot = botMembers[(i + bettingTimer) % botMembers.length];
      const target = targets[Math.floor(Math.random() * targets.length)];
      const amount = [50, 100, 200, 500, 1000][Math.floor(Math.random() * 5)];
      fakeBets.push({
        name: bot.name,
        target,
        amount,
        avatar: bot.avatar,
      });
    }
    setBotBets(fakeBets);
  }, [bettingTimer, phase, botMembers]);

  // Place bet on a key ('0'..'36', 'RED', 'BLACK', 'EVEN', 'ODD')
  const handlePlaceBet = (key: string) => {
    if (phase !== 'betting' || isSpinning) return;
    if (!currentUser) return;
    if (currentUser.balance < totalBet + selectedChip) {
      setShowDepositModal(true);
      return;
    }
    sounds.playChip();
    setBets((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + selectedChip,
    }));
  };

  const handleClearBets = () => {
    if (phase !== 'betting' || isSpinning) return;
    setBets({});
  };

  const handleDoubleBets = () => {
    if (phase !== 'betting' || isSpinning) return;
    if (!currentUser) return;
    if (currentUser.balance < totalBet * 2) {
      setShowDepositModal(true);
      return;
    }
    setBets((prev) => {
      const doubled: { [key: string]: number } = {};
      for (const [k, v] of Object.entries(prev)) {
        doubled[k] = Math.min(100000, v * 2);
      }
      return doubled;
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#070b1a] text-white flex flex-col pb-28">
      {/* Top Bar with Clear Back Button */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-[#0d142d] border-b border-cyan-500/20 sticky top-0 z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 hover:text-white text-xs font-bold active:scale-95 transition-all shadow-sm"
          title="واپس گیمز"
        >
          <ChevronLeft className="w-5 h-5 text-cyan-400 stroke-[2.5]" />
          <span>← واپس گیمز (Back)</span>
        </button>

        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-300 text-sm">
            🎡
          </div>
          <div>
            <h1 className="text-sm font-black text-white font-mono tracking-wider">ROULETTE 9X</h1>
            <span className="text-[9px] text-amber-300 font-bold block -mt-0.5">10 سیکنڈ بیٹنگ راؤنڈ</span>
          </div>
        </div>

        <div className="bg-[#141b36] px-2.5 py-1 rounded-xl border border-cyan-500/30 text-right">
          <span className="text-[9px] text-gray-400 block leading-none">بیلنس</span>
          <span className="text-xs font-black text-cyan-300 font-mono">
            Rs {currentUser?.balance.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>

      {/* 10-Second Timer Banner requested by user */}
      <div className="px-3 pt-2">
        <div className="flex items-center justify-between bg-gradient-to-r from-[#131b3e] to-[#0d132e] border border-cyan-500/30 rounded-2xl px-3.5 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${bettingTimer <= 3 && phase === 'betting' ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} />
            <div>
              <span className="text-[10px] text-gray-300 font-bold block leading-none">
                {phase === 'betting'
                  ? 'بیٹنگ کا وقت (Betting Time):'
                  : phase === 'spinning'
                  ? 'وہیل گھوم رہی ہے (Spinning)...'
                  : 'نتیجہ (Result)'}
              </span>
              <span className="text-[9px] text-cyan-400 font-medium">
                {phase === 'betting' ? 'شرط لگائیں اور 9X جیتیں' : 'کھیل جاری ہے'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 font-mono">
            {phase === 'betting' ? (
              <span className={`text-xl font-black px-2.5 py-0.5 rounded-xl border ${
                bettingTimer <= 3
                  ? 'bg-red-950/80 text-red-400 border-red-500 animate-pulse'
                  : 'bg-black/60 text-amber-400 border-amber-500/40'
              }`}>
                00:{bettingTimer < 10 ? `0${bettingTimer}` : bettingTimer}
              </span>
            ) : (
              <span className="text-xs font-black text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-xl border border-cyan-500/40 flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>SPINNING</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* History Bar */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#050813] overflow-x-auto no-scrollbar border-b border-slate-800 mt-2">
        <span className="text-[9px] text-gray-500 font-bold uppercase shrink-0">آخری نمبرز:</span>
        {history.map((num, i) => (
          <span
            key={i}
            className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center font-mono shrink-0 shadow ${
              num === 0 ? 'bg-emerald-600 text-white' : RED_NUMBERS.has(num) ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'
            }`}
          >
            {num}
          </span>
        ))}
      </div>

      {/* Interactive Roulette Visual Display */}
      <div className="px-3 pt-2">
        <div className="relative bg-gradient-to-b from-[#111938] to-[#080d1e] rounded-2xl border border-cyan-500/30 p-3 shadow-2xl flex flex-col items-center overflow-hidden">
          {/* Wheel Graphic */}
          <div className="relative w-44 h-44 rounded-full border-4 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center justify-center bg-[#070b19] overflow-hidden my-1">
            <div
              className="absolute inset-0 rounded-full transition-transform ease-out duration-[4000ms]"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                backgroundImage: 'radial-gradient(circle at center, #1b264f 20%, #0d122b 70%)',
              }}
            >
              {/* Radial Segments */}
              {WHEEL_NUMBERS.map((n, idx) => {
                const angle = (idx * 360) / WHEEL_NUMBERS.length;
                const isRed = RED_NUMBERS.has(n);
                return (
                  <div
                    key={n}
                    className="absolute top-0 left-1/2 -ml-[10px] w-5 h-20 origin-bottom text-[8px] font-black font-mono flex items-start justify-center pt-1"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      color: n === 0 ? '#10b981' : isRed ? '#ef4444' : '#cbd5e1',
                    }}
                  >
                    {n}
                  </div>
                );
              })}
            </div>

            {/* Ball spinning simulation indicator */}
            {isSpinning && (
              <div
                className="absolute inset-2 rounded-full pointer-events-none transition-transform ease-out duration-[4000ms]"
                style={{ transform: `rotate(${ballRotation}deg)` }}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_white] absolute top-1 left-1/2 -translate-x-1/2 animate-bounce" />
              </div>
            )}

            {/* Center Cap */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 p-1 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0f26] rounded-full flex flex-col items-center justify-center">
                {isSpinning ? (
                  <RotateCw className="w-5 h-5 text-amber-400 animate-spin" />
                ) : winningNumber !== null ? (
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] text-gray-400 uppercase leading-none">جیت</span>
                    <span className={`text-xl font-black font-mono leading-none ${
                      winningNumber === 0 ? 'text-emerald-400' : RED_NUMBERS.has(winningNumber) ? 'text-red-400' : 'text-slate-200'
                    }`}>
                      {winningNumber}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-amber-400">10s</span>
                )}
              </div>
            </div>
          </div>

          {/* Win Announcement Badge */}
          {lastWinAmount > 0 && (
            <div className="mt-2 py-1 px-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/40 animate-bounce">
              <Trophy className="w-4 h-4" />
              <span>مبارک ہو! آپ جیتے Rs {lastWinAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-3">
            <span>🎯 نمبر پے آؤٹ: <strong className="text-amber-400 font-mono">9X</strong></span>
            <span>🔴/⚫ کلر پے آؤٹ: <strong className="text-cyan-400 font-mono">2X</strong></span>
          </div>
        </div>
      </div>

      {/* ROULETTE BOARD TABLE (Full numbers grid + Red/Black + Even/Odd) */}
      <div className="px-3 mt-3">
        <div className="bg-[#0f1633] border border-cyan-500/20 rounded-2xl p-2.5 shadow-xl">
          {/* Top Board Rows: Zero + Red/Black/Even/Odd */}
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {/* Zero Button (9X Payout) */}
            <button
              onClick={() => handlePlaceBet('0')}
              disabled={phase !== 'betting'}
              className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex flex-col items-center justify-center relative shadow active:scale-95 border border-emerald-400/40 disabled:opacity-40"
            >
              <span>0 (سبز)</span>
              <span className="text-[9px] text-emerald-200 font-mono">9X</span>
              {bets['0'] && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-mono font-black text-[9px] px-1 rounded-full shadow">
                  Rs {bets['0']}
                </span>
              )}
            </button>

            {/* Red Button (2X Payout) */}
            <button
              onClick={() => handlePlaceBet('RED')}
              disabled={phase !== 'betting'}
              className="py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex flex-col items-center justify-center relative shadow active:scale-95 border border-red-400/40 disabled:opacity-40"
            >
              <span>سرخ (RED)</span>
              <span className="text-[9px] text-red-200 font-mono">2X</span>
              {bets['RED'] && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-mono font-black text-[9px] px-1 rounded-full shadow">
                  Rs {bets['RED']}
                </span>
              )}
            </button>

            {/* Black Button (2X Payout) */}
            <button
              onClick={() => handlePlaceBet('BLACK')}
              disabled={phase !== 'betting'}
              className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex flex-col items-center justify-center relative shadow active:scale-95 border border-slate-600 disabled:opacity-40"
            >
              <span>سیاہ (BLACK)</span>
              <span className="text-[9px] text-gray-300 font-mono">2X</span>
              {bets['BLACK'] && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-mono font-black text-[9px] px-1 rounded-full shadow">
                  Rs {bets['BLACK']}
                </span>
              )}
            </button>

            {/* Even Button */}
            <button
              onClick={() => handlePlaceBet('EVEN')}
              disabled={phase !== 'betting'}
              className="py-2 rounded-xl bg-[#1b254b] hover:bg-[#233061] text-cyan-300 font-black text-xs flex flex-col items-center justify-center relative shadow active:scale-95 border border-cyan-500/30 disabled:opacity-40"
            >
              <span>جفت (EVEN)</span>
              <span className="text-[9px] text-cyan-200 font-mono">2X</span>
              {bets['EVEN'] && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-mono font-black text-[9px] px-1 rounded-full shadow">
                  Rs {bets['EVEN']}
                </span>
              )}
            </button>

            {/* Odd Button */}
            <button
              onClick={() => handlePlaceBet('ODD')}
              disabled={phase !== 'betting'}
              className="py-2 rounded-xl bg-[#1b254b] hover:bg-[#233061] text-amber-300 font-black text-xs flex flex-col items-center justify-center relative shadow active:scale-95 border border-amber-500/30 disabled:opacity-40"
            >
              <span>طاق (ODD)</span>
              <span className="text-[9px] text-amber-200 font-mono">2X</span>
              {bets['ODD'] && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-mono font-black text-[9px] px-1 rounded-full shadow">
                  Rs {bets['ODD']}
                </span>
              )}
            </button>
          </div>

          {/* Numbers Board (1 to 36) */}
          <div className="text-[10px] text-gray-400 mb-1 flex items-center justify-between">
            <span className="font-bold text-gray-300">نمبرنگ بورڈ (ہر نمبر پر 9X انعام):</span>
            <span className="text-amber-400 font-bold">1 روپیہ سے 100,000 روپے</span>
          </div>

          <div className="grid grid-cols-6 gap-1 max-h-56 overflow-y-auto pr-0.5">
            {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
              const isRed = RED_NUMBERS.has(num);
              const betAmt = bets[num.toString()];
              return (
                <button
                  key={num}
                  onClick={() => handlePlaceBet(num.toString())}
                  disabled={phase !== 'betting'}
                  className={`py-2 px-1 rounded-lg font-black font-mono text-xs flex flex-col items-center justify-center relative transition-transform active:scale-90 shadow-sm border disabled:opacity-40 ${
                    isRed
                      ? 'bg-red-700 hover:bg-red-600 text-white border-red-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700'
                  }`}
                >
                  <span className="text-sm">{num}</span>
                  {betAmt ? (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-black text-[9px] px-1 rounded-full shadow z-10">
                      {betAmt >= 1000 ? `${(betAmt / 1000).toFixed(0)}k` : betAmt}
                    </span>
                  ) : (
                    <span className="text-[8px] opacity-70">9x</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Chip Value Selectors */}
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
            {[1, 10, 50, 100, 500, 1000, 5000].map((chip) => (
              <button
                key={chip}
                onClick={() => setSelectedChip(chip)}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-black font-mono shrink-0 transition-transform ${
                  selectedChip === chip
                    ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-black scale-105 shadow-md shadow-amber-400/30 ring-2 ring-white'
                    : 'bg-[#182142] text-gray-300 hover:bg-[#202c58]'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Action Footer: Clear, Double, and Spin Button */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              onClick={handleClearBets}
              disabled={phase !== 'betting' || totalBet === 0}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>صاف کریں</span>
            </button>

            <button
              onClick={handleDoubleBets}
              disabled={phase !== 'betting' || totalBet === 0}
              className="py-2.5 rounded-xl bg-[#1d2750] hover:bg-[#27346b] text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-40"
            >
              <span>2X ڈبل</span>
            </button>

            <button
              onClick={executeSpin}
              disabled={isSpinning}
              className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs sm:text-sm flex flex-col items-center justify-center shadow-lg shadow-cyan-500/30 active:scale-95 disabled:opacity-40"
            >
              <span>{isSpinning ? 'گھوم رہا ہے...' : 'ابھی گھمائیں'}</span>
              <span className="text-[10px] font-mono -mt-0.5">
                Rs {totalBet}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Fake Members / Bot Bets Feed on Roulette */}
      <div className="px-3 mt-3">
        <div className="bg-[#0e142e] border border-cyan-500/20 rounded-2xl p-2.5">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-gray-300">لائیو کھلاڑیوں کی شرطیں (10s راؤنڈ)</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              {botBets.length + 84} آن لائن
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto">
            {botBets.map((b, idx) => (
              <div key={idx} className="flex items-center justify-between p-1 rounded-lg bg-[#141b3a] text-[10px]">
                <div className="flex items-center gap-1 truncate">
                  <img src={b.avatar} alt="bot" className="w-4 h-4 rounded-full" />
                  <span className="text-gray-300 truncate">{b.name}</span>
                </div>
                <div className="font-mono text-cyan-300">
                  <span>{b.target}: </span>
                  <strong className="text-amber-300">Rs {b.amount}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
