import React from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Flame, Users, Sparkles, TrendingUp, ChevronLeft } from 'lucide-react';

export const ActivityView: React.FC = () => {
  const { liveWinners, botMembers, setCurrentGame, setActiveTab } = useApp();

  const leaderboards = [
    { rank: 1, name: 'Malik_Shah', amount: 184500, game: 'Roulette 9X', avatar: botMembers[1].avatar },
    { rank: 2, name: 'Khan_King786', amount: 122000, game: 'Aviator', avatar: botMembers[3].avatar },
    { rank: 3, name: '0321***443', amount: 98000, game: 'Dragon Tiger', avatar: botMembers[4].avatar },
    { rank: 4, name: 'Rana_Sahab', amount: 76500, game: 'Wingo 30s', avatar: botMembers[5].avatar },
    { rank: 5, name: 'Usman_Lahori', amount: 64000, game: 'Aviator', avatar: botMembers[6].avatar },
  ];

  return (
    <div className="max-w-md mx-auto p-3 pb-24 space-y-3">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('games')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-gray-200 hover:text-white text-xs font-bold active:scale-95 transition-all shadow-sm"
          title="واپس گیمز"
        >
          <ChevronLeft className="w-5 h-5 text-cyan-400 stroke-[2.5]" />
          <span>← واپس گیمز (Back)</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-white">سرگرمی اور لائیو کھلاڑی (Live Feed)</h2>
          <p className="text-[10px] text-gray-400">24/7 فعال کھلاڑیوں کے لائیو نتائج</p>
        </div>
      </div>

      {/* Top 3 High Rollers Podium */}
      <div className="p-4 rounded-3xl bg-gradient-to-b from-[#182149] to-[#0d132e] border border-cyan-500/30 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-amber-300 flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            آج کے سب سے بڑے فاتح (Top Winners)
          </span>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
            لائیو اپ ڈیٹ
          </span>
        </div>

        <div className="space-y-2">
          {leaderboards.map((item) => (
            <div
              key={item.rank}
              className="p-2.5 rounded-2xl bg-[#121838] border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-xl font-black text-xs flex items-center justify-center ${
                  item.rank === 1 ? 'bg-amber-400 text-black shadow-md' : item.rank === 2 ? 'bg-slate-300 text-black' : item.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-gray-400'
                }`}>
                  {item.rank}
                </span>
                <img src={item.avatar} alt="bot" className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <span className="font-extrabold text-white block leading-tight">{item.name}</span>
                  <span className="text-[10px] text-gray-400">{item.game}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-black text-sm text-emerald-400 block leading-tight">
                  +Rs {item.amount.toLocaleString()}
                </span>
                <span className="text-[9px] text-gray-500">مجموعی جیت</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time winning stream */}
      <div className="p-3.5 rounded-3xl bg-[#0f1430] border border-cyan-500/20">
        <span className="text-xs font-extrabold text-white block mb-2">
          🔴 لائیو جیتنے والوں کی لسٹ (24/7 Running)
        </span>
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {liveWinners.map((w) => (
            <div
              key={w.id}
              className="p-2 rounded-xl bg-[#141b3a] flex items-center justify-between text-xs animate-fade-in"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-bold text-gray-200">{w.userName}</span>
                <span className="text-[10px] text-gray-400">({w.game})</span>
              </div>

              <span className="font-mono font-black text-cyan-300">
                Rs {w.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
