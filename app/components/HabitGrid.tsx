import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { HABITS } from '../data/habits';
import { Colors } from '../utils/colors';
import { getDaysInMonth, todayString } from '../utils/dates';
import { format } from 'date-fns';

interface Props {
  habitLog: Record<string, string[]>;
  onToggle: (date: string, habitId: string) => void;
  monthYear?: string;
}

function HabitDot({ filled, color, onPress }: { filled: boolean; color: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(1.3, { damping: 4 }, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[
        styles.dot,
        animStyle,
        { backgroundColor: filled ? color : Colors.grayLight },
      ]} />
    </TouchableOpacity>
  );
}

export function HabitGrid({ habitLog, onToggle, monthYear }: Props) {
  const daysInMonth = getDaysInMonth();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const totalPossible = HABITS.length * daysInMonth;
  const totalCompleted = Object.values(habitLog).reduce((sum, arr) => sum + arr.length, 0);
  const pct = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Habit Tracker — {monthYear ?? format(now, 'MMMM yyyy')}</Text>
      <Text style={styles.summary}>You've completed {pct}% of your habits this month</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.dayRow}>
            <View style={styles.labelCell} />
            {Array.from({ length: daysInMonth }, (_, i) => (
              <Text key={i} style={styles.dayLabel}>{i + 1}</Text>
            ))}
          </View>
          {HABITS.map((habit) => (
            <View key={habit.id} style={styles.habitRow}>
              <View style={styles.labelCell}>
                <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>
              </View>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = new Date(year, month, i + 1);
                const dateStr = format(d, 'yyyy-MM-dd');
                const isFuture = d > now;
                const completed = (habitLog[dateStr] ?? []).includes(habit.id);
                return (
                  <HabitDot
                    key={i}
                    filled={completed}
                    color={habit.color}
                    onPress={() => !isFuture && onToggle(dateStr, habit.id)}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutralDark,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  summary: {
    fontSize: 13,
    color: Colors.gray,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingLeft: 8,
  },
  dayLabel: {
    width: 22,
    textAlign: 'center',
    fontSize: 10,
    color: Colors.gray,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 8,
  },
  labelCell: {
    width: 110,
    paddingRight: 8,
  },
  habitName: {
    fontSize: 11,
    color: Colors.neutralDark,
    fontWeight: '500',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    margin: 3,
  },
});
