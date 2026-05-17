import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../utils/colors';

interface Props {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onToggle?: () => void;
  toggled?: boolean;
}

export function StatCard({ label, value, icon, color, onIncrement, onDecrement, onToggle, toggled }: Props) {
  return (
    <View style={[styles.card, { borderTopColor: color }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {onToggle && (
        <TouchableOpacity
          style={[styles.toggleBtn, { backgroundColor: toggled ? color : Colors.grayLight }]}
          onPress={onToggle}
        >
          <Text style={[styles.toggleText, { color: toggled ? Colors.white : Colors.gray }]}>
            {toggled ? 'Yes' : 'No'}
          </Text>
        </TouchableOpacity>
      )}
      {(onIncrement || onDecrement) && (
        <View style={styles.counter}>
          <TouchableOpacity onPress={onDecrement} style={styles.counterBtn}>
            <Text style={styles.counterBtnText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onIncrement} style={[styles.counterBtn, { backgroundColor: color }]}>
            <Text style={[styles.counterBtnText, { color: Colors.white }]}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    width: 110,
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    marginRight: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutralDark,
  },
  label: {
    fontSize: 10,
    color: Colors.gray,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  counter: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutralDark,
    lineHeight: 20,
  },
});
