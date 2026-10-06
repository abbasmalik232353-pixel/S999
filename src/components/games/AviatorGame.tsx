import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import { ArrowLeft, Zap, Users, Play, CheckCircle2, AlertTriangle, Shield, Settings2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BotBet {
  id: string;
  name: string;
  bet: number;
  cashoutAt: number;
  cashedOut: boolean;
  avatar: string;
}

export const AviatorGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const {
    currentUser,
    updateBalance,
    adminControls,
    updateAdminControls,
    botMembers,
    language,
    setShowDepositModal,
  } = useApp();

  // Game cycle states: 'betting' | 'flying' | 'crashed'
  const [gameState, setGameState] = useState<'betting' | 'flying' | 'crashed'>('betting');
  const [countdown, setCountdown] = useState<number>(5);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashPoint, setCrashPoint] = useState<number>(2.50);

  // User Bet state
  const [betAmount, setBetAmount] = useState<number>(50);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [wonAmount, setWonAmount] = useState<number>(0);

  // Auto Cashout
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState<boolean>(false);
  const [autoCashoutMultiplier, setAutoCashoutMultiplier] = useState<number>(2.00);

  // Past rounds multipliers history
  const [history, setHistory] = useState<number[]>([1.45, 2.15, 1.12, 5.80, 1.90, 12.40, 1.30, 3.20]);

  // Bot bets for this round
  const [activeBots, setActiveBots] = useState<BotBet[]>([]);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const flightStartTimeRef = useRef<number>(0);

  // Generate bot bets when entering betting phase
  const generateBotBets = () => {
    const bots: BotBet[] = [];
    const count = Math.floor(Math.random() * 6 + 8); // 8-14 bots
    for (let i = 0; i < count; i++) {
      const b = botMembers[i % botMembers.length];
      const botBet = [10, 50, 100, 200, 500, 1000, 2500, 5000][Math.floor(Math.random() * 8)];
      const botTarget = parseFloat((1.2 + Math.random() * 4.5).toFixed(2));
      bots.push({
        id: `bot_${i}_${Date.now()}`,
        name: b.name,
        avatar: b.avatar,
        bet: botBet,
        cashoutAt: botTarget,
        cashedOut: false,
      });
    }
    setActiveBots(bots);
  };

  // Determine crash point
  const getNextCrash = (): number => {
    if (adminControls.aviatorNextCrash !== null) {
      const fixed = adminControls.aviatorNextCrash;
      // Reset override after use
      updateAdminControls({ aviatorNextCrash: null });
      return fixed;
    }
    // Realistic distribution
    const rand = Math.random();
    if (rand < 0.10) return parseFloat((1.01 + Math.random() * 0.15).toFixed(2)); // instant crash
    if (rand < 0.55) return parseFloat((1.20 + Math.random() * 1.8).toFixed(2)); // 1.20 - 3.00
    if (rand < 0.85) return parseFloat((3.00 + Math.random() * 4.0).toFixed(2)); // 3.00 - 7.00
    if (rand < 0.96) return parseFloat((7.00 + Math.random() * 10.0).toFixed(2)); // 7.00 - 17.00
    return parseFloat((20.0 + Math.random() * 50.0).toFixed(2)); // mega 20x - 70x
  };

  // Main game loop coordinator
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === 'betting') {
      generateBotBets();
      setHasCashedOut(false);
      setWonAmount(0);
      setMultiplier(1.00);

      let count = 5;
      setCountdown(count);
      timer = setInterval(() => {
        count -= 1;
        setCountdown(count);
        sounds.playTick();
        if (count <= 0) {
          clearInterval(timer);
          // Start flight
          const target = getNextCrash();
          setCrashPoint(target);
          setGameState('flying');
          flightStartTimeRef.current = performance.now();
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  // Flight animation & multiplier update (Gently slowed down as requested: "speed kafi taz ha slo slo kar do")
  useEffect(() => {
    if (gameState !== 'flying') return;

    let isFlying = true;

    const updateFlight = (time: number) => {
      if (!isFlying) return;
      const elapsed = (time - flightStartTimeRef.current) / 1000; // in seconds

      // ULTRA SLOW, SMOOTH SPEED CALCULATION:
      // Multiplier rises very gently: takes ~15-20s to cross 2.0x, giving plenty of tension and reaction time
      const rate = 0.035; 
      const currentMulti = parseFloat(Math.max(1.00, Math.exp(elapsed * rate) + (elapsed * 0.02)).toFixed(2));

      setMultiplier(currentMulti);

      // Check auto cashout for user
      if (
        hasBet &&
        !hasCashedOut &&
        autoCashoutEnabled &&
        autoCashoutMultiplier > 1.01 &&
        currentMulti >= autoCashoutMultiplier
      ) {
        handleCashout(autoCashoutMultiplier);
      }

      // Check bot cashouts
      setActiveBots((prevBots) =>
        prevBots.map((bot) => {
          if (!bot.cashedOut && currentMulti >= bot.cashoutAt && bot.cashoutAt <= crashPoint) {
            return { ...bot, cashedOut: true };
          }
          return bot;
        })
      );

      // Check crash condition
      if (currentMulti >= crashPoint) {
        isFlying = false;
        sounds.playCrash();
        setGameState('crashed');
        setMultiplier(crashPoint);
        setHistory((prev) => [crashPoint, ...prev.slice(0, 9)]);
        setHasBet(false);

        // Schedule next round
        setTimeout(() => {
          setGameState('betting');
        }, 3200);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(updateFlight);
    };

    animationFrameRef.current = requestAnimationFrame(updateFlight);

    return () => {
      isFlying = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, crashPoint, hasBet, hasCashedOut, autoCashoutEnabled, autoCashoutMultiplier]);

  // Canvas drawing for smooth curve & plane
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 30; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (gameState === 'flying' || gameState === 'crashed') {
      const progress = Math.min(1, (multiplier - 1) / (Math.max(crashPoint, 5) - 1));
      const endX = 40 + progress * (width - 120);
      const endY = height - 30 - Math.pow(progress, 0.85) * (height - 90);

      // Trajectory curve
      ctx.beginPath();
      ctx.moveTo(30, height - 30);
      ctx.quadraticCurveTo(30 + (endX - 30) * 0.4, height - 30, endX, endY);

      if (gameState === 'crashed') {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      } else {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.9)';
      }
      ctx.lineWidth = 4;
      ctx.stroke();

      // Gradient under curve
      ctx.lineTo(endX, height - 30);
      ctx.lineTo(30, height - 30);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, endY, 0, height - 30);
      grad.addColorStop(0, gameState === 'crashed' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(244, 63, 94, 0.3)');
      grad.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw Airplane SVG representation
      if (gameState === 'flying') {
        ctx.save();
        ctx.translate(endX, endY);
        // Tilt plane upward
        ctx.rotate(-0.15 - progress * 0.1);

        // Plane Body (Red Aviator jet)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cockpit window
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.ellipse(8, -2, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(-12, -14);
        ctx.lineTo(-2, -14);
        ctx.lineTo(6, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(-12, 14);
        ctx.lineTo(-2, 14);
        ctx.lineTo(6, 0);
        ctx.closePath();
        ctx.fill();

        // Propeller blur
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(20, -10, 2, 20);

        ctx.restore();
      }
    }
  }, [gameState, multiplier, crashPoint]);

  // Place Bet
  const handlePlaceBet = () => {
    if (!currentUser) return;
    if (currentUser.balance < betAmount) {
      setShowDepositModal(true);
      return;
    }
    if (betAmount < 1 || betAmount > 100000) return;

    updateBalance(-betAmount);
    sounds.playChip();
    setHasBet(true);
    setHasCashedOut(false);
  };

  // Cashout
  const handleCashout = (targetMulti?: number) => {
    if (!hasBet || hasCashedOut || gameState !== 'flying') return;
    const multiToUse = targetMulti || multiplier;
    const win = Math.floor(betAmount * multiToUse);

    setWonAmount(win);
    setHasCashedOut(true);
    updateBalance(win);
    sounds.playCashout();
    sounds.playWin();

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#0a0d1f] text-white flex flex-col pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0e142c] border-b border-cyan-500/20">
        <button
          onClick={onBack}
          className="p-1.5 rounded-xl bg-slate-800 text-gray-300 hover:text-white flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ur' ? 'واپس' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400">
            ✈️
          </div>
          <div>
            <h1 className="text-sm font-black text-white font-mono tracking-wider">AVIATOR S999</h1>
            <span className="text-[9px] text-emerald-400 font-bold block -mt-0.5">سلو سپیڈ موڈ آن</span>
          </div>
        </div>

        <div className="bg-[#141b36] px-2.5 py-1 rounded-xl border border-cyan-500/30 text-right">
          <span className="text-[9px] text-gray-400 block leading-none">بیلنس</span>
          <span className="text-xs font-black text-cyan-300 font-mono">
            Rs {currentUser?.balance.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>

      {/* History Ribbon */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#080b18] overflow-x-auto no-scrollbar border-b border-slate-800">
        <span className="text-[9px] text-gray-500 font-bold uppercase shrink-0">ہسٹری:</span>
        {history.map((h, i) => (
          <span
            key={i}
            className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono shrink-0 shadow-sm ${
              h >= 10
                ? 'bg-amber-400 text-black font-extrabold animate-pulse'
                : h >= 2.0
                ? 'bg-purple-900/80 text-purple-200 border border-purple-500/40'
                : 'bg-blue-950/80 text-cyan-300 border border-blue-500/30'
            }`}
          >
            {h.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* Canvas Flying Arena */}
      <div className="relative mx-3 mt-2 bg-gradient-to-b from-[#10132b] to-[#070916] rounded-2xl border border-red-500/30 overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={380}
          height={210}
          className="w-full h-[210px] block"
        />

        {/* Central Multiplier Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {gameState === 'betting' && (
            <div className="flex flex-col items-center animate-pulse">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                اگلا راؤنڈ شروع ہو رہا ہے
              </span>
              <span className="text-4xl font-black text-amber-400 font-mono mt-1">
                {countdown}s
              </span>
              <span className="text-[10px] text-cyan-300 mt-1">
                تیار ہو جائیں!
              </span>
            </div>
          )}

          {gameState === 'flying' && (
            <div className="flex flex-col items-center">
              <span className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]">
                {multiplier.toFixed(2)}x
              </span>
              <span className="text-[10px] text-rose-300/80 font-bold mt-1 tracking-wider uppercase">
                سلو فلائنگ جاری ہے...
              </span>
            </div>
          )}

          {gameState === 'crashed' && (
            <div className="flex flex-col items-center animate-bounce">
              <span className="text-sm font-black text-red-400 uppercase tracking-widest">
                اڑ گیا! FLEW AWAY
              </span>
              <span className="text-4xl font-black text-red-500 font-mono mt-0.5">
                {multiplier.toFixed(2)}x
              </span>
            </div>
          )}
        </div>

        {/* User Win Overlay Notification */}
        {hasCashedOut && wonAmount > 0 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1.5 rounded-full font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/50 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>جیت گئے! Rs {wonAmount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Betting Controls Box */}
      <div className="px-3 mt-3">
        <div className="bg-[#0f1530] border border-cyan-500/30 rounded-2xl p-3 shadow-xl">
          {/* Auto Cashout Controls Bar (User requested feature!) */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoCashoutToggle"
                checked={autoCashoutEnabled}
                onChange={(e) => setAutoCashoutEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <label htmlFor="autoCashoutToggle" className="text-xs font-bold text-gray-200 cursor-pointer">
                آٹو کیش آؤٹ (Auto Cashout)
              </label>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400">ہدف:</span>
              <div className="flex items-center bg-[#172044] rounded-lg border border-cyan-500/40 px-2 py-0.5">
                <input
                  type="number"
                  step="0.1"
                  min="1.1"
                  max="100"
                  value={autoCashoutMultiplier}
                  onChange={(e) => setAutoCashoutMultiplier(parseFloat(e.target.value) || 1.5)}
                  disabled={!autoCashoutEnabled}
                  className="w-12 bg-transparent text-xs font-mono font-black text-amber-300 text-center outline-none disabled:opacity-40"
                />
                <span className="text-[10px] text-gray-400 font-bold">x</span>
              </div>
            </div>
          </div>

          {/* Quick Bet Buttons (1 Rs to 100,000 Rs range) */}
          <div className="flex items-center justify-between gap-1 mb-2">
            {[1, 10, 50, 100, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => setBetAmount(amt)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                  betAmount === amt
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'bg-[#182142] text-gray-300 hover:bg-[#202c58]'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>

          {/* Bet Input & Main Action Button */}
          <div className="grid grid-cols-2 gap-2">
            {/* Input adjustment */}
            <div className="bg-[#141b38] rounded-xl border border-slate-700 p-2 flex flex-col justify-between">
              <span className="text-[10px] text-gray-400">شرط رقم (1 - 100,000 Rs)</span>
              <div className="flex items-center justify-between mt-1">
                <button
                  onClick={() => setBetAmount((prev) => Math.max(1, prev - 10))}
                  disabled={hasBet && gameState === 'flying'}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-gray-200 font-bold flex items-center justify-center hover:bg-slate-700"
                >
                  -
                </button>
                <div className="flex items-center gap-1 font-mono font-black text-base text-white">
                  <span>Rs</span>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.min(100000, Math.max(1, parseInt(e.target.value) || 1)))}
                    disabled={hasBet && gameState === 'flying'}
                    className="w-16 bg-transparent text-center font-bold outline-none"
                  />
                </div>
                <button
                  onClick={() => setBetAmount((prev) => Math.min(100000, prev + 10))}
                  disabled={hasBet && gameState === 'flying'}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-gray-200 font-bold flex items-center justify-center hover:bg-slate-700"
                >
                  +
                </button>
              </div>
            </div>

            {/* Bet or Cashout Big Button */}
            {gameState === 'flying' && hasBet && !hasCashedOut ? (
              <button
                onClick={() => handleCashout()}
                className="py-3 px-2 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-black font-black text-xs sm:text-sm flex flex-col items-center justify-center shadow-lg shadow-emerald-500/40 active:scale-95 animate-pulse"
              >
                <span>کیش آؤٹ (Cash Out)</span>
                <span className="text-sm font-mono mt-0.5">
                  Rs {(betAmount * multiplier).toFixed(0)} ({multiplier.toFixed(2)}x)
                </span>
              </button>
            ) : hasBet ? (
              <button
                disabled
                className="py-3 px-2 rounded-xl bg-amber-600/50 border border-amber-500/60 text-amber-200 font-black text-xs flex flex-col items-center justify-center cursor-not-allowed"
              >
                <span>شرط لگ چکی ہے</span>
                <span className="text-[10px] text-gray-300">پرواز کا انتظار کریں...</span>
              </button>
            ) : (
              <button
                onClick={handlePlaceBet}
                className="py-3 px-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm flex flex-col items-center justify-center shadow-lg shadow-red-600/30 active:scale-95"
              >
                <span>شرط لگائیں (BET)</span>
                <span className="text-xs font-mono mt-0.5 text-amber-300">
                  Rs {betAmount}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Bots / Active Players Table (User requested fake members all time playing) */}
      <div className="px-3 mt-3 flex-1">
        <div className="bg-[#0e142e] border border-cyan-500/20 rounded-2xl p-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-extrabold text-white">لائیو کھلاڑی (Active Players)</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {activeBots.length + 120} آن لائن
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {/* Show user bet if placed */}
            {hasBet && (
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-black font-black text-[10px] flex items-center justify-center">
                    YOU
                  </div>
                  <span className="font-bold text-emerald-300">{currentUser?.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-gray-300">Rs {betAmount}</span>
                  {hasCashedOut ? (
                    <span className="text-emerald-400 font-bold">
                      Rs {wonAmount} ({multiplier.toFixed(2)}x)
                    </span>
                  ) : (
                    <span className="text-amber-400">کھیل رہے ہیں...</span>
                  )}
                </div>
              </div>
            )}

            {/* Bots betting in real time */}
            {activeBots.map((bot) => (
              <div
                key={bot.id}
                className="flex items-center justify-between p-1.5 rounded-lg bg-[#141b3a] border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <img src={bot.avatar} alt="bot" className="w-6 h-6 rounded-full object-cover" />
                  <span className="font-medium text-gray-300 text-[11px]">{bot.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-gray-400">Rs {bot.bet}</span>
                  {bot.cashedOut ? (
                    <span className="text-emerald-400 font-black">
                      +{Math.floor(bot.bet * bot.cashoutAt)} ({bot.cashoutAt.toFixed(2)}x)
                    </span>
                  ) : gameState === 'crashed' ? (
                    <span className="text-red-400 font-medium">-</span>
                  ) : (
                    <span className="text-cyan-400">کھیل میں...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
