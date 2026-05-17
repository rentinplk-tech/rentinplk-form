import React, { useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProgressRing } from '../components/ProgressRing';
import { VerseCard } from '../components/VerseCard';
import { TimeBlock } from '../components/TimeBlock';
import { StatCard } from '../components/StatCard';
import { useAppStore } from '../stores/useAppStore';
import { VERSES } from '../data/verses';
import { SCHEDULE_BLOCKS } from '../data/schedule';
import { HABITS } from '../data/habits';
import { Colors } from '../utils/colors';
import { getGreeting, formatDisplayDate, getVerseIndex, todayString } from '../utils/dates';

export function HomeScreen() {
  const { userName, getTodayState, updateDayState, habitLog, toggleHabit } = useAppStore();
  const today = todayString();
  const todayState = getTodayState();
  const verse = VERSES[getVerseIndex(VERSES.length)];
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const completedHabits = (habitLog[today] ?? []).length;
  const totalHabits = HABITS.length;
  const progress = totalHabits > 0 ? completedHabits / totalHabits : 0;

  const handlePriorityChange = useCallback((index: number, text: string) => {
    const updated = [...todayState.priorities];
    updated[index] = { ...updated[index], text };
    updateDayState(today, { priorities: updated });
  }, [todayState.priorities, today, updateDayState]);

  const handlePriorityToggle = useCallback((index: number) => {
    const updated = [...todayState.priorities];
    updated[index] = { ...updated[index], done: !updated[index].done };
    updateDayState(today, { priorities: updated });
  }, [todayState.priorities, today, updateDayState]);

  const handleBlockDone = useCallback((blockTitle: string) => {
    const prev = todayState.habitsCompleted;
    const updated = prev.includes(blockTitle) ? prev : [...prev, blockTitle];
    updateDayState(today, { habitsCompleted: updated });
  }, [todayState.habitsCompleted, today, updateDayState]);

  const { quickStats } = todayState;

  const updateStats = useCallback((key: keyof typeof quickStats, value: boolean | number) => {
    updateDayState(today, { quickStats: { ...quickStats, [key]: value } });
  }, [quickStats, today, updateDayState]);

  const bg = isDark ? Colors.darkBg : Colors.surface;
  const textColor = isDark ? Colors.darkText : Colors.neutralDark;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: Colors.gray }]}>{getGreeting()},</Text>
            <Text style={[styles.name, { color: textColor }]}>{userName || 'Kingdom Builder'} 👑</Text>
            <Text style={[styles.date, { color: Colors.gray }]}>{formatDisplayDate(today)}</Text>
          </View>
          <View style={[styles.crownBg, { backgroundColor: Colors.primaryGold + '22' }]}>
            <Ionicons name="trophy" size={22} color={Colors.primaryGold} />
          </View>
        </Animated.View>

        {/* Verse of the Day */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <VerseCard verse={verse} />
        </Animated.View>

        {/* Progress Ring */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.ringContainer}>
          <ProgressRing
            progress={progress}
            size={130}
            strokeWidth={11}
            color={Colors.primaryGold}
            label={`${completedHabits}/${totalHabits}`}
            sublabel="habits done"
          />
          <View style={styles.ringInfo}>
            <Text style={[styles.ringTitle, { color: textColor }]}>Today's Habits</Text>
            <Text style={styles.ringSubtitle}>Keep the streak alive</Text>
            {HABITS.map((habit) => {
              const done = (habitLog[today] ?? []).includes(habit.id);
              return (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() => toggleHabit(today, habit.id)}
                  style={styles.habitRow}
                >
                  <View style={[styles.habitDot, { backgroundColor: done ? habit.color : Colors.grayLight }]} />
                  <Text style={[styles.habitLabel, done && styles.habitDone]}>{habit.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Stats</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
            <StatCard
              label="Trading"
              value={quickStats.tradingDone ? '✓' : '—'}
              icon="trending-up"
              color={Colors.teal}
              toggled={quickStats.tradingDone}
              onToggle={() => updateStats('tradingDone', !quickStats.tradingDone)}
            />
            <StatCard
              label="Disciples"
              value={quickStats.disciplesTouched}
              icon="people"
              color={Colors.coral}
              onIncrement={() => updateStats('disciplesTouched', quickStats.disciplesTouched + 1)}
              onDecrement={() => updateStats('disciplesTouched', Math.max(0, quickStats.disciplesTouched - 1))}
            />
            <StatCard
              label="Leader Calls"
              value={quickStats.leaderCalls}
              icon="call"
              color={Colors.deepNavy}
              onIncrement={() => updateStats('leaderCalls', quickStats.leaderCalls + 1)}
              onDecrement={() => updateStats('leaderCalls', Math.max(0, quickStats.leaderCalls - 1))}
            />
            <StatCard
              label="Learning"
              value={quickStats.learningDone ? '✓' : '—'}
              icon="school"
              color={Colors.purple}
              toggled={quickStats.learningDone}
              onToggle={() => updateStats('learningDone', !quickStats.learningDone)}
            />
          </ScrollView>
        </Animated.View>

        {/* Today's Priorities */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Today's Top 3</Text>
          {todayState.priorities.map((p, i) => (
            <View key={i} style={[styles.priorityRow, { backgroundColor: Colors.white }]}>
              <TouchableOpacity onPress={() => handlePriorityToggle(i)}>
                <Ionicons
                  name={p.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={p.done ? Colors.teal : Colors.gray}
                />
              </TouchableOpacity>
              <TextInput
                style={[styles.priorityInput, p.done && styles.priorityDone, { color: textColor }]}
                value={p.text}
                onChangeText={(t) => handlePriorityChange(i, t)}
                placeholder={`Priority ${i + 1}`}
                placeholderTextColor={Colors.gray}
                multiline={false}
              />
            </View>
          ))}
        </Animated.View>

        {/* Schedule */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Today's Schedule</Text>
          {SCHEDULE_BLOCKS.map((block, i) => (
            <TimeBlock
              key={i}
              block={block}
              done={todayState.habitsCompleted.includes(block.title)}
              onMarkDone={() => handleBlockDone(block.title)}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 14,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 13,
    marginTop: 2,
  },
  crownBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 16,
  },
  ringInfo: {
    flex: 1,
    gap: 4,
  },
  ringTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  ringSubtitle: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  habitDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  habitLabel: {
    fontSize: 12,
    color: Colors.gray,
  },
  habitDone: {
    textDecorationLine: 'line-through',
    color: Colors.teal,
  },
  statsRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  priorityInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  priorityDone: {
    textDecorationLine: 'line-through',
    color: Colors.gray,
  },
});
