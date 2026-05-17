import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../utils/colors';
import { Verse } from '../types';

interface Props {
  verse: Verse;
}

export function VerseCard({ verse }: Props) {
  return (
    <View style={styles.card}>
      <Ionicons name="book-outline" size={16} color={Colors.primaryGold} />
      <Text style={styles.text}>"{verse.text}"</Text>
      <Text style={styles.ref}>— {verse.ref}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FEF9EC',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryGold,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 6,
  },
  text: {
    fontSize: 13,
    color: Colors.neutralDark,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  ref: {
    fontSize: 11,
    color: Colors.primaryGold,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
