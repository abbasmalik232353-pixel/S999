import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Sparkles, Plane, CircleDot, Swords, Award, Users, ChevronRight, Play } from 'lucide-react';

interface GameCategoriesProps {
  onSelectGame: (game: 'aviator' | 'roulette' | 'wingo' | 'dragon_tiger') => void;
}

export const GameCategories: React.FC<GameCategoriesProps> = ({ onSelectGame }) => {
  const { language } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hot' | 'mini' | 'lottery' | 'board'>('all');

  const categories = [
    {
      id: 'hot',
      nameUrdu: 'گرم گیمز',
      nameEn: 'Hot Games',
      icon: '🔥',
      color: 'from-amber-500/20 to-red-500/20 border-amber-500/40 text-amber-300',
    },
    {
      id: 'mini',
      nameUrdu: 'منی گیمز',
      nameEn: 'Mini Games',
      icon: '✈️',
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300',
    },
    {
      id: 'lottery',
      nameUrdu: 'لاٹری',
      nameEn: 'Lottery',
      icon: '🎱',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300',
    },
    {
      id: 'board',
      nameUrdu: 'رولٹ بورڈ',
      nameEn: 'Roulette Board',
      icon: '🎡',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
    },
  ];

  const gamesList = [
    {
      id: 'aviator' as const,
      name: 'Aviator S999',
      urduName: 'ایوی ایٹر',
      tagline: 'سلو فلائنگ & آٹو کیش آؤٹ',
      winRate: '97.38%',
      activePlayers: 1482,
      category: 'mini',
      bgGradient: 'from-rose-950/90 via-red-900/60 to-[#120a1c]',
      borderColor: 'border-red-500/30 hover:border-red-500',
      accentColor: 'text-rose-400',
      badgeBg: 'bg-emerald-500/90 text-black',
      iconBadge: '✈️',
      specialPill: 'سلو سپیڈ',
    },
    {
      id: 'roulette' as const,
      name: 'Roulette Board',
      urduName: 'رولٹ بورڈ گیم',
      tagline: 'نمبر پر 9X پے آؤٹ - ریڈ/بلیک 2X',
      winRate: '97.50%',
      activePlayers: 940,
      category: 'board',
      bgGradient: 'from-emerald-950/90 via-teal-900/60 to-[#0a1816]',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500',
      accentColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/90 text-black',
      iconBadge: '🎡',
      specialPill: '9X نمبرنگ',
    },
    {
      id: 'wingo' as const,
      name: 'Wingo Lottery',
      urduName: 'ون گو لاٹری',
      tagline: '1 منٹ راؤنڈ - گرین، ریڈ، وائلٹ',
      winRate: '96.66%',
      activePlayers: 2130,
      category: 'lottery',
      bgGradient: 'from-purple-950/90 via-indigo-900/60 to-[#150d24]',
      borderColor: 'border-purple-500/30 hover:border-purple-500',
      accentColor: 'text-purple-400',
      badgeBg: 'bg-emerald-500/90 text-black',
      iconBadge: '🎱',
      specialPill: 'فوری رزلٹ',
    },
    {
      id: 'dragon_tiger' as const,
      name: 'Dragon Tiger',
      urduName: 'ڈریگن ٹائیگر',
      tagline: '2X پے آؤٹ - کارڈ فلپ لائیو',
      winRate: '98.10%',
      activePlayers: 1820,
      category: 'mini',
      bgGradient: 'from-amber-950/90 via-orange-900/60 to-[#1e1108]',
      borderColor: 'border-amber-500/30 hover:border-amber-500',
      accentColor: 'text-amber-400',
      badgeBg: 'bg-emerald-500/90 text-black',
      iconBadge: '🐉',
      specialPill: 'فاسٹ کارڈز',
    },
  ];

  const filteredGames = selectedCategory === 'all'
    ? gamesList
    : selectedCategory === 'hot'
    ? gamesList
    : gamesList.filter((g) => g.category === selectedCategory);

  return (
    <div className="px-3 pb-24">
      {/* Category Icons Row (Exact structure as screenshot) */}
      <div className="grid grid-cols-4 gap-2 my-3">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id as any)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? 'bg-[#1a2347] border-cyan-400 shadow-md shadow-cyan-500/20 scale-105'
                  : 'bg-[#10152e] border-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-slate-700/60 to-slate-900/90 border border-amber-400/30 flex items-center justify-center text-2xl shadow-inner mb-1.5 relative group">
                <span>{cat.icon}</span>
                {isSelected && (
                  <span className="absolute -bottom-0.5 w-2 h-2 rounded-full bg-cyan-400"></span>
                )}
              </div>
              <span className="text-[11px] font-bold text-gray-200 text-center leading-tight">
                {language === 'ur' ? cat.nameUrdu : cat.nameEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recommended Games Header Section (Matches Screenshot) */}
      <div className="mt-4 mb-3">
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-400 to-emerald-400" />
          <h2 className="text-base font-extrabold text-white tracking-wide">
            {language === 'ur' ? 'تجویز کردہ گیمز' : 'Recommended Games'}
          </h2>
        </div>
        <p className="text-[10px] text-gray-400">
          {language === 'ur'
            ? 'کھلاڑیوں کے درمیان سب سے زیادہ مقبول الیکٹرانک گیمز'
            : 'Most popular electronic games among active players'}
        </p>
      </div>

      {/* Games Cards Grid (2 columns on mobile, matching visual preview) */}
      <div className="grid grid-cols-2 gap-2.5">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-b ${game.bgGradient} border ${game.borderColor} p-3 cursor-pointer shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex flex-col justify-between min-h-[160px]`}
          >
            {/* Top pill tags */}
            <div className="flex items-center justify-between w-full">
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-black/50 border border-white/10 text-white flex items-center gap-1">
                <span>{game.iconBadge}</span>
                <span>{game.specialPill}</span>
              </span>
              <div className="flex items-center gap-1 text-[9px] text-gray-300 bg-black/40 px-1.5 py-0.5 rounded-md">
                <Users className="w-2.5 h-2.5 text-cyan-400" />
                <span className="font-mono">{game.activePlayers}</span>
              </div>
            </div>

            {/* Center Visual Art Display */}
            <div className="my-2 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform">
                {game.iconBadge}
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white mt-1 group-hover:text-cyan-300 transition-colors">
                {game.name}
              </h3>
              <p className="text-[10px] text-gray-300 line-clamp-1">
                {language === 'ur' ? game.urduName : game.tagline}
              </p>
            </div>

            {/* Bottom Win Rate Badge (Matching screenshot green bar) */}
            <div className="w-full">
              <div className={`w-full py-1 px-2 rounded-lg ${game.badgeBg} flex items-center justify-between shadow-md`}>
                <span className="text-[10px] font-black font-mono">
                  {game.winRate}
                </span>
                <span className="text-[9px] font-bold">
                  {language === 'ur' ? 'جیتنے کے' : 'Win Rate'}
                </span>
              </div>
            </div>

            {/* Play Button Overlay on hover */}
            <div className="absolute inset-0 bg-cyan-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-400/40">
                <Play className="w-5 h-5 fill-black ml-0.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
