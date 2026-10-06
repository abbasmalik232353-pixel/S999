import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import { ArrowLeft, Clock, Award, Users, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export const WingoGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const {
    currentUser,
    updateBalance,
    adminControls,
    updateAdminControls,
    botMembers,
    language,
    setShowDepositModal,
  } = useApp();

  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [period, setPeriod] = useState<number>(() => Math.floor(Date.now() / 30000));
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [placedBets, setPlacedBets] = useState<{ [key: string]: number }>({});
  const [history, setHistory] = useState<{ period: number; number: number; color: 'green' | 'red' | 'violet' }[]>([
    { period: 9482, number: 7, color: 'green' },
    { period: 9481, number: 2, color: 'red' },
    { period: 9480, number: 5, color: 'violet' },
    { period: 9479, number: 9, color: 'green' },
    { period: 9478, number: 4, color: 'red' },
  ]);
  const [lastWin, setLastWin] = useState<number>(0);

  // Bot bets
  const [botBets, setBotBets] = useState<{ name: string; bet: string; amount: number; avatar: string }[]>([]);

  // Timer countdown loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Resolve round
          resolveRound();
          return 30;
        }
        if (prev <= 5) {
          sounds.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [placedBets, adminControls, period]);

  // Generate bot bets periodically
  useEffect(() => {
    if (timeLeft > 5) {
      const options = ['GREEN', 'RED', 'VIOLET', 'BIG', 'SMALL', '7', '3', '8', '2', '0'];
      const fakes = [];
      for (let i = 0; i < 4; i++) {
        const bot = botMembers[(i + timeLeft) % botMembers.length];
        fakes.push({
          name: bot.name,
          bet: options[Math.floor(Math.random() * options.length)],
          amount: [50, 100, 200, 500][Math.floor(Math.random() * 4)],
          avatar: bot.avatar,
        });
      }
      setBotBets(fakes);
    }
  }, [timeLeft, botMembers]);

  const resolveRound = () => {
    // Determine winning number (0 - 9)
    let winNum: number;
    if (adminControls.wingoNextNumber !== null && adminControls.wingoNextNumber >= 0 && adminControls.wingoNextNumber <= 9) {
      winNum = adminControls.wingoNextNumber;
      updateAdminControls({ wingoNextNumber: null }); // clear override
    } else {
      winNum = Math.floor(Math.random() * 10);
    }

    let winColor: 'green' | 'red' | 'violet' = 'green';
    if (winNum === 0 || winNum === 5) {
      winColor = 'violet';
    } else if ([1, 3, 7, 9].includes(winNum)) {
      winColor = 'green';
    } else {
      winColor = 'red';
    }

    // Add to history
    setHistory((prev) => [{ period, number: winNum, color: winColor }, ...prev.slice(0, 9)]);
    setPeriod((prev) => prev + 1);

    // Calculate payouts
    let totalWon = 0;
    // Number bet (9X payout)
    if (placedBets[winNum.toString()]) {
      totalWon += placedBets[winNum.toString()] * 9;
    }
    // Color bet
    if (winColor === 'green' && placedBets['GREEN']) totalWon += placedBets['GREEN'] * 2;
    if (winColor === 'red' && placedBets['RED']) totalWon += placedBets['RED'] * 2;
    if (winColor === 'violet' && placedBets['VIOLET']) totalWon += placedBets['VIOLET'] * 4.5;

    // Big / Small
    const isBig = winNum >= 5;
    if (isBig && placedBets['BIG']) totalWon += placedBets['BIG'] * 2;
    if (!isBig && placedBets['SMALL']) totalWon += placedBets['SMALL'] * 2;

    if (totalWon > 0) {
      setLastWin(totalWon);
      updateBalance(totalWon);
      sounds.playWin();
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch { /* ignore */ }
    } else if (Object.keys(placedBets).length > 0) {
      sounds.playCrash();
    }

    // Reset user bets for next round
    setPlacedBets({});
  };

  const handlePlaceBet = (key: string) => {
    if (timeLeft <= 5) return; // Locked in last 5 seconds
    if (!currentUser) return;
    if (currentUser.balance < betAmount) {
      setShowDepositModal(true);
      return;
    }

    updateBalance(-betAmount);
    sounds.playChip();
    setPlacedBets((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + betAmount,
    }));
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#090d21] text-white flex flex-col pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0e1533] border-b border-cyan-500/20">
        <button
          onClick={onBack}
          className="p-1.5 rounded-xl bg-slate-800 text-gray-300 hover:text-white flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ur' ? 'واپس' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 text-sm">
            🎱
          </div>
          <div>
            <h1 className="text-sm font-black text-white font-mono tracking-wider">WIN GO 30S</h1>
            <span className="text-[9px] text-purple-300 font-bold block -mt-0.5">کلر اور نمبر لاٹری</span>
          </div>
        </div>

        <div className="bg-[#141b36] px-2.5 py-1 rounded-xl border border-cyan-500/30 text-right">
          <span className="text-[9px] text-gray-400 block leading-none">بیلنس</span>
          <span className="text-xs font-black text-cyan-300 font-mono">
            Rs {currentUser?.balance.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>

      {/* Timer & Round Info Box */}
      <div className="px-3 pt-3">
        <div className="bg-gradient-to-r from-purple-950 via-[#151b3d] to-indigo-950 rounded-2xl border border-purple-500/30 p-3 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">راؤنڈ نمبر</span>
            <span className="text-sm font-black font-mono text-cyan-300">{period}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              باقی وقت
            </span>
            <div className="flex items-center gap-1 mt-0.5 font-mono">
              <span className={`text-2xl font-black px-2 py-0.5 rounded-lg bg-black/60 border ${
                timeLeft <= 5 ? 'text-red-500 border-red-500 animate-ping' : 'text-amber-400 border-amber-500/30'
              }`}>
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 block">پچھلا رزلٹ</span>
            {history[0] && (
              <span className={`text-sm font-black font-mono px-2 py-0.5 rounded-full inline-block ${
                history[0].color === 'green' ? 'bg-emerald-600 text-white' : history[0].color === 'red' ? 'bg-red-600 text-white' : 'bg-purple-600 text-white'
              }`}>
                {history[0].number} ({history[0].color})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Win Celebration */}
      {lastWin > 0 && (
        <div className="mx-3 mt-2 py-1 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 animate-bounce">
          <Trophy className="w-4 h-4" />
          <span>مبارک ہو! آپ ون گو سے جیتے Rs {lastWin.toLocaleString()}</span>
        </div>
      )}

      {/* Lock warning in last 5 seconds */}
      {timeLeft <= 5 && (
        <div className="mx-3 mt-2 py-1 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-center text-xs font-bold animate-pulse">
          ⚠️ شرط لگانے کا وقت ختم! نتیجہ آ رہا ہے...
        </div>
      )}

      {/* Betting Options */}
      <div className="px-3 mt-3">
        <div className="bg-[#0f1530] border border-cyan-500/20 rounded-2xl p-3 shadow-xl">
          {/* Color Betting: Green (2x), Violet (4.5x), Red (2x) */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => handlePlaceBet('GREEN')}
              disabled={timeLeft <= 5}
              className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex flex-col items-center justify-center relative shadow-lg active:scale-95 disabled:opacity-40"
            >
              <span>سبز (Green)</span>
              <span className="text-[10px] text-emerald-200 font-mono">2X</span>
              {placedBets['GREEN'] && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-black text-[9px] px-1 rounded-full">
                  Rs {placedBets['GREEN']}
                </span>
              )}
            </button>

            <button
              onClick={() => handlePlaceBet('VIOLET')}
              disabled={timeLeft <= 5}
              className="py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex flex-col items-center justify-center relative shadow-lg active:scale-95 disabled:opacity-40"
            >
              <span>جامنی (Violet)</span>
              <span className="text-[10px] text-purple-200 font-mono">4.5X</span>
              {placedBets['VIOLET'] && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-black text-[9px] px-1 rounded-full">
                  Rs {placedBets['VIOLET']}
                </span>
              )}
            </button>

            <button
              onClick={() => handlePlaceBet('RED')}
              disabled={timeLeft <= 5}
              className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex flex-col items-center justify-center relative shadow-lg active:scale-95 disabled:opacity-40"
            >
              <span>سرخ (Red)</span>
              <span className="text-[10px] text-red-200 font-mono">2X</span>
              {placedBets['RED'] && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-black text-[9px] px-1 rounded-full">
                  Rs {placedBets['RED']}
                </span>
              )}
            </button>
          </div>

          {/* Numbers Grid (0 to 9 - 9X Payout) */}
          <div className="text-[10px] text-gray-400 mb-1 flex items-center justify-between">
            <span className="font-bold text-gray-300">سنگل نمبر بیٹنگ (9X انعام):</span>
            <span className="text-amber-400 font-bold">1 سے 100,000 روپے</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const isViolet = num === 0 || num === 5;
              const isGreen = [1, 3, 7, 9].includes(num);
              const colorBg = isViolet ? 'bg-purple-700' : isGreen ? 'bg-emerald-700' : 'bg-red-700';
              return (
                <button
                  key={num}
                  onClick={() => handlePlaceBet(num.toString())}
                  disabled={timeLeft <= 5}
                  className={`py-2 rounded-xl text-white font-black text-sm flex flex-col items-center justify-center relative shadow active:scale-90 disabled:opacity-40 ${colorBg}`}
                >
                  <span>{num}</span>
                  <span className="text-[8px] opacity-80 font-mono">9X</span>
                  {placedBets[num.toString()] && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-black text-[9px] px-1 rounded-full">
                      Rs {placedBets[num.toString()]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Big / Small */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => handlePlaceBet('BIG')}
              disabled={timeLeft <= 5}
              className="py-2 rounded-xl bg-[#1b254c] hover:bg-[#243163] text-amber-300 font-black text-xs flex items-center justify-center gap-1 border border-amber-500/30 relative disabled:opacity-40"
            >
              <span>بڑا (BIG 5-9) 2X</span>
              {placedBets['BIG'] && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-black text-[9px] px-1 rounded-full">
                  Rs {placedBets['BIG']}
                </span>
              )}
            </button>

            <button
              onClick={() => handlePlaceBet('SMALL')}
              disabled={timeLeft <= 5}
              className="py-2 rounded-xl bg-[#1b254c] hover:bg-[#243163] text-cyan-300 font-black text-xs flex items-center justify-center gap-1 border border-cyan-500/30 relative disabled:opacity-40"
            >
              <span>چھوٹا (SMALL 0-4) 2X</span>
              {placedBets['SMALL'] && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-black text-[9px] px-1 rounded-full">
                  Rs {placedBets['SMALL']}
                </span>
              )}
            </button>
          </div>

          {/* Bet Amount Selector */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1.5 text-xs text-gray-300">
              <span>شرط کی رقم:</span>
              <span className="font-mono font-bold text-cyan-300">Rs {betAmount}</span>
            </div>
            <div className="flex items-center justify-between gap-1">
              {[1, 10, 50, 100, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold font-mono ${
                    betAmount === amt ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-gray-300'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="px-3 mt-3">
        <div className="bg-[#0e142e] border border-cyan-500/20 rounded-2xl p-2.5">
          <span className="text-xs font-bold text-gray-300 block mb-1.5">راؤنڈز کی ہسٹری</span>
          <div className="space-y-1">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-[#141b38] text-xs">
                <span className="font-mono text-gray-400">{h.period}</span>
                <span className={`w-6 h-6 rounded-full font-black flex items-center justify-center font-mono ${
                  h.color === 'green' ? 'bg-emerald-600 text-white' : h.color === 'red' ? 'bg-red-600 text-white' : 'bg-purple-600 text-white'
                }`}>
                  {h.number}
                </span>
                <span className="text-[10px] font-bold uppercase text-gray-300">{h.color}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
