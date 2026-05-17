import { format, differenceInDays, parseISO, getDayOfYear } from 'date-fns';

export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDisplayDate(date: string): string {
  return format(parseISO(date), 'EEEE, d MMMM yyyy');
}

export function formatShortDate(date: string): string {
  return format(parseISO(date), 'd MMM yyyy');
}

export function formatTime(date: string): string {
  return format(parseISO(date), 'HH:mm');
}

export function daysSince(dateStr: string): number {
  if (!dateStr) return 999;
  try {
    return differenceInDays(new Date(), parseISO(dateStr));
  } catch {
    return 999;
  }
}

export function daysSinceLabel(dateStr: string): string {
  const days = daysSince(dateStr);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getVerseIndex(versesLength: number): number {
  const dayOfYear = getDayOfYear(new Date());
  return dayOfYear % versesLength;
}

export function getMonthYear(): string {
  return format(new Date(), 'MMMM yyyy');
}

export function getDaysInMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export function getDayOfMonth(): number {
  return new Date().getDate();
}

export function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return Math.ceil((now.getDate() + start.getDay()) / 7);
}
