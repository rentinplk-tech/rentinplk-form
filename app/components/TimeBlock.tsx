import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { withSpring, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { CategoryColors } from '../utils/colors';
import { Colors } from '../utils/colors';
import { ScheduleBlock } from '../types';

interface Props {
  block: ScheduleBlock;
  done: boolean;
  onMarkDone: () => void;
}

export function TimeBlock({ block, done, onMarkDone }: Props) {
  const [expanded, setExpanded] = useState(false);
  const categoryColor = CategoryColors[block.category] ?? Colors.gray;

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.85}
      style={[styles.container, done && styles.containerDone]}
    >
      <View style={[styles.colorBar, { backgroundColor: categoryColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.time, done && styles.textDone]}>{block.time}</Text>
          <Text style={[styles.title, done && styles.textDone]} numberOfLines={expanded ? undefined : 1}>
            {block.title}
          </Text>
          {done && <Ionicons name="checkmark-circle" size={18} color={Colors.teal} />}
        </View>
        {expanded && (
          <View style={styles.details}>
            <Text style={styles.description}>{block.description}</Text>
            {!done && (
              <TouchableOpacity style={[styles.doneBtn, { backgroundColor: categoryColor }]} onPress={onMarkDone}>
                <Text style={styles.doneBtnText}>Mark Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  containerDone: {
    opacity: 0.6,
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
    minWidth: 40,
    letterSpacing: 0.3,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutralDark,
  },
  textDone: {
    color: Colors.gray,
  },
  details: {
    marginTop: 8,
    gap: 10,
  },
  description: {
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 19,
  },
  doneBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
