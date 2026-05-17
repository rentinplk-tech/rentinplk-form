import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Modal, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../stores/useAppStore';
import { ContactCategoryColors, Colors } from '../utils/colors';
import { formatShortDate, daysSinceLabel, todayString } from '../utils/dates';
import { Interaction } from '../types';
import { RootStackParamList } from '../../App';

type RouteParams = RouteProp<RootStackParamList, 'ContactDetail'>;

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const INTERACTION_TYPES: Interaction['type'][] = ['call', 'meet', 'message', 'prayer', 'other'];

export function ContactDetailScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { contacts, logInteraction } = useAppStore();
  const contact = contacts.find(c => c.id === route.params.contactId);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logType, setLogType] = useState<Interaction['type']>('call');
  const [logNotes, setLogNotes] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? Colors.darkBg : Colors.surface;
  const textColor = isDark ? Colors.darkText : Colors.neutralDark;
  const cardBg = isDark ? Colors.darkSurface : Colors.white;

  if (!contact) return null;

  const catColor = ContactCategoryColors[contact.category];
  const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLog = () => {
    if (!logNotes.trim()) return;
    logInteraction(contact.id, {
      id: uuid(),
      date: new Date().toISOString(),
      type: logType,
      notes: logNotes.trim(),
    });
    setLogNotes('');
    setShowLogModal(false);
  };

  const typeIcon: Record<Interaction['type'], string> = {
    call: 'call',
    meet: 'people',
    message: 'chatbubble',
    prayer: 'heart',
    other: 'ellipsis-horizontal',
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: catColor }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <Text style={styles.heroName}>{contact.name}</Text>
          <Text style={styles.heroCat}>
            {contact.category.charAt(0).toUpperCase() + contact.category.slice(1)}
          </Text>
          {contact.phone && (
            <Text style={styles.heroPhone}>{contact.phone}</Text>
          )}
        </View>

        {/* Last Contact */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={16} color={Colors.gray} />
            <Text style={[styles.lastContact, { color: Colors.gray }]}>
              Last contacted: {contact.lastContacted ? daysSinceLabel(contact.lastContacted) : 'Never'}
            </Text>
          </View>
          {contact.goal ? (
            <>
              <Text style={[styles.goalLabel, { color: Colors.gray }]}>Relationship Goal</Text>
              <Text style={[styles.goalText, { color: textColor }]}>{contact.goal}</Text>
            </>
          ) : null}
        </View>

        {/* Log Interaction Button */}
        <TouchableOpacity
          style={[styles.logBtn, { backgroundColor: catColor }]}
          onPress={() => setShowLogModal(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
          <Text style={styles.logBtnText}>Log Interaction</Text>
        </TouchableOpacity>

        {/* Interaction History */}
        <View style={styles.historySection}>
          <Text style={[styles.historyTitle, { color: textColor }]}>Interaction History</Text>
          {contact.interactions.length === 0 ? (
            <Text style={styles.emptyText}>No interactions logged yet</Text>
          ) : (
            contact.interactions.map((interaction) => (
              <View key={interaction.id} style={[styles.interactionCard, { backgroundColor: cardBg }]}>
                <View style={styles.interactionHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: catColor + '22' }]}>
                    <Ionicons name={typeIcon[interaction.type] as any} size={13} color={catColor} />
                    <Text style={[styles.typeText, { color: catColor }]}>
                      {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.interactionDate}>{formatShortDate(interaction.date)}</Text>
                </View>
                <Text style={[styles.interactionNotes, { color: textColor }]}>{interaction.notes}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Log Modal */}
      <Modal visible={showLogModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, { backgroundColor: bg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Log Interaction</Text>
            <TouchableOpacity onPress={() => setShowLogModal(false)}>
              <Ionicons name="close" size={24} color={Colors.gray} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.typeGrid}>
              {INTERACTION_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, logType === t && { backgroundColor: catColor }]}
                  onPress={() => setLogType(t)}
                >
                  <Ionicons name={typeIcon[t] as any} size={14} color={logType === t ? Colors.white : Colors.gray} />
                  <Text style={[styles.typeChipText, logType === t ? { color: Colors.white } : { color: Colors.gray }]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Notes *</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldMulti, { color: textColor }]}
              value={logNotes}
              onChangeText={setLogNotes}
              placeholder="What happened? What was shared?"
              placeholderTextColor={Colors.gray}
              multiline
              autoFocus
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: catColor }]}
              onPress={handleLog}
            >
              <Text style={styles.saveBtnText}>Save Interaction</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 48 },
  hero: {
    padding: 20,
    paddingTop: 56,
    alignItems: 'center',
    gap: 6,
  },
  back: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: Colors.white, fontWeight: '800', fontSize: 24 },
  heroName: { fontSize: 22, fontWeight: '800', color: Colors.white },
  heroCat: { fontSize: 13, color: 'rgba(255,255,255,0.75)', textTransform: 'capitalize' },
  heroPhone: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lastContact: { fontSize: 13 },
  goalLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginTop: 4 },
  goalText: { fontSize: 14, lineHeight: 20 },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 13,
    borderRadius: 12,
  },
  logBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  historySection: { marginTop: 16, paddingHorizontal: 16 },
  historyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  emptyText: { fontSize: 13, color: Colors.gray, textAlign: 'center', paddingVertical: 20 },
  interactionCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  interactionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: { fontSize: 11, fontWeight: '600' },
  interactionDate: { fontSize: 11, color: Colors.gray },
  interactionNotes: { fontSize: 13, lineHeight: 19 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalBody: { padding: 16, paddingBottom: 48 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: Colors.grayLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  fieldMulti: { minHeight: 100, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.grayLight,
  },
  typeChipText: { fontSize: 13, fontWeight: '600' },
  saveBtn: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
