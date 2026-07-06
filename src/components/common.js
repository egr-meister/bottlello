// Small shared UI pieces for Bottlello.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { fractionLabel, formatMl } from '../utils';

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function ReminderCard({ message }) {
  if (!message) return null;
  return (
    <View style={styles.reminder}>
      <Text style={styles.reminderMark}>~</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.reminderText}>{message}</Text>
        <Text style={styles.reminderSub}>In-app reminder · shown only while the app is open</Text>
      </View>
    </View>
  );
}

export function EntryRow({ entry, onEdit, onDelete }) {
  if (!entry) return null;
  return (
    <View style={styles.entryRow}>
      <View style={styles.entryMark} />
      <Text style={styles.entryTime}>{entry.time ?? '--:--'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.entryMain} numberOfLines={1}>
          {(entry.bottleNameSnapshot ?? 'Bottle') + ' — ' + fractionLabel(entry.fraction)}
        </Text>
        {entry.label ? (
          <Text style={styles.entryLabel} numberOfLines={1}>
            {entry.label}
          </Text>
        ) : null}
      </View>
      <Text style={styles.entryAmount}>{formatMl(entry.amountMl)}</Text>
      {onEdit ? (
        <TouchableOpacity onPress={onEdit} style={styles.entryAction} accessibilityLabel="Edit entry">
          <Text style={styles.entryActionText}>Edit</Text>
        </TouchableOpacity>
      ) : null}
      {onDelete ? (
        <TouchableOpacity onPress={onDelete} style={styles.entryAction} accessibilityLabel="Delete entry">
          <Text style={[styles.entryActionText, { color: colors.danger }]}>Del</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function ValidationText({ children }) {
  if (!children) return null;
  return <Text style={styles.validation}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.l,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.s,
    marginTop: spacing.l,
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.reminder,
    borderColor: colors.reminderBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.m,
    marginTop: spacing.m,
  },
  reminderMark: {
    fontSize: 22,
    color: colors.teal,
    marginRight: spacing.m,
    fontWeight: '700',
  },
  reminderText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  reminderSub: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 2,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  entryMark: {
    width: 4,
    height: 26,
    borderRadius: 2,
    backgroundColor: colors.tealSoft,
    marginRight: spacing.s,
  },
  entryTime: {
    width: 46,
    fontSize: 13,
    color: colors.textSoft,
    fontVariant: ['tabular-nums'],
  },
  entryMain: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  entryLabel: {
    fontSize: 12,
    color: colors.textFaint,
  },
  entryAmount: {
    fontSize: 14,
    color: colors.fillDeep,
    fontWeight: '700',
    marginLeft: spacing.s,
  },
  entryAction: {
    marginLeft: spacing.s,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radius.s,
    backgroundColor: colors.panel,
  },
  entryActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate,
  },
  validation: {
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.xs,
  },
});
