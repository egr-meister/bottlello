// Bottlello Home: the "Bottle Scale Meter".
// A large bottle with measurement marks is the central object.
// Fraction buttons sit right next to the scale.

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import BottleScale from '../components/BottleScale';
import { ReminderCard, EntryRow } from '../components/common';
import { colors, radius, spacing } from '../theme';
import {
  todayDate,
  formatDateLabel,
  entriesForDate,
  fractionAmount,
  formatMl,
  getReminderMessage,
  FRACTION_ORDER,
  FRACTIONS,
} from '../utils';

export default function HomeScreen({ navigation }) {
  const {
    entries,
    activeBottle,
    dailyGoalMl,
    settings,
    logFraction,
    deleteEntry,
  } = useApp();

  const [now, setNow] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, [])
  );

  const today = todayDate(now);
  const todayEntries = entriesForDate(entries, today);
  const totalMl = todayEntries.reduce(
    (sum, e) => sum + Math.max(0, Number(e?.amountMl) || 0),
    0
  );
  const remaining = Math.max(0, dailyGoalMl - totalMl);
  const percent = Math.round((totalMl / dailyGoalMl) * 100);
  const goalReached = totalMl >= dailyGoalMl;
  const compact = settings?.compactMode === true;
  const reminder = getReminderMessage(entries, settings?.reminders, dailyGoalMl, now);
  const bottleVolume = Math.max(1, Number(activeBottle?.volumeMl) || 500);
  const previewEntries = todayEntries.slice(-5).reverse();

  const onFraction = (key) => {
    logFraction(key);
    setNow(new Date());
  };

  const onDeleteEntry = (entry) => {
    Alert.alert('Delete entry?', 'Remove this bottle entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(entry?.id) },
    ]);
  };

  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.m }]}
    >
      {/* Compact header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Bottlello</Text>
          <Text style={styles.date}>{formatDateLabel(today)}</Text>
        </View>
        <TouchableOpacity
          style={styles.gearButton}
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Open settings"
        >
          <Text style={styles.gearText}>⚙</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tagline}>
        Manual bottle scale · Tap how much of your bottle you drank
      </Text>

      <ReminderCard message={reminder} />

      {/* Bottle scale meter: bottle on the left, controls on the right */}
      <View style={styles.meterPanel}>
        <View style={styles.meterRow}>
          <BottleScale
            volumeMl={bottleVolume}
            totalMl={totalMl}
            goalMl={dailyGoalMl}
            goalReached={goalReached}
            width={compact ? 168 : 196}
          />
          <View style={styles.meterSide}>
            <TouchableOpacity
              style={styles.bottleChip}
              onPress={() => navigation.navigate('BottleSettings')}
              accessibilityLabel="Change active bottle"
            >
              <Text style={styles.bottleChipName} numberOfLines={1}>
                {activeBottle?.name ?? 'Bottle'}
              </Text>
              <Text style={styles.bottleChipVolume}>{formatMl(bottleVolume)}</Text>
              <Text style={styles.bottleChipHint}>Change ▸</Text>
            </TouchableOpacity>

            {FRACTION_ORDER.map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.fractionButton, key === 'full' && styles.fractionButtonFull]}
                onPress={() => onFraction(key)}
                accessibilityLabel={'Log ' + FRACTIONS[key].label + ' bottle'}
              >
                <Text
                  style={[
                    styles.fractionButtonLabel,
                    key === 'full' && styles.fractionButtonLabelFull,
                  ]}
                >
                  {FRACTIONS[key].label}
                </Text>
                <Text
                  style={[
                    styles.fractionButtonMl,
                    key === 'full' && styles.fractionButtonLabelFull,
                  ]}
                >
                  {'+' + fractionAmount(bottleVolume, key) + ' ml'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.goalRow}>
          <Text style={styles.goalMain}>
            {formatMl(totalMl).replace(' ml', '') + ' of ' + formatMl(dailyGoalMl)}
          </Text>
          <Text style={styles.goalPercent}>{percent + '% of today’s goal'}</Text>
        </View>
        <Text style={[styles.goalRemaining, goalReached && styles.goalDone]}>
          {goalReached ? 'Goal reached' : formatMl(remaining) + ' left'}
        </Text>
      </View>

      {/* Today's bottle marks */}
      <View style={styles.listPanel}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Today’s bottle marks</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EntryForm', { date: today })}
            accessibilityLabel="Add custom amount"
          >
            <Text style={styles.listAdd}>+ Custom amount</Text>
          </TouchableOpacity>
        </View>
        {previewEntries.length ? (
          previewEntries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              onEdit={() => navigation.navigate('EntryForm', { entryId: entry.id })}
              onDelete={() => onDeleteEntry(entry)}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No bottle entries today.</Text>
            <Text style={styles.emptySub}>Tap 1/4, 1/2, 3/4, or Full to start.</Text>
          </View>
        )}
        {todayEntries.length > 5 ? (
          <TouchableOpacity onPress={() => navigation.navigate('DayDetail', { date: today })}>
            <Text style={styles.moreLink}>
              {'View all ' + todayEntries.length + ' entries ▸'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Shortcut cards: past bottles, report, bottle gear */}
      <View style={styles.shortcutRow}>
        <TouchableOpacity
          style={styles.shortcut}
          onPress={() => navigation.navigate('History')}
          accessibilityLabel="Open history"
        >
          <Text style={styles.shortcutMark}>▤</Text>
          <Text style={styles.shortcutText}>Past bottles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shortcut}
          onPress={() => navigation.navigate('Statistics')}
          accessibilityLabel="Open statistics"
        >
          <Text style={styles.shortcutMark}>▥</Text>
          <Text style={styles.shortcutText}>Bottle report</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shortcut}
          onPress={() => navigation.navigate('BottleSettings')}
          accessibilityLabel="Open bottle settings"
        >
          <Text style={styles.shortcutMark}>⌂</Text>
          <Text style={styles.shortcutText}>My bottles</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footNote}>Bottle entries are added manually.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xl * 2 },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  date: { fontSize: 13, color: colors.textSoft, marginTop: 2 },
  gearButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  gearText: { fontSize: 20, color: colors.slate },
  tagline: { fontSize: 12, color: colors.textFaint, marginTop: spacing.xs },
  meterPanel: {
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: 1,
    borderRadius: radius.l,
    padding: spacing.l,
    marginTop: spacing.l,
  },
  meterRow: { flexDirection: 'row', alignItems: 'center' },
  meterSide: { flex: 1, marginLeft: spacing.s },
  bottleChip: {
    backgroundColor: colors.sand,
    borderColor: colors.sandBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.s,
    marginBottom: spacing.s,
  },
  bottleChipName: { fontSize: 14, fontWeight: '700', color: colors.text },
  bottleChipVolume: { fontSize: 12, color: colors.textSoft },
  bottleChipHint: { fontSize: 11, color: colors.teal, marginTop: 2, fontWeight: '600' },
  fractionButton: {
    backgroundColor: colors.white,
    borderColor: colors.tealSoft,
    borderWidth: 1.5,
    borderRadius: radius.m,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    marginTop: spacing.s,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fractionButtonFull: { backgroundColor: colors.fillDeep, borderColor: colors.fillDeep },
  fractionButtonLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  fractionButtonMl: { fontSize: 12, color: colors.textSoft, fontWeight: '600' },
  fractionButtonLabelFull: { color: colors.white },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: spacing.m,
  },
  goalMain: { fontSize: 18, fontWeight: '800', color: colors.text },
  goalPercent: { fontSize: 13, color: colors.textSoft },
  goalRemaining: { fontSize: 13, color: colors.textSoft, marginTop: 2 },
  goalDone: { color: colors.fillDone, fontWeight: '700' },
  listPanel: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.l,
    padding: spacing.l,
    marginTop: spacing.l,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  listTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  listAdd: { fontSize: 13, fontWeight: '700', color: colors.fillDeep },
  empty: { paddingVertical: spacing.l, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.textSoft, fontWeight: '600' },
  emptySub: { fontSize: 12, color: colors.textFaint, marginTop: 2 },
  moreLink: {
    fontSize: 13,
    color: colors.teal,
    fontWeight: '700',
    marginTop: spacing.s,
    textAlign: 'center',
  },
  shortcutRow: { flexDirection: 'row', marginTop: spacing.l, gap: spacing.s },
  shortcut: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  shortcutMark: { fontSize: 18, color: colors.teal },
  shortcutText: { fontSize: 12, fontWeight: '700', color: colors.textSoft, marginTop: 2 },
  footNote: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textFaint,
    marginTop: spacing.l,
  },
});
