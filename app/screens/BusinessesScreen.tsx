import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, useColorScheme,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { BusinessCard } from '../components/BusinessCard';
import { useAppStore } from '../stores/useAppStore';
import { Colors } from '../utils/colors';
import { getWeekNumber } from '../utils/dates';
import { RootStackParamList } from '../../App';

const WEEK_THEMES = ['Foundation', 'Activation', 'Mastery', 'Kingdom', 'Review'];

export function BusinessesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { businesses } = useAppStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? Colors.darkBg : Colors.surface;
  const textColor = isDark ? Colors.darkText : Colors.neutralDark;

  const weekNum = getWeekNumber();
  const themeIndex = (weekNum - 1) % WEEK_THEMES.length;
  const theme = WEEK_THEMES[themeIndex];
  const themePct = Math.min(((new Date().getDay() || 7) / 7) * 100, 100);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Businesses</Text>
          <Text style={[styles.subtitle, { color: Colors.gray }]}>CEO Command View</Text>
        </Animated.View>

        {/* Weekly Theme Banner */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.weekBanner}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekLabel}>Week {weekNum}</Text>
            <Text style={styles.weekTheme}>"{theme}"</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${themePct}%` as any }]} />
          </View>
          <Text style={styles.weekHint}>Day {new Date().getDay() || 7} of 7</Text>
        </Animated.View>

        {/* Business Cards */}
        {businesses.map((biz, i) => (
          <Animated.View key={biz.id} entering={FadeInDown.delay(100 + i * 60).duration(400)}>
            <BusinessCard
              business={biz}
              onPress={() => navigation.navigate('BusinessDetail', { businessId: biz.id })}
            />
          </Animated.View>
        ))}
      </ScrollView>
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
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  weekBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.deepNavy,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  weekTheme: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '700',
  },
  progressTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primaryGold,
    borderRadius: 3,
  },
  weekHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
});
