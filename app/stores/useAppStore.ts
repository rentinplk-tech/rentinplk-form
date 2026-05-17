import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Business, Contact, Trade, JournalEntry, SkillTrack,
  LearningSession, HabitLog, DayState, MonthMetrics,
  Task, Interaction,
} from '../types';
import { DEFAULT_BUSINESSES } from '../data/businesses';
import { DEFAULT_SKILL_TRACKS } from '../data/skillTracks';
import { todayString } from '../utils/dates';

const DEFAULT_DAY_STATE = (): DayState => ({
  date: todayString(),
  habitsCompleted: [],
  priorities: [
    { text: '', done: false },
    { text: '', done: false },
    { text: '', done: false },
  ],
  quickStats: {
    tradingDone: false,
    disciplesTouched: 0,
    leaderCalls: 0,
    learningDone: false,
  },
});

interface AppStore {
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;

  userName: string;
  setUserName: (name: string) => void;

  prayerTime: string;
  setPrayerTime: (time: string) => void;

  dayStates: Record<string, DayState>;
  updateDayState: (date: string, updates: Partial<DayState>) => void;
  getTodayState: () => DayState;

  businesses: Business[];
  updateBusiness: (id: string, updates: Partial<Business>) => void;
  addTask: (businessId: string, task: Task) => void;
  toggleTask: (businessId: string, taskId: string) => void;
  deleteTask: (businessId: string, taskId: string) => void;

  contacts: Contact[];
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  logInteraction: (contactId: string, interaction: Interaction) => void;

  trades: Trade[];
  addTrade: (trade: Trade) => void;
  deleteTrade: (id: string) => void;

  journalEntries: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;

  skillTracks: SkillTrack[];
  logSession: (trackId: string, session: LearningSession) => void;
  completeMilestone: (trackId: string, milestoneIndex: number) => void;
  addXP: (trackId: string, xp: number) => void;

  habitLog: HabitLog;
  toggleHabit: (date: string, habitId: string) => void;

  monthMetrics: MonthMetrics;
  incrementMetric: (key: keyof MonthMetrics) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      setHasOnboarded: (v) => set({ hasOnboarded: v }),

      userName: '',
      setUserName: (name) => set({ userName: name }),

      prayerTime: '05:00',
      setPrayerTime: (time) => set({ prayerTime: time }),

      dayStates: {},
      updateDayState: (date, updates) =>
        set((state) => {
          const existing = state.dayStates[date] ?? DEFAULT_DAY_STATE();
          return {
            dayStates: {
              ...state.dayStates,
              [date]: { ...existing, ...updates },
            },
          };
        }),
      getTodayState: () => {
        const today = todayString();
        return get().dayStates[today] ?? DEFAULT_DAY_STATE();
      },

      businesses: DEFAULT_BUSINESSES,
      updateBusiness: (id, updates) =>
        set((state) => ({
          businesses: state.businesses.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        })),
      addTask: (businessId, task) =>
        set((state) => ({
          businesses: state.businesses.map((b) =>
            b.id === businessId
              ? { ...b, tasks: [...b.tasks, task], updatedAt: new Date().toISOString() }
              : b
          ),
        })),
      toggleTask: (businessId, taskId) =>
        set((state) => ({
          businesses: state.businesses.map((b) =>
            b.id === businessId
              ? {
                  ...b,
                  tasks: b.tasks.map((t) =>
                    t.id === taskId ? { ...t, done: !t.done } : t
                  ),
                }
              : b
          ),
        })),
      deleteTask: (businessId, taskId) =>
        set((state) => ({
          businesses: state.businesses.map((b) =>
            b.id === businessId
              ? { ...b, tasks: b.tasks.filter((t) => t.id !== taskId) }
              : b
          ),
        })),

      contacts: [],
      addContact: (contact) =>
        set((state) => ({ contacts: [...state.contacts, contact] })),
      updateContact: (id, updates) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),
      logInteraction: (contactId, interaction) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === contactId
              ? {
                  ...c,
                  interactions: [interaction, ...c.interactions],
                  lastContacted: interaction.date,
                }
              : c
          ),
        })),

      trades: [],
      addTrade: (trade) =>
        set((state) => ({ trades: [trade, ...state.trades] })),
      deleteTrade: (id) =>
        set((state) => ({ trades: state.trades.filter((t) => t.id !== id) })),

      journalEntries: [],
      addJournalEntry: (entry) =>
        set((state) => ({ journalEntries: [entry, ...state.journalEntries] })),
      updateJournalEntry: (id, updates) =>
        set((state) => ({
          journalEntries: state.journalEntries.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      skillTracks: DEFAULT_SKILL_TRACKS,
      logSession: (trackId, session) =>
        set((state) => ({
          skillTracks: state.skillTracks.map((t) =>
            t.id === trackId
              ? { ...t, sessions: [session, ...t.sessions], xp: t.xp + Math.round(session.durationMinutes / 5) }
              : t
          ),
        })),
      completeMilestone: (trackId, milestoneIndex) =>
        set((state) => ({
          skillTracks: state.skillTracks.map((t) =>
            t.id === trackId
              ? {
                  ...t,
                  milestones: t.milestones.map((m, i) =>
                    i === milestoneIndex ? { ...m, done: !m.done } : m
                  ),
                }
              : t
          ),
        })),
      addXP: (trackId, xp) =>
        set((state) => ({
          skillTracks: state.skillTracks.map((t) =>
            t.id === trackId ? { ...t, xp: t.xp + xp } : t
          ),
        })),

      habitLog: {},
      toggleHabit: (date, habitId) =>
        set((state) => {
          const existing = state.habitLog[date] ?? [];
          const updated = existing.includes(habitId)
            ? existing.filter((h) => h !== habitId)
            : [...existing, habitId];
          return { habitLog: { ...state.habitLog, [date]: updated } };
        }),

      monthMetrics: {
        tradesTotal: 0,
        disciplesTouched: 0,
        leaderCalls: 0,
        learningSessions: 0,
      },
      incrementMetric: (key) =>
        set((state) => ({
          monthMetrics: {
            ...state.monthMetrics,
            [key]: state.monthMetrics[key] + 1,
          },
        })),
    }),
    {
      name: 'command-centre-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
