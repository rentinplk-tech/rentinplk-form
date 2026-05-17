import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
  TextInput, useColorScheme,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HabitGrid } from '../components/HabitGrid';
import { useAppStore } from '../stores/useAppStore';
import { Colors } from '../utils/colors';
import { todayString, getMonthYear } from '../utils/dates';
import { SkillTrack, LearningSession } from '../types';

const LEVEL_COLORS: Record<string, string> = {
  beginner: Colors.gray,
  intermediate: Colors.teal,
  advanced: Colors.purple,
  master: Colors.primaryGold,
};

const XP_FOR_LEVEL: Record<string, number> = {
  beginner: 100,
  intermediate: 500,
  advanced: 1500,
  master: 5000,
};

const QUOTES = [
  'Consistency beats intensity.',
  'Small disciplines repeated with consistency every day lead to great achievements.',
  'Excellence is a habit, not an act.',
  'The man who moves a mountain begins by carrying away small stones.',
  'Knowledge is the new currency.',
];

function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

interface TrackCardProps {
  track: SkillTrack;
  onPress: () => void;
}

function TrackCard({ track, onPress }: TrackCardProps) {
  const levelColor = LEVEL_COLORS[track.level];
  const maxXP = XP_FOR_LEVEL[track.level];
  const pct = Math.min(track.xp / maxXP, 1);
  const sessionsThisWeek = track.sessions.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  return (
    <TouchableOpacity style={styles.trackCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.trackTop}>
        <Ionicons name={track.icon as any} size={22} color={levelColor} />
        <View style={[styles.levelBadge, { backgroundColor: levelColor + '22' }]}>
          <Text style={[styles.levelText, { color: levelColor }]}>
            {track.level.charAt(0).toUpperCase() + track.level.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={styles.trackName}>{track.name}</Text>
      <View style={styles.xpTrack}>
        <View style={[styles.xpFill, { width: `${pct * 100}%` as any, backgroundColor: levelColor }]} />
      </View>
      <Text style={styles.trackMeta}>{track.xp}/{maxXP} XP • {sessionsThisWeek} sessions this week</Text>
    </TouchableOpacity>
  );
}

interface TrackDetailProps {
  track: SkillTrack;
  onClose: () => void;
  onLogSession: (session: LearningSession) => void;
  onCompleteMilestone: (index: number) => void;
}

function TrackDetail({ track, onClose, onLogSession, onCompleteMilestone }: TrackDetailProps) {
  const [showLog, setShowLog] = useState(false);
  const [duration, setDuration] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [keyInsight, setKeyInsight] = useState('');
  const levelColor = LEVEL_COLORS[track.level];

  const handleLog = () => {
    if (!topic.trim() || !duration) return;
    onLogSession({
      id: uuid(),
      date: new Date().toISOString(),
      durationMinutes: parseInt(duration) || 0,
      topic: topic.trim(),
      notes: notes.trim(),
      keyInsight: keyInsight.trim(),
    });
    setDuration(''); setTopic(''); setNotes(''); setKeyInsight('');
    setShowLog(false);
  };

  const totalHours = track.sessions.reduce((s, ses) => s + ses.durationMinutes, 0) / 60;

  return (
    <SafeAreaView style={[styles.detailSafe, { backgroundColor: Colors.surface }]}>
      <View style={[styles.detailHeader, { backgroundColor: levelColor }]}>
        <TouchableOpacity onPress={onClose} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Ionicons name={track.icon as any} size={32} color={Colors.white} />
        <Text style={styles.detailTitle}>{track.name}</Text>
        <Text style={styles.detailMeta}>
          {track.level.charAt(0).toUpperCase() + track.level.slice(1)} • {track.xp} XP • {totalHours.toFixed(1)}h total
        </Text>
        {track.streakDays > 0 && (
          <Text style={styles.streak}>🔥 {track.streakDays} day streak</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.detailScroll}>
        <TouchableOpacity
          style={[styles.logSessionBtn, { backgroundColor: levelColor }]}
          onPress={() => setShowLog(!showLog)}
        >
          <Ionicons name={showLog ? 'chevron-up' : 'add-circle-outline'} size={18} color={Colors.white} />
          <Text style={styles.logSessionBtnText}>{showLog ? 'Close' : 'Log Session'}</Text>
        </TouchableOpacity>

        {showLog && (
          <View style={styles.logForm}>
            <Text style={styles.fieldLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.logInput}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="45"
              placeholderTextColor={Colors.gray}
            />
            <Text style={styles.fieldLabel}>Topic *</Text>
            <TextInput
              style={styles.logInput}
              value={topic}
              onChangeText={setTopic}
              placeholder="What did you study?"
              placeholderTextColor={Colors.gray}
            />
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={[styles.logInput, styles.logTextArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Session notes..."
              placeholderTextColor={Colors.gray}
              multiline
            />
            <Text style={styles.fieldLabel}>Key Insight</Text>
            <TextInput
              style={styles.logInput}
              value={keyInsight}
              onChangeText={setKeyInsight}
              placeholder="One thing that clicked..."
              placeholderTextColor={Colors.gray}
            />
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: levelColor }]} onPress={handleLog}>
              <Text style={styles.submitBtnText}>Save Session</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Milestones</Text>
        {track.milestones.map((m, i) => (
          <TouchableOpacity key={i} style={styles.milestoneRow} onPress={() => onCompleteMilestone(i)}>
            <Ionicons
              name={m.done ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={m.done ? levelColor : Colors.gray}
            />
            <Text style={[styles.milestoneText, m.done && { textDecorationLine: 'line-through', color: Colors.gray }]}>
              {m.text}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Session History</Text>
        {track.sessions.length === 0 ? (
          <Text style={styles.emptyText}>No sessions yet — log your first above</Text>
        ) : (
          track.sessions.map((s) => (
            <View key={s.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTopic}>{s.topic}</Text>
                <Text style={styles.sessionDur}>{s.durationMinutes}min</Text>
              </View>
              {s.keyInsight ? <Text style={styles.sessionInsight}>💡 {s.keyInsight}</Text> : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export function GrowthScreen() {
  const { skillTracks, logSession, completeMilestone, habitLog, toggleHabit } = useAppStore();
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? Colors.darkBg : Colors.surface;
  const textColor = isDark ? Colors.darkText : Colors.neutralDark;

  const track = selectedTrack ? skillTracks.find(t => t.id === selectedTrack) : null;

  const totalHoursWeek = skillTracks.reduce((sum, t) => {
    const weekSessions = t.sessions.filter(s => {
      const d = new Date(s.date);
      const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
    return sum + weekSessions.reduce((s2, ses) => s2 + ses.durationMinutes, 0) / 60;
  }, 0);

  const quoteIndex = new Date().getDate() % QUOTES.length;

  if (track) {
    return (
      <Modal visible animationType="slide">
        <TrackDetail
          track={track}
          onClose={() => setSelectedTrack(null)}
          onLogSession={(s) => logSession(track.id, s)}
          onCompleteMilestone={(i) => completeMilestone(track.id, i)}
        />
      </Modal>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Growth</Text>
          <Text style={[styles.subtitle, { color: Colors.gray }]}>Polymath in progress</Text>
        </Animated.View>

        {/* Weekly Summary */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.weeklySummary}>
          <Text style={styles.weeklyHours}>{totalHoursWeek.toFixed(1)}h</Text>
          <Text style={styles.weeklyLabel}>Learning hours this week</Text>
          <Text style={styles.quote}>"{QUOTES[quoteIndex]}"</Text>
        </Animated.View>

        {/* Skill Track Grid */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Skill Tracks</Text>
        <View style={styles.trackGrid}>
          {skillTracks.map((t, i) => (
            <Animated.View key={t.id} entering={FadeInDown.delay(100 + i * 50).duration(300)} style={styles.trackGridItem}>
              <TrackCard track={t} onPress={() => setSelectedTrack(t.id)} />
            </Animated.View>
          ))}
        </View>

        {/* Habit Grid */}
        <HabitGrid
          habitLog={habitLog}
          onToggle={toggleHabit}
          monthYear={getMonthYear()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 2 },
  weeklySummary: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.deepNavy,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  weeklyHours: { fontSize: 36, fontWeight: '800', color: Colors.white },
  weeklyLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  quote: { fontSize: 12, color: Colors.primaryGold, fontStyle: 'italic', textAlign: 'center', marginTop: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginHorizontal: 16, marginBottom: 10 },
  trackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    gap: 0,
  },
  trackGridItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  trackCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  trackTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  levelText: { fontSize: 10, fontWeight: '700' },
  trackName: { fontSize: 13, fontWeight: '700', color: Colors.neutralDark, lineHeight: 17 },
  xpTrack: {
    height: 4,
    backgroundColor: Colors.grayLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 2,
  },
  trackMeta: { fontSize: 10, color: Colors.gray },

  // Detail styles
  detailSafe: { flex: 1 },
  detailHeader: {
    padding: 20,
    paddingTop: 48,
    alignItems: 'center',
    gap: 6,
  },
  back: { position: 'absolute', top: 16, left: 16, padding: 4 },
  detailTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  detailMeta: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  streak: { fontSize: 13, color: Colors.white, fontWeight: '600' },
  detailScroll: { padding: 16, paddingBottom: 48 },
  logSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  logSessionBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  logForm: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  fieldLabel: {
    fontSize: 11,
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 3,
  },
  logInput: {
    borderWidth: 1.5,
    borderColor: Colors.grayLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.neutralDark,
  },
  logTextArea: { minHeight: 72, textAlignVertical: 'top' },
  submitBtn: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  milestoneText: { flex: 1, fontSize: 14, color: Colors.neutralDark },
  sessionCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 4,
  },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  sessionTopic: { fontSize: 14, fontWeight: '600', color: Colors.neutralDark, flex: 1 },
  sessionDur: { fontSize: 12, color: Colors.gray },
  sessionInsight: { fontSize: 12, color: Colors.purple },
  emptyText: { fontSize: 13, color: Colors.gray, textAlign: 'center', paddingVertical: 16 },
});
