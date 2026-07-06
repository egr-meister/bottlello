// Day detail: mini bottle scale preview + full entry list + reset day.

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import BottleScale from '../components/BottleScale';
import { EntryRow } from '../components/common';
import { colors, radius, spacing } from '../theme';
import {
  todayDate,
  isValidDate,
  formatDateLabel,
  entriesForDate,
  formatMl,
} from '../utils';

export default function DayDetailScreen({ navigation, route }) {
  const { entries, dailyGoalMl, activeBottle, deleteEntry, resetDay } = useApp();
  const rawDate = route?.params?.date;
  const date = isValidDate(rawDate) ? rawDate : todayDate();

  const dayEntries = entriesForDate(entries, date);
  const totalMl = dayEntries.reduce(
    (sum, e) => sum + Math.max(0, Number(e?.amountMl) || 0),
    0
  );
  const percent = Math.round((totalMl / Math.max(1, dailyGoalMl)) * 100);
  const goalReached = totalMl >= dailyGoalMl;

  const onDeleteEntry = (entry) => {
    Alert.alert('Delete entry?', 'Remove this bottle entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(entry?.id) },
    ]);
  };

  const onResetDay = () => {
    Alert.alert(
      'Reset this day?',
      'This will remove all bottle entries for the selected day.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset Day', style: 'destructive', onPress: () => resetDay(date) },
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.date}>{formatDateLabel(date)}</Text>

      <View style={styles.previewPanel}>
        <BottleScale
          volumeMl={activeBottle?.volumeMl}
          totalMl={totalMl}
          goalMl={dailyGoalMl}
          goalReached={goalReached}
          width={140}
        />
        <View style={styles.previewSide}>
          <Text style={styles.total}>{formatMl(totalMl)}</Text>
          <Text style={styles.goal}>{'of ' + formatMl(dailyGoalMl) + ' goal'}</Text>
          <Text style={[styles.state, goalReached && styles.stateDone]}>
            {goalReached ? 'Goal reached' : percent + '% of goal'}
          </Text>
          <Text style={styles.count}>
            {dayEntries.length + (dayEntries.length === 1 ? ' bottle entry' : ' bottle entries')}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('EntryForm', { date })}
          >
            <Text style={styles.addButtonText}>+ Add Entry</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.listTitle}>Bottle marks</Text>
      <View style={styles.listPanel}>
        {dayEntries.length ? (
          dayEntries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              onEdit={() => navigation.navigate('EntryForm', { entryId: entry.id })}
              onDelete={() => onDeleteEntry(entry)}
            />
          ))
        ) : (
          <Text style={styles.empty}>No bottle entries for this day.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={onResetDay}>
        <Text style={styles.resetButtonText}>Reset This Day</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xl * 2 },
  date: { fontSize: 18, fontWeight: '800', color: colors.text },
  previewPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: 1,
    borderRadius: radius.l,
    padding: spacing.l,
    marginTop: spacing.m,
  },
  previewSide: { flex: 1, marginLeft: spacing.m },
  total: { fontSize: 24, fontWeight: '800', color: colors.text },
  goal: { fontSize: 13, color: colors.textSoft },
  state: { fontSize: 13, color: colors.textSoft, marginTop: spacing.s },
  stateDone: { color: colors.fillDone, fontWeight: '700' },
  count: { fontSize: 12, color: colors.textFaint, marginTop: 2 },
  addButton: {
    backgroundColor: colors.fillDeep,
    borderRadius: radius.s,
    paddingVertical: spacing.s,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  addButtonText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  listPanel: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
  },
  empty: {
    fontSize: 13,
    color: colors.textFaint,
    paddingVertical: spacing.l,
    textAlign: 'center',
  },
  resetButton: {
    borderColor: colors.danger,
    borderWidth: 1.5,
    borderRadius: radius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginTop: spacing.xl,
    backgroundColor: colors.dangerSoft,
  },
  resetButtonText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
});
