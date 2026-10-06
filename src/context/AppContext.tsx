import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Transaction, GameBet, AdminControls, LiveWinnerFeed } from '../types';
import { sounds } from '../utils/audio';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  adminControls: AdminControls;
  soundEnabled: boolean;
  language: 'ur' | 'en';
  activeTab: 'games' | 'promotions' | 'activity' | 'wallet' | 'account' | 'invite' | 'support';
  currentGame: 'aviator' | 'roulette' | 'wingo' | 'dragon_tiger' | null;
  showAdminPanel: boolean;
  showAuthModal: boolean;
  showDepositModal: boolean;
  showWithdrawModal: boolean;
  liveWinners: LiveWinnerFeed[];
  botMembers: { name: string; avatar: string; phone: string }[];
  
  // Actions
  login: (phone: string, pass: string) => { success: boolean; message: string };
  register: (phone: string, pass: string, name: string) => { success: boolean; message: string };
  logout: () => void;
  updateBalance: (delta: number) => void;
  claimCommission: () => { success: boolean; message: string; amount: number };
  requestDeposit: (amount: number, method: 'easypaisa' | 'jazzcash' | 'bank', tid: string, senderPhone: string) => { success: boolean; message: string };
  requestWithdraw: (amount: number, method: 'easypaisa' | 'jazzcash' | 'bank', title: string, accNum: string) => { success: boolean; message: string };
  
  // Admin actions
  approveTransaction: (id: string) => void;
  rejectTransaction: (id: string, note?: string) => void;
  updateAdminControls: (controls: Partial<AdminControls>) => void;
  adminAdjustBalance: (userPhone: string, newBalance: number) => void;
  
  // UI setters
  setSoundEnabled: (val: boolean) => void;
  setLanguage: (lang: 'ur' | 'en') => void;
  setActiveTab: (tab: 'games' | 'promotions' | 'activity' | 'wallet' | 'account' | 'invite' | 'support') => void;
  setCurrentGame: (game: 'aviator' | 'roulette' | 'wingo' | 'dragon_tiger' | null) => void;
  setShowAdminPanel: (show: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
  setShowDepositModal: (show: boolean) => void;
  setShowWithdrawModal: (show: boolean) => void;
  recordBetHistory: (bet: Omit<GameBet, 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_BOTS = [
  { name: '0301***928', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', phone: '0301***928' },
  { name: 'Malik_Shah', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', phone: '0312***844' },
  { name: '0345***190', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&auto=format&fit=crop&q=80', phone: '0345***190' },
  { name: 'Khan_King786', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', phone: '0333***671' },
  { name: '0321***443', avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&auto=format&fit=crop&q=80', phone: '0321***443' },
  { name: 'Rana_Sahab', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80', phone: '0300***312' },
  { name: 'Usman_Lahori', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', phone: '0315***823' },
  { name: '0308***551', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', phone: '0308***551' },
  { name: 'Chaudhry_786', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', phone: '0344***662' },
  { name: 'Babar_Lucky', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', phone: '0302***901' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize users with Admin and standard demo player
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('s999_users');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        phone: '03217084743',
        name: 'Super Admin (Malik)',
        userId: '146902833',
        balance: 250000,
        isAdmin: true,
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        unclaimedCommission: 1250.00,
        subordinatesCount: '15(4)',
        yesterdayPerformance: 45000.00,
      },
      {
        phone: '03001234567',
        name: 'bobx4743',
        userId: '146902833',
        balance: 2500,
        isAdmin: false,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        unclaimedCommission: 350.00,
        subordinatesCount: '0(0)',
        yesterdayPerformance: 0.00,
      }
    ];
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('s999_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    // Default logged in as VIP Player for quick exploration
    return {
      phone: '03001234567',
      name: 'bobx4743',
      userId: '146902833',
      balance: 2500,
      isAdmin: false,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      unclaimedCommission: 350.00,
      subordinatesCount: '0(0)',
      yesterdayPerformance: 0.00,
    };
  });

  // Transactions list
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('s999_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        id: 'tx_demo_101',
        userPhone: '03001234567',
        userName: 'VIP Player',
        type: 'deposit',
        amount: 1500,
        method: 'easypaisa',
        accountTitle: 'Ali Hassan',
        accountNumber: '03001234567',
        transactionId: 'EP849201948',
        status: 'approved',
        timestamp: Date.now() - 3600000 * 2,
      },
      {
        id: 'tx_demo_102',
        userPhone: '03451122334',
        userName: 'Shahid Khan',
        type: 'deposit',
        amount: 2000,
        method: 'jazzcash',
        accountTitle: 'Shahid Khan',
        accountNumber: '03451122334',
        transactionId: 'JC998231002',
        status: 'pending',
        timestamp: Date.now() - 1000 * 60 * 15,
      },
      {
        id: 'tx_demo_103',
        userPhone: '03129988776',
        userName: 'Hamza Malik',
        type: 'withdraw',
        amount: 1000,
        method: 'easypaisa',
        accountTitle: 'Hamza Malik',
        accountNumber: '03129988776',
        status: 'pending',
        timestamp: Date.now() - 1000 * 60 * 40,
      }
    ];
  });

  // Admin controls
  const [adminControls, setAdminControls] = useState<AdminControls>({
    aviatorNextCrash: null,
    wingoNextNumber: null,
    dragonTigerNextWinner: null,
    rouletteNextNumber: null,
    botsEnabled: true,
    botIntensity: 'high',
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [language, setLanguage] = useState<'ur' | 'en'>('ur');
  const [activeTab, setActiveTab] = useState<'games' | 'promotions' | 'activity' | 'wallet' | 'account' | 'invite' | 'support'>('games');
  const [currentGame, setCurrentGame] = useState<'aviator' | 'roulette' | 'wingo' | 'dragon_tiger' | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);

  // Live winning ticker feed
  const [liveWinners, setLiveWinners] = useState<LiveWinnerFeed[]>([
    { id: '1', userName: '0301***928', game: 'Aviator', amount: 4850, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' },
    { id: '2', userName: 'Malik_Shah', game: 'Roulette', amount: 18000, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80' },
    { id: '3', userName: 'Khan_King786', game: 'Dragon Tiger', amount: 7200, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { id: '4', userName: '0321***443', game: 'Wingo Lottery', amount: 9000, avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&auto=format&fit=crop&q=80' },
  ]);

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem('s999_users', JSON.stringify(users));
  }, [users]);

  // Sync current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('s999_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('s999_current_user');
    }
  }, [currentUser]);

  // Sync transactions to localStorage
  useEffect(() => {
    localStorage.setItem('s999_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    sounds.soundEnabled = val;
  };

  // Bot live activity simulation loop
  useEffect(() => {
    if (!adminControls.botsEnabled) return;
    const interval = setInterval(() => {
      const games = ['Aviator', 'Roulette', 'Wingo Lottery', 'Dragon Tiger'];
      const randomGame = games[Math.floor(Math.random() * games.length)];
      const randomBot = INITIAL_BOTS[Math.floor(Math.random() * INITIAL_BOTS.length)];
      const randomWin = Math.floor(Math.random() * 80 + 3) * 100; // 300 to 8000 PKR

      setLiveWinners((prev) => [
        {
          id: Math.random().toString(),
          userName: randomBot.name,
          game: randomGame,
          amount: randomWin,
          avatar: randomBot.avatar,
        },
        ...prev.slice(0, 7),
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, [adminControls.botsEnabled]);

  // Login handler
  const login = (phone: string, pass: string) => {
    const trimmedPhone = phone.trim();
    // Check for super admin credentials specified by user: 03217084743 / malik1122
    if (trimmedPhone === '03217084743') {
      if (pass === 'malik1122') {
        const adminUser: User = {
          phone: '03217084743',
          name: 'Super Admin (Malik)',
          balance: 250000,
          isAdmin: true,
          avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
        };
        setCurrentUser(adminUser);
        setUsers((prev) => {
          if (!prev.find((u) => u.phone === '03217084743')) return [...prev, adminUser];
          return prev.map((u) => (u.phone === '03217084743' ? { ...u, isAdmin: true } : u));
        });
        return { success: true, message: 'ایڈمن لاگ ان کامیاب! خوش آمدید ملک صاحب' };
      } else {
        return { success: false, message: 'غلط پاس ورڈ! ایڈمن پاس ورڈ درج کریں' };
      }
    }

    // Normal user login
    const existing = users.find((u) => u.phone === trimmedPhone);
    if (existing) {
      // Normal user must NEVER get isAdmin
      const userObj = { ...existing, isAdmin: false };
      setCurrentUser(userObj);
      return { success: true, message: 'لاگ ان کامیاب!' };
    }

    // Auto-create regular user if new
    const newUser: User = {
      phone: trimmedPhone,
      name: `User_${trimmedPhone.slice(-4)}`,
      balance: 1000, // 1000 demo welcome balance
      isAdmin: false,
      avatar: INITIAL_BOTS[Math.floor(Math.random() * INITIAL_BOTS.length)].avatar,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, message: 'نیا اکاؤنٹ بن گیا اور لاگ ان ہو گیا!' };
  };

  // Register handler
  const register = (phone: string, pass: string, name: string) => {
    const trimmedPhone = phone.trim();
    if (trimmedPhone === '03217084743') {
      return login(trimmedPhone, pass);
    }
    const existing = users.find((u) => u.phone === trimmedPhone);
    if (existing) {
      return { success: false, message: 'یہ فون نمبر پہلے سے رجسٹرڈ ہے!' };
    }
    const newUser: User = {
      phone: trimmedPhone,
      name: name.trim() || `User_${trimmedPhone.slice(-4)}`,
      balance: 1000,
      isAdmin: false,
      avatar: INITIAL_BOTS[Math.floor(Math.random() * INITIAL_BOTS.length)].avatar,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, message: 'اکاؤنٹ کامیابی سے رجسٹر ہو گیا!' };
  };

  const logout = () => {
    setCurrentUser(null);
    setShowAdminPanel(false);
  };

  const updateBalance = useCallback((delta: number) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, balance: Math.max(0, prev.balance + delta) };
      setUsers((usersList) =>
        usersList.map((u) => (u.phone === updated.phone ? updated : u))
      );
      return updated;
    });
  }, []);

  const requestDeposit = (amount: number, method: 'easypaisa' | 'jazzcash' | 'bank', tid: string, senderPhone: string) => {
    if (!currentUser) return { success: false, message: 'پہلے لاگ ان کریں' };
    if (amount < 500) {
      return { success: false, message: 'کم از کم ڈپازٹ رقم 500 روپے ہے!' };
    }
    if (!tid || tid.trim().length < 4) {
      return { success: false, message: 'براہ کرم درست ٹرانزیکشن آئی ڈی (TID) درج کریں!' };
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userPhone: currentUser.phone,
      userName: currentUser.name,
      type: 'deposit',
      amount,
      method,
      accountTitle: currentUser.name,
      accountNumber: senderPhone || currentUser.phone,
      transactionId: tid.trim(),
      status: 'pending',
      timestamp: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, message: 'ڈپازٹ کی درخواست بھیج دی گئی۔ ایڈمن کی منظوری کے بعد رقم شامل ہو جائے گی!' };
  };

  const requestWithdraw = (amount: number, method: 'easypaisa' | 'jazzcash' | 'bank', title: string, accNum: string) => {
    if (!currentUser) return { success: false, message: 'پہلے لاگ ان کریں' };
    if (amount < 500) {
      return { success: false, message: 'کم از کم ودڈرا رقم 500 روپے ہے!' };
    }
    if (currentUser.balance < amount) {
      return { success: false, message: 'آپ کے پاس ناکافی بیلنس ہے!' };
    }
    if (!title.trim() || !accNum.trim()) {
      return { success: false, message: 'اکاؤنٹ کا نام اور نمبر درج کریں!' };
    }

    // Deduct balance upfront
    updateBalance(-amount);

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userPhone: currentUser.phone,
      userName: currentUser.name,
      type: 'withdraw',
      amount,
      method,
      accountTitle: title.trim(),
      accountNumber: accNum.trim(),
      status: 'pending',
      timestamp: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, message: 'ودڈرا کی درخواست جمع ہو گئی ہے۔ ایڈمن جلد ہی جائزہ لے گا!' };
  };

  const approveTransaction = (id: string) => {
    if (!currentUser?.isAdmin) return;
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id && tx.status === 'pending') {
          if (tx.type === 'deposit') {
            // Credit to user balance
            setUsers((usersList) =>
              usersList.map((u) => {
                if (u.phone === tx.userPhone) {
                  return { ...u, balance: u.balance + tx.amount };
                }
                return u;
              })
            );
            // If current user is this user
            if (currentUser && currentUser.phone === tx.userPhone) {
              setCurrentUser((prevCurr) => prevCurr ? { ...prevCurr, balance: prevCurr.balance + tx.amount } : null);
            }
          }
          return { ...tx, status: 'approved' };
        }
        return tx;
      })
    );
  };

  const rejectTransaction = (id: string, note?: string) => {
    if (!currentUser?.isAdmin) return;
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id && tx.status === 'pending') {
          // If withdraw was rejected, refund the deducted money back to user!
          if (tx.type === 'withdraw') {
            setUsers((usersList) =>
              usersList.map((u) => {
                if (u.phone === tx.userPhone) {
                  return { ...u, balance: u.balance + tx.amount };
                }
                return u;
              })
            );
            if (currentUser && currentUser.phone === tx.userPhone) {
              setCurrentUser((prevCurr) => prevCurr ? { ...prevCurr, balance: prevCurr.balance + tx.amount } : null);
            }
          }
          return { ...tx, status: 'rejected', adminNote: note || 'رد کر دیا گیا' };
        }
        return tx;
      })
    );
  };

  const updateAdminControls = (controls: Partial<AdminControls>) => {
    setAdminControls((prev) => ({ ...prev, ...controls }));
  };

  const adminAdjustBalance = (userPhone: string, newBalance: number) => {
    if (!currentUser?.isAdmin) return;
    setUsers((prev) =>
      prev.map((u) => (u.phone === userPhone ? { ...u, balance: Math.max(0, newBalance) } : u))
    );
    if (currentUser.phone === userPhone) {
      setCurrentUser((prev) => (prev ? { ...prev, balance: Math.max(0, newBalance) } : null));
    }
  };

  const claimCommission = () => {
    if (!currentUser) return { success: false, message: 'پہلے لاگ ان کریں', amount: 0 };
    const amt = currentUser.unclaimedCommission ?? 350.00;
    if (amt <= 0) {
      return { success: false, message: 'کوئی کمیشن یا پرافٹ باقی نہیں ہے', amount: 0 };
    }
    updateBalance(amt);
    setCurrentUser((prev) => prev ? { ...prev, unclaimedCommission: 0 } : null);
    setUsers((list) => list.map((u) => u.phone === currentUser.phone ? { ...u, unclaimedCommission: 0 } : u));
    sounds.playWin();
    return { success: true, message: `مبارک ہو! Rs ${amt.toFixed(2)} کمیشن پرافٹ اکاؤنٹ میں منتقل ہو گیا!`, amount: amt };
  };

  const recordBetHistory = () => {
    // Record for stats
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        transactions,
        adminControls,
        soundEnabled,
        language,
        activeTab,
        currentGame,
        showAdminPanel,
        showAuthModal,
        showDepositModal,
        showWithdrawModal,
        liveWinners,
        botMembers: INITIAL_BOTS,
        login,
        register,
        logout,
        updateBalance,
        claimCommission,
        requestDeposit,
        requestWithdraw,
        approveTransaction,
        rejectTransaction,
        updateAdminControls,
        adminAdjustBalance,
        setSoundEnabled,
        setLanguage,
        setActiveTab,
        setCurrentGame,
        setShowAdminPanel,
        setShowAuthModal,
        setShowDepositModal,
        setShowWithdrawModal,
        recordBetHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
