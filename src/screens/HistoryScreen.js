// History: past bottle scales as calm daily cards, newest first.

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing } from '../theme';
import { historyDays, shortDateLabel, formatMl, fractionLabel } from '../utils';

export default function HistoryScreen({ navigation }) {
  const { entries, dailyGoalMl } = useApp();
  const days = historyDays(entries, dailyGoalMl);

  const renderDay = ({ item }) => {
    const percent = Math.min(
      100,
      Math.round((item.totalMl / Math.max(1, dailyGoalMl)) * 100)
    );
    return (
      <TouchableOpacity
        style={styles.dayCard}
        onPress={() => navigation.navigate('DayDetail', { date: item.date })}
        accessibilityLabel={'Open ' + item.date}
      >
        <View style={styles.dayTop}>
          <Text style={styles.dayDate}>{shortDateLabel(item.date)}</Text>
          <Text style={[styles.dayState, item.goalReached && styles.dayStateDone]}>
            {item.goalReached ? '✓ Goal reached' : percent + '%'}
          </Text>
        </View>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: percent + '%' },
              item.goalReached && { backgroundColor: colors.fillDone },
            ]}
          />
        </View>
        <View style={styles.dayBottom}>
          <Text style={styles.dayTotal}>{formatMl(item.totalMl)}</Text>
          <Text style={styles.dayMeta}>
            {item.entryCount +
              (item.entryCount === 1 ? ' entry' : ' entries') +
              (item.mostUsedBottle ? ' · ' + item.mostUsedBottle : '') +
              (item.mostUsedFraction ? ' · mostly ' + fractionLabel(item.mostUsedFraction) : '')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={days}
        keyExtractor={(item) => item.date}
        renderItem={renderDay}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No bottle history yet.</Text>
            <Text style={styles.emptySub}>
              Log your first bottle on the home screen and it will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xl * 2 },
  dayCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.l,
    marginBottom: spacing.s,
  },
  dayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayDate: { fontSize: 15, fontWeight: '800', color: colors.text },
  dayState: { fontSize: 13, color: colors.textSoft, fontWeight: '600' },
  dayStateDone: { color: colors.fillDone },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.panel,
    marginTop: spacing.s,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.fill },
  dayBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  dayTotal: { fontSize: 14, fontWeight: '700', color: colors.fillDeep },
  dayMeta: { fontSize: 12, color: colors.textFaint, flexShrink: 1, marginLeft: spacing.s },
  empty: { alignItems: 'center', paddingVertical: spacing.xl * 2 },
  emptyText: { fontSize: 15, fontWeight: '700', color: colors.textSoft },
  emptySub: {
    fontSize: 13,
    color: colors.textFaint,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
