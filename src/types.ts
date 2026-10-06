export interface User {
  phone: string;
  name: string;
  balance: number;
  isAdmin: boolean;
  avatar: string;
  createdAt: string;
  userId?: string;
  unclaimedCommission?: number;
  subordinatesCount?: string;
  yesterdayPerformance?: number;
}

export type TransactionType = 'deposit' | 'withdraw';
export type PaymentMethod = 'easypaisa' | 'jazzcash' | 'bank';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface Transaction {
  id: string;
  userPhone: string;
  userName: string;
  type: TransactionType;
  amount: number;
  method: PaymentMethod;
  accountTitle: string;
  accountNumber: string;
  transactionId?: string; // TID for deposit
  status: TransactionStatus;
  timestamp: number;
  adminNote?: string;
}

export interface GameBet {
  id: string;
  userPhone: string;
  userName: string;
  game: 'aviator' | 'wingo' | 'dragon_tiger' | 'roulette';
  betAmount: number;
  winAmount: number;
  multiplier: number;
  outcome: string;
  timestamp: number;
  isBot?: boolean;
}

export interface AdminControls {
  aviatorNextCrash: number | null;
  wingoNextNumber: number | null;
  dragonTigerNextWinner: 'dragon' | 'tiger' | 'tie' | null;
  rouletteNextNumber: number | null;
  botsEnabled: boolean;
  botIntensity: 'low' | 'medium' | 'high';
}

export interface LiveWinnerFeed {
  id: string;
  userName: string;
  game: string;
  amount: number;
  avatar: string;
}
