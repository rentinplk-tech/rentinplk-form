export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
  status: 'active' | 'reactivating' | 'lifeline' | 'income';
  focus: string;
  tasks: Task[];
  revenue: { income: number; expenses: number };
  notes: string;
  updatedAt: string;
  description: string;
}

export interface Interaction {
  id: string;
  date: string;
  type: 'call' | 'meet' | 'message' | 'prayer' | 'other';
  notes: string;
}

export interface Contact {
  id: string;
  name: string;
  category: 'leader' | 'disciple' | 'family' | 'friend' | 'community' | 'extended';
  phone?: string;
  notes: string;
  goal: string;
  interactions: Interaction[];
  lastContacted: string;
}

export interface Trade {
  id: string;
  date: string;
  instrument: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  pnl: number;
  emotion: string;
  reason: string;
  lesson: string;
  outcome: 'win' | 'loss' | 'breakeven';
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  text: string;
  gratitude: [string, string, string];
  godMoment: string;
}

export interface LearningSession {
  id: string;
  date: string;
  durationMinutes: number;
  topic: string;
  notes: string;
  keyInsight: string;
}

export interface SkillTrack {
  id: string;
  name: string;
  icon: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  xp: number;
  sessions: LearningSession[];
  milestones: { text: string; done: boolean }[];
  streakDays: number;
}

export interface HabitLog {
  [date: string]: string[];
}

export interface DayState {
  date: string;
  habitsCompleted: string[];
  priorities: { text: string; done: boolean }[];
  quickStats: {
    tradingDone: boolean;
    disciplesTouched: number;
    leaderCalls: number;
    learningDone: boolean;
  };
}

export interface MonthMetrics {
  tradesTotal: number;
  disciplesTouched: number;
  leaderCalls: number;
  learningSessions: number;
}

export interface ScheduleBlock {
  time: string;
  title: string;
  category: 'god' | 'rest' | 'mind' | 'trading' | 'business' | 'people' | 'job';
  description: string;
}

export interface Verse {
  text: string;
  ref: string;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
}
