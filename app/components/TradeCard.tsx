import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trade } from '../types';
import { Colors } from '../utils/colors';
import { formatCurrency } from '../utils/calculations';
import { formatShortDate } from '../utils/dates';

interface Props {
  trade: Trade;
  onDelete: () => void;
}

export function TradeCard({ trade, onDelete }: Props) {
  const isProfit = trade.pnl >= 0;
  const pnlColor = isProfit ? Colors.teal : Colors.coral;
  const directionColor = trade.direction === 'BUY' ? Colors.teal : Colors.coral;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.instrument}>{trade.instrument}</Text>
          <Text style={styles.date}>{formatShortDate(trade.date)}</Text>
        </View>
        <View style={[styles.dirBadge, { backgroundColor: directionColor + '22' }]}>
          <Text style={[styles.direction, { color: directionColor }]}>{trade.direction}</Text>
        </View>
        <Text style={[styles.pnl, { color: pnlColor }]}>
          {isProfit ? '+' : ''}{formatCurrency(trade.pnl)}
        </Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={16} color={Colors.gray} />
        </TouchableOpacity>
      </View>
      <View style={styles.details}>
        <Text style={styles.detail}>
          Entry: {trade.entryPrice} | Exit: {trade.exitPrice} | Lot: {trade.lotSize}
        </Text>
        <View style={[styles.outcomeBadge, {
          backgroundColor: trade.outcome === 'win' ? Colors.teal + '22' : trade.outcome === 'loss' ? Colors.coral + '22' : Colors.gray + '22'
        }]}>
          <Text style={[styles.outcomeText, {
            color: trade.outcome === 'win' ? Colors.teal : trade.outcome === 'loss' ? Colors.coral : Colors.gray
          }]}>
            {trade.outcome.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  left: {
    flex: 1,
  },
  instrument: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutralDark,
  },
  date: {
    fontSize: 11,
    color: Colors.gray,
  },
  dirBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  direction: {
    fontSize: 11,
    fontWeight: '700',
  },
  pnl: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 70,
    textAlign: 'right',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detail: {
    fontSize: 11,
    color: Colors.gray,
  },
  outcomeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  outcomeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
