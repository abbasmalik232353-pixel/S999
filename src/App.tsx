import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BannerCarousel } from './components/BannerCarousel';
import { MarqueeTicker } from './components/MarqueeTicker';
import { GameCategories } from './components/GameCategories';
import { BottomNav } from './components/BottomNav';
import { FloatingWidgets } from './components/FloatingWidgets';
import { PromotionsView } from './components/PromotionsView';
import { ActivityView } from './components/ActivityView';
import { AccountView } from './components/AccountView';
import { DepositWithdrawModal } from './components/DepositWithdrawModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';

import { AviatorGame } from './components/games/AviatorGame';
import { RouletteGame } from './components/games/RouletteGame';
import { WingoGame } from './components/games/WingoGame';
import { DragonTigerGame } from './components/games/DragonTigerGame';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentGame,
    setCurrentGame,
    showDepositModal,
    setShowDepositModal,
    showWithdrawModal,
    setShowWithdrawModal,
    showAdminPanel,
    setShowAdminPanel,
    showAuthModal,
    setShowAuthModal,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#090d1f] text-white flex flex-col font-sans select-none antialiased">
      {/* Top Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {/* If inside an active game */}
        {currentGame === 'aviator' && (
          <AviatorGame onBack={() => setCurrentGame(null)} />
        )}
        {currentGame === 'roulette' && (
          <RouletteGame onBack={() => setCurrentGame(null)} />
        )}
        {currentGame === 'wingo' && (
          <WingoGame onBack={() => setCurrentGame(null)} />
        )}
        {currentGame === 'dragon_tiger' && (
          <DragonTigerGame onBack={() => setCurrentGame(null)} />
        )}

        {/* If in main tabs view */}
        {!currentGame && (
          <>
            {activeTab === 'games' && (
              <>
                <BannerCarousel onGameSelect={(game) => setCurrentGame(game)} />
                <MarqueeTicker />
                <GameCategories onSelectGame={(game) => setCurrentGame(game)} />
                <FloatingWidgets />
              </>
            )}

            {activeTab === 'promotions' && <PromotionsView />}
            {activeTab === 'activity' && <ActivityView />}
            {activeTab === 'invite' && <AccountView />}
            {activeTab === 'support' && (
              <div className="p-3">
                <FloatingWidgets />
                <AccountView />
              </div>
            )}
            {activeTab === 'wallet' && (
              <DepositWithdrawModal
                initialTab="deposit"
                onClose={() => setActiveTab('games')}
              />
            )}
            {activeTab === 'account' && <AccountView />}
          </>
        )}
      </main>

      {/* Fixed Bottom Navigation (Only visible when not playing inside a game full-screen) */}
      {!currentGame && <BottomNav />}

      {/* Popups & Modals */}
      {showDepositModal && (
        <DepositWithdrawModal
          initialTab="deposit"
          onClose={() => {
            setShowDepositModal(false);
            if (activeTab === 'wallet') setActiveTab('games');
          }}
        />
      )}

      {showWithdrawModal && (
        <DepositWithdrawModal
          initialTab="withdraw"
          onClose={() => {
            setShowWithdrawModal(false);
            if (activeTab === 'wallet') setActiveTab('games');
          }}
        />
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
