import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Contact } from '../types';
import { ContactCategoryColors, Colors } from '../utils/colors';
import { daysSince, daysSinceLabel } from '../utils/dates';

interface Props {
  contact: Contact;
  onPress: () => void;
}

function urgencyColor(days: number): string {
  if (days <= 3) return Colors.teal;
  if (days <= 7) return Colors.amber;
  return Colors.coral;
}

export function ContactCard({ contact, onPress }: Props) {
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const catColor = ContactCategoryColors[contact.category];
  const days = daysSince(contact.lastContacted);
  const urgency = urgencyColor(days);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.avatar, { backgroundColor: catColor }]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{contact.name}</Text>
        <View style={styles.meta}>
          <View style={[styles.catBadge, { backgroundColor: catColor + '22' }]}>
            <Text style={[styles.catText, { color: catColor }]}>
              {contact.category.charAt(0).toUpperCase() + contact.category.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.lastContact, { color: urgency }]}>{daysSinceLabel(contact.lastContacted)}</Text>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutralDark,
  },
  meta: {
    flexDirection: 'row',
    gap: 6,
  },
  catBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catText: {
    fontSize: 11,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  lastContact: {
    fontSize: 11,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 18,
    color: Colors.gray,
  },
});
