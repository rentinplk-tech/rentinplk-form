import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Business } from '../types';
import { StatusColors, Colors } from '../utils/colors';

interface Props {
  business: Business;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function BusinessCard({ business, onPress }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const statusColor = StatusColors[business.status];
  const statusLabel = business.status.charAt(0).toUpperCase() + business.status.slice(1);
  const tasksLeft = business.tasks.filter(t => !t.done).length;

  return (
    <AnimatedTouchable
      style={[styles.card, animatedStyle]}
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
      onPress={onPress}
      activeOpacity={1}
    >
      <View style={[styles.accentBar, { backgroundColor: business.color }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: business.color + '22' }]}>
            <Text style={[styles.badgeText, { color: business.color }]}>{business.abbreviation}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.name}>{business.name}</Text>
        <Text style={styles.focus} numberOfLines={1}>{business.focus}</Text>
        <View style={styles.footer}>
          <Text style={styles.tasksText}>{tasksLeft} task{tasksLeft !== 1 ? 's' : ''} pending</Text>
          <Text style={styles.arrow}>›</Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  accentBar: {
    width: 5,
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutralDark,
  },
  focus: {
    fontSize: 13,
    color: Colors.gray,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  tasksText: {
    fontSize: 12,
    color: Colors.gray,
  },
  arrow: {
    fontSize: 20,
    color: Colors.gray,
  },
});
