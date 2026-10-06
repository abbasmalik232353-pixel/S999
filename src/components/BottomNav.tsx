import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Gift, Users, Headphones, User as UserIcon } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentGame, setCurrentGame } = useApp();

  const handleTabClick = (tab: 'games' | 'promotions' | 'invite' | 'support' | 'account') => {
    if (currentGame) {
      setCurrentGame(null);
    }
    setActiveTab(tab);
  };

  const navItems = [
    {
      id: 'games' as const,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'promotions' as const,
      label: 'Promo',
      icon: Gift,
      badge: '11',
    },
    {
      id: 'invite' as const,
      label: 'Invite',
      icon: Users,
    },
    {
      id: 'support' as const,
      label: 'Support',
      icon: Headphones,
    },
    {
      id: 'account' as const,
      label: 'Profile',
      icon: UserIcon,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#111216] border-t border-slate-800/80 px-2 py-2 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = (activeTab === item.id || (item.id === 'games' && activeTab === 'wallet')) && !currentGame;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 relative transition-all active:scale-95 ${
                isActive ? 'text-pink-500 scale-105' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white font-bold text-[9px] px-1 rounded-full scale-90">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-pink-500 font-extrabold' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
