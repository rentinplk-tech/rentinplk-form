import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  Dimensions, FlatList,
} from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../stores/useAppStore';
import { Colors, ContactCategoryColors } from '../utils/colors';
import { Contact } from '../types';

const { width } = Dimensions.get('window');

function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

const PRAYER_TIMES = ['04:30', '05:00', '05:30', '06:00'];

interface OnboardingProps {
  onDone: () => void;
}

export function OnboardingScreen({ onDone }: OnboardingProps) {
  const { setUserName, setPrayerTime, addContact, setHasOnboarded } = useAppStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedTime, setSelectedTime] = useState('05:00');
  const [contacts, setContacts] = useState([
    { name: '', category: 'disciple' as Contact['category'] },
    { name: '', category: 'leader' as Contact['category'] },
    { name: '', category: 'disciple' as Contact['category'] },
    { name: '', category: 'friend' as Contact['category'] },
    { name: '', category: 'family' as Contact['category'] },
  ]);

  const steps = [
    {
      title: 'Welcome, Kingdom Builder',
      subtitle: 'Your Command Centre is about to go live.\nBuilt for purpose, strategy, and God.',
      emoji: '👑',
      color: Colors.primaryGold,
    },
    {
      title: "What's your name?",
      subtitle: 'How should your Command Centre address you?',
      emoji: '✝️',
      color: Colors.deepNavy,
    },
    {
      title: 'Your Prayer Time',
      subtitle: 'When do you meet with God every morning?',
      emoji: '🙏',
      color: Colors.primaryGold,
    },
    {
      title: 'Add Your First 5',
      subtitle: 'Your people are your greatest asset.\nAdd 5 key relationships to start.',
      emoji: '🤝',
      color: Colors.coral,
    },
    {
      title: "You're Ready.",
      subtitle: '"Commit to the Lord whatever you do,\nand he will establish your plans."\n— Proverbs 16:3',
      emoji: '🚀',
      color: Colors.teal,
    },
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setUserName(name.trim());
    }
    if (step === 2) {
      setPrayerTime(selectedTime);
    }
    if (step === 3) {
      contacts.filter(c => c.name.trim()).forEach(c => {
        addContact({
          id: uuid(),
          name: c.name.trim(),
          category: c.category,
          notes: '',
          goal: '',
          interactions: [],
          lastContacted: '',
        });
      });
    }
    if (step === steps.length - 1) {
      setHasOnboarded(true);
      onDone();
      return;
    }
    setStep(s => s + 1);
  };

  const canProgress = step === 1 ? name.trim().length > 0 : true;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: Colors.surface }]}>
      {/* Progress dots */}
      <View style={styles.dots}>
        {steps.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i <= step ? current.color : Colors.grayLight },
              i === step && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View key={step} entering={FadeInDown.duration(400)} style={styles.content}>
          <Text style={styles.emoji}>{current.emoji}</Text>
          <Text style={[styles.title, { color: Colors.neutralDark }]}>{current.title}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>

          {step === 1 && (
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Warrior"
              placeholderTextColor={Colors.gray}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
          )}

          {step === 2 && (
            <View style={styles.timeGrid}>
              {PRAYER_TIMES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.timeBtn,
                    selectedTime === t && { backgroundColor: Colors.primaryGold },
                  ]}
                  onPress={() => setSelectedTime(t)}
                >
                  <Text style={[
                    styles.timeBtnText,
                    selectedTime === t ? { color: Colors.white } : { color: Colors.gray },
                  ]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 3 && (
            <View style={styles.contactsList}>
              {contacts.map((c, i) => (
                <View key={i} style={styles.contactRow}>
                  <TextInput
                    style={styles.contactInput}
                    value={c.name}
                    onChangeText={(t) => {
                      const updated = [...contacts];
                      updated[i] = { ...updated[i], name: t };
                      setContacts(updated);
                    }}
                    placeholder={`Contact ${i + 1} name`}
                    placeholderTextColor={Colors.gray}
                  />
                  <View style={[styles.catBadge, { backgroundColor: ContactCategoryColors[c.category] }]}>
                    <Text style={styles.catText}>
                      {c.category.charAt(0).toUpperCase() + c.category.slice(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity onPress={() => setStep(s => s - 1)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.gray} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextBtn,
            { backgroundColor: canProgress ? current.color : Colors.grayLight },
            { flex: step > 0 ? 1 : undefined, width: step === 0 ? width - 64 : undefined },
          ]}
          onPress={handleNext}
          disabled={!canProgress}
        >
          <Text style={[styles.nextBtnText, { color: canProgress ? Colors.white : Colors.gray }]}>
            {step === steps.length - 1 ? "Let's Go 🚀" : 'Continue'}
          </Text>
          {step < steps.length - 1 && (
            <Ionicons name="arrow-forward" size={18} color={canProgress ? Colors.white : Colors.gray} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  nameInput: {
    marginTop: 16,
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.primaryGold,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: Colors.neutralDark,
    textAlign: 'center',
    fontWeight: '600',
  },
  timeGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  timeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.grayLight,
    minWidth: 100,
    alignItems: 'center',
  },
  timeBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  contactsList: {
    marginTop: 16,
    width: '100%',
    gap: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.grayLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.neutralDark,
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  catText: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 32,
    paddingBottom: 24,
    paddingTop: 12,
    alignItems: 'center',
  },
  backBtn: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
