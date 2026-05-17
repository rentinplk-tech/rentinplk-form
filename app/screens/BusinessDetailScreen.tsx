import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../stores/useAppStore';
import { Colors, StatusColors } from '../utils/colors';
import { formatCurrency } from '../utils/calculations';
import { formatShortDate, todayString } from '../utils/dates';
import { Task } from '../types';
import { RootStackParamList } from '../../App';

type RouteParams = RouteProp<RootStackParamList, 'BusinessDetail'>;

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function BusinessDetailScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { businesses, updateBusiness, addTask, toggleTask, deleteTask } = useAppStore();
  const biz = businesses.find((b) => b.id === route.params.businessId);
  const [newTask, setNewTask] = useState('');
  const [editingFocus, setEditingFocus] = useState(false);
  const [focusText, setFocusText] = useState(biz?.focus ?? '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(biz?.notes ?? '');
  const [incomeText, setIncomeText] = useState(String(biz?.revenue.income ?? 0));
  const [expensesText, setExpensesText] = useState(String(biz?.revenue.expenses ?? 0));

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? Colors.darkBg : Colors.surface;
  const textColor = isDark ? Colors.darkText : Colors.neutralDark;
  const cardBg = isDark ? Colors.darkSurface : Colors.white;

  if (!biz) return null;

  const net = biz.revenue.income - biz.revenue.expenses;

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    addTask(biz.id, {
      id: uuid(),
      text: newTask.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    });
    setNewTask('');
  };

  const handleSaveFocus = () => {
    updateBusiness(biz.id, { focus: focusText });
    setEditingFocus(false);
  };

  const handleSaveNotes = () => {
    updateBusiness(biz.id, { notes: notesText });
    setEditingNotes(false);
  };

  const handleRevenueBlur = () => {
    updateBusiness(biz.id, {
      revenue: {
        income: parseFloat(incomeText) || 0,
        expenses: parseFloat(expensesText) || 0,
      },
    });
  };

  const statusColor = StatusColors[biz.status];
  const statusLabel = biz.status.charAt(0).toUpperCase() + biz.status.slice(1);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Hero */}
          <View style={[styles.hero, { backgroundColor: biz.color }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </TouchableOpacity>
            <View style={[styles.abbrevBadge]}>
              <Text style={styles.abbrev}>{biz.abbreviation}</Text>
            </View>
            <Text style={styles.heroName}>{biz.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
            <Text style={styles.heroDesc}>{biz.description}</Text>
          </View>

          {/* This Week's Focus */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: textColor }]}>This Week's Focus</Text>
              <TouchableOpacity onPress={() => setEditingFocus(!editingFocus)}>
                <Ionicons name={editingFocus ? 'checkmark' : 'pencil'} size={18} color={biz.color} />
              </TouchableOpacity>
            </View>
            {editingFocus ? (
              <TextInput
                style={[styles.textInput, { color: textColor, borderColor: biz.color }]}
                value={focusText}
                onChangeText={setFocusText}
                multiline
                onBlur={handleSaveFocus}
              />
            ) : (
              <Text style={[styles.focusText, { color: Colors.gray }]}>{focusText || 'Tap to add focus...'}</Text>
            )}
          </View>

          {/* Revenue */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Revenue Tracker (ZAR)</Text>
            <View style={styles.revenueRow}>
              <View style={styles.revenueItem}>
                <Text style={styles.revenueLabel}>Income</Text>
                <TextInput
                  style={[styles.revenueInput, { color: Colors.teal }]}
                  value={incomeText}
                  onChangeText={setIncomeText}
                  onBlur={handleRevenueBlur}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.gray}
                />
              </View>
              <View style={styles.revenueItem}>
                <Text style={styles.revenueLabel}>Expenses</Text>
                <TextInput
                  style={[styles.revenueInput, { color: Colors.coral }]}
                  value={expensesText}
                  onChangeText={setExpensesText}
                  onBlur={handleRevenueBlur}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.gray}
                />
              </View>
              <View style={styles.revenueItem}>
                <Text style={styles.revenueLabel}>Net</Text>
                <Text style={[styles.netValue, { color: net >= 0 ? Colors.teal : Colors.coral }]}>
                  {formatCurrency(net)}
                </Text>
              </View>
            </View>
          </View>

          {/* Tasks */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Tasks</Text>
            <View style={styles.addRow}>
              <TextInput
                style={[styles.addInput, { color: textColor, borderColor: biz.color }]}
                value={newTask}
                onChangeText={setNewTask}
                placeholder="Add a task..."
                placeholderTextColor={Colors.gray}
                onSubmitEditing={handleAddTask}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: biz.color }]}
                onPress={handleAddTask}
              >
                <Ionicons name="add" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
            {biz.tasks.length === 0 && (
              <Text style={styles.emptyText}>No tasks yet — add your first above</Text>
            )}
            {biz.tasks.map((task) => (
              <View key={task.id} style={styles.taskRow}>
                <TouchableOpacity onPress={() => toggleTask(biz.id, task.id)}>
                  <Ionicons
                    name={task.done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={task.done ? Colors.teal : Colors.gray}
                  />
                </TouchableOpacity>
                <Text style={[styles.taskText, task.done && styles.taskDone, { color: textColor }]}>
                  {task.text}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Delete Task', 'Remove this task?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(biz.id, task.id) },
                    ]);
                  }}
                >
                  <Ionicons name="close-circle-outline" size={18} color={Colors.gray} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Notes */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: textColor }]}>Notes</Text>
              <TouchableOpacity onPress={() => setEditingNotes(!editingNotes)}>
                <Ionicons name={editingNotes ? 'checkmark' : 'pencil'} size={18} color={biz.color} />
              </TouchableOpacity>
            </View>
            {editingNotes ? (
              <TextInput
                style={[styles.textInput, styles.notesInput, { color: textColor, borderColor: biz.color }]}
                value={notesText}
                onChangeText={setNotesText}
                multiline
                onBlur={handleSaveNotes}
                placeholder="Add business notes..."
                placeholderTextColor={Colors.gray}
              />
            ) : (
              <Text style={[styles.focusText, { color: Colors.gray }]}>{notesText || 'Tap pencil to add notes...'}</Text>
            )}
          </View>

          <Text style={styles.updated}>
            Last updated: {formatShortDate(biz.updatedAt)}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 48 },
  hero: {
    padding: 20,
    paddingTop: 48,
    gap: 8,
  },
  back: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 4,
  },
  abbrevBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  abbrev: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 19,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  focusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  revenueRow: {
    flexDirection: 'row',
    gap: 8,
  },
  revenueItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  revenueLabel: {
    fontSize: 11,
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  revenueInput: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
    paddingVertical: 4,
    width: '100%',
  },
  netValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 4,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.gray,
    textAlign: 'center',
    paddingVertical: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: Colors.gray,
  },
  updated: {
    fontSize: 11,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
});
