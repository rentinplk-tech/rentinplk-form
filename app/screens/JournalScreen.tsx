import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, useColorScheme,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TradeCard } from '../components/TradeCard';
import { useAppStore } from '../stores/useAppStore';
import { Colors } from '../utils/colors';
import { formatCurrency, calcWinRate, calcTotalPnL, calcStreak, calcPnL } from '../utils/calculations';
import { todayString, formatDisplayDate, formatShortDate } from '../utils/dates';
import { Trade, JournalEntry } from '../types';

const INSTRUMENTS = ['Volatility 75', 'Volatility 25', 'Volatility 10', 'BOOM 1000', 'CRASH 1000', 'EUR/USD', 'XAU/USD'];
const EMOTIONS = ['Confident', 'Neutral', 'FOMO', 'Revenge', 'Bored'];
const MOODS = ['😔', '😕', '😐', '🙂', '😄'];

function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export function JournalScreen() {
  const { trades, addTrade, deleteTrade, journalEntries, addJournalEntry, updateJournalEntry } = useAppStore();
  const [activeTab, setActiveTab] = useState<'trading' | 'personal'>('trading');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? Colors.darkBg : Colors.surface;
  const textColor = isDark ? Colors.darkText : Colors.neutralDark;
  const cardBg = isDark ? Colors.darkSurface : Colors.white;

  // Trading form state
  const [showForm, setShowForm] = useState(false);
  const [instrument, setInstrument] = useState(INSTRUMENTS[0]);
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [emotion, setEmotion] = useState(EMOTIONS[0]);
  const [reason, setReason] = useState('');
  const [lesson, setLesson] = useState('');
  const [outcome, setOutcome] = useState<Trade['outcome']>('win');

  // Personal journal state
  const today = todayString();
  const todayEntry = journalEntries.find(e => e.date === today);
  const [mood, setMood] = useState<1|2|3|4|5>((todayEntry?.mood ?? 3) as 1|2|3|4|5);
  const [journalText, setJournalText] = useState(todayEntry?.text ?? '');
  const [gratitude, setGratitude] = useState<[string,string,string]>(todayEntry?.gratitude ?? ['','','']);
  const [godMoment, setGodMoment] = useState(todayEntry?.godMoment ?? '');
  const [journalSaved, setJournalSaved] = useState(false);

  const thisMonthTrades = trades.filter(t => t.date.startsWith(today.slice(0, 7)));
  const winRate = calcWinRate(thisMonthTrades);
  const totalPnL = calcTotalPnL(thisMonthTrades);
  const streak = calcStreak(thisMonthTrades);

  const handleAddTrade = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const lot = parseFloat(lotSize);
    if (!entry || !exit || !lot) return;
    const pnl = calcPnL(entry, exit, lot, direction);
    addTrade({
      id: uuid(),
      date: new Date().toISOString(),
      instrument,
      direction,
      entryPrice: entry,
      exitPrice: exit,
      lotSize: lot,
      pnl,
      emotion,
      reason,
      lesson,
      outcome,
    });
    setEntryPrice(''); setExitPrice(''); setLotSize('');
    setReason(''); setLesson('');
    setShowForm(false);
  };

  const handleSaveJournal = () => {
    const entry: JournalEntry = {
      id: todayEntry?.id ?? uuid(),
      date: today,
      mood,
      text: journalText,
      gratitude,
      godMoment,
    };
    if (todayEntry) {
      updateJournalEntry(todayEntry.id, { mood, text: journalText, gratitude, godMoment });
    } else {
      addJournalEntry(entry);
    }
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2000);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Journal</Text>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'trading' && { backgroundColor: Colors.teal }]}
            onPress={() => setActiveTab('trading')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'trading' && { color: Colors.white }]}>Trading</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'personal' && { backgroundColor: Colors.purple }]}
            onPress={() => setActiveTab('personal')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'personal' && { color: Colors.white }]}>Personal</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {activeTab === 'trading' ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Stats Bar */}
            <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{thisMonthTrades.length}</Text>
                <Text style={styles.statLbl}>Trades</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{winRate}%</Text>
                <Text style={styles.statLbl}>Win Rate</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: totalPnL >= 0 ? Colors.teal : Colors.coral }]}>
                  {formatCurrency(totalPnL)}
                </Text>
                <Text style={styles.statLbl}>PnL (month)</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{streak.win}W/{streak.loss}L</Text>
                <Text style={styles.statLbl}>Streak</Text>
              </View>
            </Animated.View>

            {/* Add Trade Button */}
            <TouchableOpacity
              style={[styles.addTradeBtn, { backgroundColor: Colors.teal }]}
              onPress={() => setShowForm(!showForm)}
            >
              <Ionicons name={showForm ? 'chevron-up' : 'add'} size={18} color={Colors.white} />
              <Text style={styles.addTradeBtnText}>{showForm ? 'Close Form' : 'Log Trade'}</Text>
            </TouchableOpacity>

            {/* Trade Form */}
            {showForm && (
              <Animated.View entering={FadeInDown.duration(300)} style={[styles.form, { backgroundColor: cardBg }]}>
                <Text style={[styles.formTitle, { color: textColor }]}>New Trade Entry</Text>

                <Text style={styles.fieldLabel}>Instrument</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {INSTRUMENTS.map((ins) => (
                      <TouchableOpacity
                        key={ins}
                        style={[styles.chipSmall, instrument === ins && { backgroundColor: Colors.teal }]}
                        onPress={() => setInstrument(ins)}
                      >
                        <Text style={[styles.chipSmallText, instrument === ins && { color: Colors.white }]}>{ins}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <Text style={styles.fieldLabel}>Direction</Text>
                <View style={styles.dirRow}>
                  <TouchableOpacity
                    style={[styles.dirBtn, direction === 'BUY' && { backgroundColor: Colors.teal }]}
                    onPress={() => setDirection('BUY')}
                  >
                    <Text style={[styles.dirBtnText, direction === 'BUY' && { color: Colors.white }]}>BUY</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dirBtn, direction === 'SELL' && { backgroundColor: Colors.coral }]}
                    onPress={() => setDirection('SELL')}
                  >
                    <Text style={[styles.dirBtnText, direction === 'SELL' && { color: Colors.white }]}>SELL</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.priceRow}>
                  <View style={styles.priceField}>
                    <Text style={styles.fieldLabel}>Entry Price</Text>
                    <TextInput
                      style={[styles.smallInput, { color: textColor }]}
                      value={entryPrice}
                      onChangeText={setEntryPrice}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor={Colors.gray}
                    />
                  </View>
                  <View style={styles.priceField}>
                    <Text style={styles.fieldLabel}>Exit Price</Text>
                    <TextInput
                      style={[styles.smallInput, { color: textColor }]}
                      value={exitPrice}
                      onChangeText={setExitPrice}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor={Colors.gray}
                    />
                  </View>
                  <View style={styles.priceField}>
                    <Text style={styles.fieldLabel}>Lot Size</Text>
                    <TextInput
                      style={[styles.smallInput, { color: textColor }]}
                      value={lotSize}
                      onChangeText={setLotSize}
                      keyboardType="numeric"
                      placeholder="0.01"
                      placeholderTextColor={Colors.gray}
                    />
                  </View>
                </View>

                {entryPrice && exitPrice && lotSize && (
                  <Text style={[styles.pnlPreview, {
                    color: calcPnL(parseFloat(entryPrice)||0, parseFloat(exitPrice)||0, parseFloat(lotSize)||0, direction) >= 0 ? Colors.teal : Colors.coral
                  }]}>
                    P&L: {formatCurrency(calcPnL(parseFloat(entryPrice)||0, parseFloat(exitPrice)||0, parseFloat(lotSize)||0, direction))}
                  </Text>
                )}

                <Text style={styles.fieldLabel}>Emotion</Text>
                <View style={styles.chipRow}>
                  {EMOTIONS.map((e) => (
                    <TouchableOpacity
                      key={e}
                      style={[styles.chipSmall, emotion === e && { backgroundColor: Colors.purple }]}
                      onPress={() => setEmotion(e)}
                    >
                      <Text style={[styles.chipSmallText, emotion === e && { color: Colors.white }]}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Outcome</Text>
                <View style={styles.dirRow}>
                  {(['win','loss','breakeven'] as Trade['outcome'][]).map((o) => {
                    const col = o === 'win' ? Colors.teal : o === 'loss' ? Colors.coral : Colors.gray;
                    return (
                      <TouchableOpacity
                        key={o}
                        style={[styles.dirBtn, outcome === o && { backgroundColor: col }]}
                        onPress={() => setOutcome(o)}
                      >
                        <Text style={[styles.dirBtnText, outcome === o && { color: Colors.white }]}>
                          {o.charAt(0).toUpperCase() + o.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.fieldLabel}>Reason for Entry</Text>
                <TextInput
                  style={[styles.textArea, { color: textColor }]}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Why did you take this trade?"
                  placeholderTextColor={Colors.gray}
                  multiline
                />

                <Text style={styles.fieldLabel}>Lesson Learned</Text>
                <TextInput
                  style={[styles.textArea, { color: textColor }]}
                  value={lesson}
                  onChangeText={setLesson}
                  placeholder="What will you do differently?"
                  placeholderTextColor={Colors.gray}
                  multiline
                />

                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Colors.teal }]} onPress={handleAddTrade}>
                  <Text style={styles.submitBtnText}>Save Trade</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Trade History */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>Trade History</Text>
            {trades.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📈</Text>
                <Text style={styles.emptyText}>No trades logged yet</Text>
                <Text style={styles.emptySubtext}>"The plans of the diligent lead to profit" — Prov 21:5</Text>
              </View>
            ) : (
              trades.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  onDelete={() => deleteTrade(trade.id)}
                />
              ))
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Animated.View entering={FadeInDown.delay(80).duration(400)} style={[styles.form, { backgroundColor: cardBg }]}>
              <Text style={[styles.formTitle, { color: textColor }]}>{formatDisplayDate(today)}</Text>

              <Text style={styles.fieldLabel}>How are you feeling today?</Text>
              <View style={styles.moodRow}>
                {MOODS.map((m, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setMood((i + 1) as 1|2|3|4|5)}
                    style={[styles.moodBtn, mood === i + 1 && styles.moodBtnActive]}
                  >
                    <Text style={styles.moodEmoji}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Journal Entry</Text>
              <TextInput
                style={[styles.textArea, styles.largeArea, { color: textColor }]}
                value={journalText}
                onChangeText={setJournalText}
                placeholder="What's on your heart and mind today?"
                placeholderTextColor={Colors.gray}
                multiline
              />

              <Text style={styles.fieldLabel}>3 Things I'm Grateful For</Text>
              {gratitude.map((g, i) => (
                <TextInput
                  key={i}
                  style={[styles.smallInput, { color: textColor, marginBottom: 6 }]}
                  value={g}
                  onChangeText={(t) => {
                    const updated = [...gratitude] as [string,string,string];
                    updated[i] = t;
                    setGratitude(updated);
                  }}
                  placeholder={`Gratitude ${i + 1}`}
                  placeholderTextColor={Colors.gray}
                />
              ))}

              <Text style={styles.fieldLabel}>God Moment — What did God say/show me today?</Text>
              <TextInput
                style={[styles.textArea, { color: textColor }]}
                value={godMoment}
                onChangeText={setGodMoment}
                placeholder="Write what you heard or saw from God today..."
                placeholderTextColor={Colors.gray}
                multiline
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: journalSaved ? Colors.teal : Colors.purple }]}
                onPress={handleSaveJournal}
              >
                <Text style={styles.submitBtnText}>{journalSaved ? '✓ Saved' : 'Save Entry'}</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Previous Entries */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>Previous Entries</Text>
            {journalEntries.filter(e => e.date !== today).map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={[styles.entryCard, { backgroundColor: cardBg }]}
              >
                <View style={styles.entryHeader}>
                  <Text style={[styles.entryDate, { color: textColor }]}>{formatShortDate(entry.date)}</Text>
                  <Text style={styles.moodEmoji}>{MOODS[(entry.mood ?? 3) - 1]}</Text>
                </View>
                <Text style={[styles.entryPreview, { color: Colors.gray }]} numberOfLines={2}>
                  {entry.text || 'No text written'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 32 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 10 },
  tabsRow: { flexDirection: 'row', gap: 8 },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.grayLight,
  },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: '700', color: Colors.neutralDark },
  statLbl: { fontSize: 9, color: Colors.gray, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.grayLight },
  addTradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
  },
  addTradeBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  form: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  fieldLabel: {
    fontSize: 11,
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: Colors.grayLight,
  },
  chipSmallText: { fontSize: 12, fontWeight: '600', color: Colors.gray },
  dirRow: { flexDirection: 'row', gap: 8 },
  dirBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
  },
  dirBtnText: { fontSize: 13, fontWeight: '700', color: Colors.gray },
  priceRow: { flexDirection: 'row', gap: 8 },
  priceField: { flex: 1 },
  smallInput: {
    borderWidth: 1.5,
    borderColor: Colors.grayLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  pnlPreview: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginVertical: 4 },
  textArea: {
    borderWidth: 1.5,
    borderColor: Colors.grayLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  largeArea: { minHeight: 120 },
  submitBtn: {
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  submitBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 6 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 16, fontWeight: '700', color: Colors.neutralDark },
  emptySubtext: { fontSize: 12, color: Colors.gray, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 20 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  moodBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBtnActive: {
    backgroundColor: Colors.purple + '33',
    borderWidth: 2,
    borderColor: Colors.purple,
  },
  moodEmoji: { fontSize: 22 },
  entryCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    padding: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryDate: { fontSize: 14, fontWeight: '600' },
  entryPreview: { fontSize: 13, lineHeight: 18 },
});
