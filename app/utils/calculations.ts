import { Trade } from '../types';

export function calcPnL(entry: number, exit: number, lotSize: number, direction: 'BUY' | 'SELL'): number {
  const diff = direction === 'BUY' ? exit - entry : entry - exit;
  return parseFloat((diff * lotSize).toFixed(2));
}

export function calcWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const wins = trades.filter(t => t.outcome === 'win').length;
  return Math.round((wins / trades.length) * 100);
}

export function calcTotalPnL(trades: Trade[]): number {
  return parseFloat(trades.reduce((sum, t) => sum + t.pnl, 0).toFixed(2));
}

export function calcStreak(trades: Trade[]): { win: number; loss: number } {
  if (trades.length === 0) return { win: 0, loss: 0 };
  const sorted = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let winStreak = 0;
  let lossStreak = 0;
  let maxWin = 0;
  let maxLoss = 0;
  let currentWin = 0;
  let currentLoss = 0;
  for (const t of sorted) {
    if (t.outcome === 'win') {
      currentWin++;
      currentLoss = 0;
    } else if (t.outcome === 'loss') {
      currentLoss++;
      currentWin = 0;
    } else {
      currentWin = 0;
      currentLoss = 0;
    }
    maxWin = Math.max(maxWin, currentWin);
    maxLoss = Math.max(maxLoss, currentLoss);
  }
  return { win: maxWin, loss: maxLoss };
}

export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}R${formatted}`;
}

export function calcXPForLevel(level: string): number {
  switch (level) {
    case 'beginner': return 100;
    case 'intermediate': return 500;
    case 'advanced': return 1500;
    case 'master': return 5000;
    default: return 100;
  }
}

export function calcNextLevel(level: string): string {
  switch (level) {
    case 'beginner': return 'intermediate';
    case 'intermediate': return 'advanced';
    case 'advanced': return 'master';
    default: return 'master';
  }
}

export function calcHabitCompletion(habitsCompleted: string[], totalHabits: number): number {
  if (totalHabits === 0) return 0;
  return Math.round((habitsCompleted.length / totalHabits) * 100);
}
