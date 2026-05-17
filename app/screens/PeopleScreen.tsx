import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Modal, Alert, useColorScheme,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ContactCard } from '../components/ContactCard';
import { useAppStore } from '../stores/useAppStore';
import { Colors, ContactCategoryColors } from '../utils/colors';
import { Contact } from '../types';
import { todayString, daysSince } from '../utils/dates';
import { RootStackParamList } from '../../App';

const CATEGORIES = ['All', 'Leaders', 'Disciples', 'Family', 'Friends', 'Community', 'Extended'] as const;
type CategoryFilter = typeof CATEGORIES[number];

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function PeopleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { contacts, addContact } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Contact['category']>('friend');
  const [newPhone, setNewPhone] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? Colors.darkBg : Colors.surface;
  const textColor = isDark ? Colors.darkText : Colors.neutralDark;
  const cardBg = isDark ? Colors.darkSurface : Colors.white;

  const filtered = useMemo(() => {
    let result = contacts;
    if (activeCategory !== 'All') {
      const key = activeCategory.toLowerCase().slice(0, -1) as Contact['category'];
      const key2 = activeCategory.toLowerCase() as Contact['category'];
      result = result.filter(c => c.category === key || c.category === key2 ||
        c.category === activeCategory.toLowerCase().replace('s', '') as Contact['category']
      );
    }
    if (search) {
      result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    }
    return [...result].sort((a, b) => daysSince(b.lastContacted) - daysSince(a.lastContacted));
  }, [contacts, activeCategory, search]);

  const disciplesToday = contacts.filter(c => c.category === 'disciple' && daysSince(c.lastContacted) === 0).length;
  const leadersThisWeek = contacts.filter(c => c.category === 'leader' && daysSince(c.lastContacted) <= 7).length;
  const needsAttention = contacts.filter(c => daysSince(c.lastContacted) > 7).length;

  const handleAdd = () => {
    if (!newName.trim()) return;
    addContact({
      id: uuid(),
      name: newName.trim(),
      category: newCategory,
      phone: newPhone.trim() || undefined,
      notes: '',
      goal: newGoal.trim(),
      interactions: [],
      lastContacted: '',
    });
    setNewName(''); setNewCategory('friend'); setNewPhone(''); setNewGoal('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>People</Text>
          <Text style={[styles.subtitle, { color: Colors.gray }]}>{contacts.length} relationships</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: Colors.coral }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="person-add" size={18} color={Colors.white} />
        </TouchableOpacity>
      </Animated.View>

      {/* Stats Row */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.statsRow}>
        <View style={[styles.statChip, { backgroundColor: Colors.teal + '22' }]}>
          <Text style={[styles.statNum, { color: Colors.teal }]}>{disciplesToday}</Text>
          <Text style={[styles.statLabel, { color: Colors.teal }]}>Disciples today</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: Colors.deepNavy + '22' }]}>
          <Text style={[styles.statNum, { color: Colors.deepNavy }]}>{leadersThisWeek}/5</Text>
          <Text style={[styles.statLabel, { color: Colors.deepNavy }]}>Leaders this week</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: Colors.coral + '22' }]}>
          <Text style={[styles.statNum, { color: Colors.coral }]}>{needsAttention}</Text>
          <Text style={[styles.statLabel, { color: Colors.coral }]}>Need attention</Text>
        </View>
      </Animated.View>

      {/* Search */}
      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={Colors.gray} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search contacts..."
          placeholderTextColor={Colors.gray}
        />
      </Animated.View>

      {/* Category Tabs */}
      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.tab,
                activeCategory === cat && { backgroundColor: Colors.coral },
              ]}
            >
              <Text style={[
                styles.tabText,
                activeCategory === cat ? { color: Colors.white } : { color: Colors.gray },
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Contact List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🤝</Text>
            <Text style={styles.emptyText}>No contacts yet</Text>
            <Text style={styles.emptySubtext}>"Iron sharpens iron" — add your people</Text>
          </View>
        ) : (
          filtered.map((contact, i) => (
            <Animated.View key={contact.id} entering={FadeInDown.delay(i * 40).duration(300)}>
              <ContactCard
                contact={contact}
                onPress={() => navigation.navigate('ContactDetail', { contactId: contact.id })}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, { backgroundColor: bg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Add Contact</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={Colors.gray} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.fieldLabel}>Name *</Text>
            <TextInput
              style={[styles.fieldInput, { color: textColor }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Full name"
              placeholderTextColor={Colors.gray}
            />
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.catGrid}>
              {(['leader', 'disciple', 'family', 'friend', 'community', 'extended'] as Contact['category'][]).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.catChip,
                    newCategory === c && { backgroundColor: ContactCategoryColors[c] },
                  ]}
                  onPress={() => setNewCategory(c)}
                >
                  <Text style={[
                    styles.catChipText,
                    newCategory === c ? { color: Colors.white } : { color: Colors.gray },
                  ]}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput
              style={[styles.fieldInput, { color: textColor }]}
              value={newPhone}
              onChangeText={setNewPhone}
              placeholder="071 234 5678"
              placeholderTextColor={Colors.gray}
              keyboardType="phone-pad"
            />
            <Text style={styles.fieldLabel}>Relationship Goal</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldMulti, { color: textColor }]}
              value={newGoal}
              onChangeText={setNewGoal}
              placeholder="What do you want to build with this person?"
              placeholderTextColor={Colors.gray}
              multiline
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: Colors.coral }]}
              onPress={handleAdd}
            >
              <Text style={styles.saveBtnText}>Add Contact</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  statChip: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statNum: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, textAlign: 'center', fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
  tabs: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.grayLight,
  },
  tabText: { fontSize: 13, fontWeight: '600' },
  list: { paddingTop: 8, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 17, fontWeight: '700', color: Colors.neutralDark },
  emptySubtext: { fontSize: 13, color: Colors.gray, fontStyle: 'italic' },
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
  modalBody: { padding: 16, gap: 4, paddingBottom: 48 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 4,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: Colors.grayLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  fieldMulti: { minHeight: 80, textAlignVertical: 'top' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.grayLight,
  },
  catChipText: { fontSize: 13, fontWeight: '600' },
  saveBtn: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
