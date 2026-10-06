import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Flame, Trophy, Gift, ArrowRight } from 'lucide-react';

export const BannerCarousel: React.FC<{ onGameSelect: (game: 'aviator' | 'roulette' | 'wingo' | 'dragon_tiger') => void }> = ({ onGameSelect }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'DAILY SLOTS & CRASH',
      subtitle: 'TREASURE CHEST',
      highlight: 'CRASH 99.99x',
      badge: 'S999 MEGA JACKPOT',
      desc: 'کھیلیں اور 100,000 روپے تک جیتیں ہر روز',
      bg: 'from-purple-900 via-indigo-950 to-blue-900',
      actionGame: 'aviator' as const,
      accent: 'border-amber-400/50 shadow-amber-500/20',
      tagColor: 'bg-amber-500 text-black',
    },
    {
      title: 'AVIATOR S999 CRASH',
      subtitle: 'SMOOTH FLIGHT & AUTO CASHOUT',
      highlight: 'SLO FLYING 100x',
      badge: 'NEW SLOW SPEED',
      desc: 'سپیڈ سلو اور آٹو کیش آؤٹ فیچر کے ساتھ',
      bg: 'from-rose-950 via-red-900 to-indigo-950',
      actionGame: 'aviator' as const,
      accent: 'border-red-400/50 shadow-red-500/20',
      tagColor: 'bg-red-500 text-white',
    },
    {
      title: 'ROULETTE NUMBER BOARD',
      subtitle: '9X ON NUMBERS & 2X RED/BLACK',
      highlight: '9.00x PAYOUT',
      badge: 'SPECIAL 9X BOARD',
      desc: 'کسی بھی نمبر پر شرط لگائیں اور 9 گنا پائیں',
      bg: 'from-emerald-950 via-teal-950 to-blue-950',
      actionGame: 'roulette' as const,
      accent: 'border-emerald-400/50 shadow-emerald-500/20',
      tagColor: 'bg-emerald-400 text-black',
    },
    {
      title: 'WINGO & DRAGON TIGER',
      subtitle: 'INSTANT CASHOUT 24/7',
      highlight: 'MIN 500 PKR',
      badge: 'FAST WITHDRAWAL',
      desc: 'EasyPaisa اور JazzCash سے فوری ڈپازٹ و ودڈرا',
      bg: 'from-amber-950 via-yellow-950 to-slate-900',
      actionGame: 'wingo' as const,
      accent: 'border-amber-400/50 shadow-amber-500/20',
      tagColor: 'bg-yellow-400 text-black',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="relative px-3 pt-2">
      <div
        onClick={() => onGameSelect(slide.actionGame)}
        className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-500 bg-gradient-to-r ${slide.bg} border ${slide.accent} shadow-xl`}
      >
        {/* Glow and particle decorative elements */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${slide.tagColor} shadow-md tracking-wider flex items-center gap-1`}>
              <Sparkles className="w-3 h-3" />
              {slide.badge}
            </span>
            <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
              <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="text-[11px] font-black text-amber-300 font-mono">
                {slide.highlight}
              </span>
            </div>
          </div>

          <div className="my-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md">
              {slide.title}
            </h2>
            <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-100 flex items-center gap-1.5">
              <span>{slide.subtitle}</span>
            </div>
            <p className="text-[11px] text-gray-300/90 mt-0.5">
              {slide.desc}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-cyan-300 font-medium flex items-center gap-1">
              ابھی کھیلیں <ArrowRight className="w-3 h-3 text-cyan-400" />
            </span>
            <div className="flex items-center gap-1 text-[9px] text-gray-400 bg-black/30 px-2 py-0.5 rounded">
              <span>S999 تصدیق شدہ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentSlide ? 'w-5 bg-cyan-400' : 'w-1.5 bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
