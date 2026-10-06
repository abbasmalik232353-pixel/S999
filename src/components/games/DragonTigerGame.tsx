import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import { ArrowLeft, Swords, Users, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Card {
  value: number; // 1-13
  suit: '♠' | '♥' | '♦' | '♣';
  name: string;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const CARD_NAMES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const DragonTigerGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const {
    currentUser,
    updateBalance,
    adminControls,
    updateAdminControls,
    botMembers,
    language,
    setShowDepositModal,
  } = useApp();

  const [gameState, setGameState] = useState<'betting' | 'dealing' | 'result'>('betting');
  const [timer, setTimer] = useState<number>(6);
  const [dragonCard, setDragonCard] = useState<Card | null>(null);
  const [tigerCard, setTigerCard] = useState<Card | null>(null);
  const [winner, setWinner] = useState<'dragon' | 'tiger' | 'tie' | null>(null);

  const [selectedBet, setSelectedBet] = useState<'dragon' | 'tiger' | 'tie' | null>(null);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [placedBets, setPlacedBets] = useState<{ dragon: number; tiger: number; tie: number }>({
    dragon: 0,
    tiger: 0,
    tie: 0,
  });

  const [lastWin, setLastWin] = useState<number>(0);
  const [history, setHistory] = useState<('D' | 'T' | 'X')[]>(['D', 'T', 'D', 'D', 'T', 'X', 'T']);

  // Deal card helper
  const getRandomCard = (forceValue?: number): Card => {
    const val = forceValue !== undefined ? forceValue : Math.floor(Math.random() * 13) + 1;
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    return {
      value: val,
      suit,
      name: CARD_NAMES[val - 1],
    };
  };

  // Game loop
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState === 'betting') {
      setDragonCard(null);
      setTigerCard(null);
      setWinner(null);
      let t = 6;
      setTimer(t);

      interval = setInterval(() => {
        t -= 1;
        setTimer(t);
        sounds.playTick();
        if (t <= 0) {
          clearInterval(interval);
          startDealing();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState]);

  const startDealing = () => {
    setGameState('dealing');

    // Generate cards according to admin override or random
    let dVal = Math.floor(Math.random() * 13) + 1;
    let tVal = Math.floor(Math.random() * 13) + 1;

    if (adminControls.dragonTigerNextWinner) {
      if (adminControls.dragonTigerNextWinner === 'dragon') {
        dVal = 10;
        tVal = 4;
      } else if (adminControls.dragonTigerNextWinner === 'tiger') {
        dVal = 3;
        tVal = 11;
      } else {
        dVal = 8;
        tVal = 8;
      }
      updateAdminControls({ dragonTigerNextWinner: null });
    }

    const dCard = getRandomCard(dVal);
    const tCard = getRandomCard(tVal);

    sounds.playChip();
    setDragonCard(dCard);

    setTimeout(() => {
      sounds.playChip();
      setTigerCard(tCard);

      // Determine winner
      let win: 'dragon' | 'tiger' | 'tie';
      if (dCard.value > tCard.value) {
        win = 'dragon';
      } else if (tCard.value > dCard.value) {
        win = 'tiger';
      } else {
        win = 'tie';
      }

      setWinner(win);
      setGameState('result');
      setHistory((prev) => [win === 'dragon' ? 'D' : win === 'tiger' ? 'T' : 'X', ...prev.slice(0, 9)]);

      // Calculate payouts
      let won = 0;
      if (win === 'dragon' && placedBets.dragon > 0) {
        won += placedBets.dragon * 2;
      }
      if (win === 'tiger' && placedBets.tiger > 0) {
        won += placedBets.tiger * 2;
      }
      if (win === 'tie' && placedBets.tie > 0) {
        won += placedBets.tie * 8;
      }

      if (won > 0) {
        setLastWin(won);
        updateBalance(won);
        sounds.playWin();
        try { confetti({ particleCount: 40, spread: 60 }); } catch { /* ignore */ }
      } else if (placedBets.dragon > 0 || placedBets.tiger > 0 || placedBets.tie > 0) {
        sounds.playCrash();
      }

      // Next round reset
      setTimeout(() => {
        setPlacedBets({ dragon: 0, tiger: 0, tie: 0 });
        setGameState('betting');
      }, 3500);
    }, 1200);
  };

  const handlePlaceBet = (side: 'dragon' | 'tiger' | 'tie') => {
    if (gameState !== 'betting') return;
    if (!currentUser) return;
    if (currentUser.balance < betAmount) {
      setShowDepositModal(true);
      return;
    }

    updateBalance(-betAmount);
    sounds.playChip();
    setPlacedBets((prev) => ({
      ...prev,
      [side]: prev[side] + betAmount,
    }));
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#0a0d20] text-white flex flex-col pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0d1430] border-b border-cyan-500/20">
        <button
          onClick={onBack}
          className="p-1.5 rounded-xl bg-slate-800 text-gray-300 hover:text-white flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ur' ? 'واپس' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-amber-600/30 border border-amber-500/50 flex items-center justify-center text-amber-300 text-sm">
            🐉
          </div>
          <div>
            <h1 className="text-sm font-black text-white font-mono tracking-wider">DRAGON TIGER</h1>
            <span className="text-[9px] text-amber-300 font-bold block -mt-0.5">کارڈ بیٹل 2X</span>
          </div>
        </div>

        <div className="bg-[#141b36] px-2.5 py-1 rounded-xl border border-cyan-500/30 text-right">
          <span className="text-[9px] text-gray-400 block leading-none">بیلنس</span>
          <span className="text-xs font-black text-cyan-300 font-mono">
            Rs {currentUser?.balance.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>

      {/* History Beads */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-[#070a18] overflow-x-auto border-b border-slate-800">
        <span className="text-[9px] text-gray-500 font-bold uppercase shrink-0">ہسٹری:</span>
        {history.map((h, i) => (
          <span
            key={i}
            className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
              h === 'D' ? 'bg-red-600 text-white' : h === 'T' ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white'
            }`}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Arena Display: Dragon vs Tiger Cards */}
      <div className="px-3 pt-3">
        <div className="relative bg-gradient-to-b from-[#141c40] to-[#090f26] rounded-2xl border border-amber-500/30 p-4 shadow-2xl flex flex-col items-center">
          {/* Status badge */}
          <div className="mb-3">
            {gameState === 'betting' ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs font-mono animate-pulse">
                بیٹنگ کا وقت: {timer}s
              </span>
            ) : gameState === 'dealing' ? (
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black text-xs">
                کارڈز شو ہو رہے ہیں...
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs">
                {winner === 'dragon' ? 'ڈریگن جیت گیا!' : winner === 'tiger' ? 'ٹائیگر جیت گیا!' : 'برابر (TIE)!'}
              </span>
            )}
          </div>

          {/* Cards Showcase */}
          <div className="grid grid-cols-2 gap-8 w-full max-w-xs my-2">
            {/* Dragon Card */}
            <div className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
              winner === 'dragon' ? 'bg-red-950/60 border-red-500 shadow-lg shadow-red-500/50 scale-105' : 'bg-[#101530] border-red-900/40'
            }`}>
              <span className="text-xs font-black text-red-400 mb-2">🐉 DRAGON</span>
              <div className="w-20 h-28 rounded-xl bg-white text-black flex flex-col items-center justify-between p-2 shadow-xl">
                {dragonCard ? (
                  <>
                    <span className={`text-base font-black self-start ${dragonCard.suit === '♥' || dragonCard.suit === '♦' ? 'text-red-600' : 'text-black'}`}>
                      {dragonCard.name}
                    </span>
                    <span className="text-3xl">{dragonCard.suit}</span>
                    <span className={`text-base font-black self-end ${dragonCard.suit === '♥' || dragonCard.suit === '♦' ? 'text-red-600' : 'text-black'}`}>
                      {dragonCard.name}
                    </span>
                  </>
                ) : (
                  <div className="w-full h-full bg-blue-900 rounded-lg flex items-center justify-center text-white text-xs font-black">
                    S999
                  </div>
                )}
              </div>
            </div>

            {/* Tiger Card */}
            <div className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
              winner === 'tiger' ? 'bg-amber-950/60 border-amber-500 shadow-lg shadow-amber-500/50 scale-105' : 'bg-[#101530] border-amber-900/40'
            }`}>
              <span className="text-xs font-black text-amber-400 mb-2">🐯 TIGER</span>
              <div className="w-20 h-28 rounded-xl bg-white text-black flex flex-col items-center justify-between p-2 shadow-xl">
                {tigerCard ? (
                  <>
                    <span className={`text-base font-black self-start ${tigerCard.suit === '♥' || tigerCard.suit === '♦' ? 'text-red-600' : 'text-black'}`}>
                      {tigerCard.name}
                    </span>
                    <span className="text-3xl">{tigerCard.suit}</span>
                    <span className={`text-base font-black self-end ${tigerCard.suit === '♥' || tigerCard.suit === '♦' ? 'text-red-600' : 'text-black'}`}>
                      {tigerCard.name}
                    </span>
                  </>
                ) : (
                  <div className="w-full h-full bg-red-900 rounded-lg flex items-center justify-center text-white text-xs font-black">
                    S999
                  </div>
                )}
              </div>
            </div>
          </div>

          {lastWin > 0 && (
            <div className="mt-2 py-1 px-4 rounded-full bg-emerald-500 text-black font-black text-xs flex items-center gap-1 animate-bounce">
              <Trophy className="w-4 h-4" />
              <span>جیت گئے! Rs {lastWin.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Betting Areas */}
      <div className="px-3 mt-3">
        <div className="bg-[#0f1530] border border-cyan-500/20 rounded-2xl p-3 shadow-xl">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {/* Dragon Bet */}
            <button
              onClick={() => handlePlaceBet('dragon')}
              disabled={gameState !== 'betting'}
              className="py-4 rounded-xl bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-black text-xs flex flex-col items-center justify-center relative shadow-lg active:scale-95 disabled:opacity-40"
            >
              <span>ڈریگن (Dragon)</span>
              <span className="text-[10px] text-red-200 font-mono">2X</span>
              {placedBets.dragon > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-black text-[9px] px-1 rounded-full">
                  Rs {placedBets.dragon}
                </span>
              )}
            </button>

            {/* Tie Bet */}
            <button
              onClick={() => handlePlaceBet('tie')}
              disabled={gameState !== 'betting'}
              className="py-4 rounded-xl bg-gradient-to-b from-emerald-700 to-teal-900 hover:from-emerald-600 hover:to-teal-800 text-white font-black text-xs flex flex-col items-center justify-center relative shadow-lg active:scale-95 disabled:opacity-40"
            >
              <span>برابر (Tie)</span>
              <span className="text-[10px] text-emerald-200 font-mono">8X</span>
              {placedBets.tie > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-black text-[9px] px-1 rounded-full">
                  Rs {placedBets.tie}
                </span>
              )}
            </button>

            {/* Tiger Bet */}
            <button
              onClick={() => handlePlaceBet('tiger')}
              disabled={gameState !== 'betting'}
              className="py-4 rounded-xl bg-gradient-to-b from-amber-600 to-yellow-800 hover:from-amber-500 hover:to-yellow-700 text-white font-black text-xs flex flex-col items-center justify-center relative shadow-lg active:scale-95 disabled:opacity-40"
            >
              <span>ٹائیگر (Tiger)</span>
              <span className="text-[10px] text-amber-200 font-mono">2X</span>
              {placedBets.tiger > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-black text-[9px] px-1 rounded-full">
                  Rs {placedBets.tiger}
                </span>
              )}
            </button>
          </div>

          {/* Bet Amount Chips */}
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
    </div>
  );
};
