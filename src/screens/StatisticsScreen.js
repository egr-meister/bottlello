// Statistics: a calm "bottle usage report" with simple views only.

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { SectionTitle } from '../components/common';
import { colors, radius, spacing } from '../theme';
import {
  computeStatistics,
  formatMl,
  fractionLabel,
  shortDateLabel,
  FRACTION_ORDER,
} from '../utils';

function StatCell({ label, value }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function StatisticsScreen() {
  const { entries, dailyGoalMl } = useApp();
  const stats = computeStatistics(entries, dailyGoalMl);
  const maxWeekTotal = Math.max(1, ...stats.week.map((d) => d.totalMl), dailyGoalMl);
  const fractionMax = Math.max(
    1,
    ...Object.values(stats.fractionCounts ?? {}).map((n) => Number(n) || 0)
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionTitle>Totals</SectionTitle>
      <View style={styles.grid}>
        <StatCell label="Today" value={formatMl(stats.todayTotal)} />
        <StatCell label="Last 7 days" value={formatMl(stats.last7Total)} />
        <StatCell label="Last 30 days" value={formatMl(stats.last30Total)} />
        <StatCell label="7-day average" value={formatMl(stats.dailyAverage)} />
      </View>

      <SectionTitle>Last 7 days</SectionTitle>
      <View style={styles.chartPanel}>
        <View style={styles.chartRow}>
          {stats.week.map((day) => {
            const h = Math.max(4, Math.round((day.totalMl / maxWeekTotal) * 90));
            const reached = day.totalMl >= dailyGoalMl;
            return (
              <View key={day.date} style={styles.chartCol}>
                <View
                  style={[
                    styles.chartBar,
                    { height: h },
                    reached && { backgroundColor: colors.fillDone },
                  ]}
                />
                <Text style={styles.chartLabel}>
                  {shortDateLabel(day.date).slice(0, 3)}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.chartFoot}>
          {'Goal days: ' + stats.goalDays7 + ' of 7'}
        </Text>
      </View>

      <SectionTitle>Bottle fractions</SectionTitle>
      <View style={styles.panel}>
        {[...FRACTION_ORDER, 'custom'].map((key) => {
          const count = Number(stats.fractionCounts?.[key]) || 0;
          const w = Math.round((count / fractionMax) * 100);
          return (
            <View key={key} style={styles.fractionRow}>
              <Text style={styles.fractionName}>{fractionLabel(key)}</Text>
              <View style={styles.fractionTrack}>
                <View style={[styles.fractionFill, { width: Math.max(2, w) + '%' }]} />
              </View>
              <Text style={styles.fractionCount}>{count}</Text>
            </View>
          );
        })}
        <Text style={styles.panelFoot}>
          {'Full bottles logged: ' +
            (stats.fractionCounts?.full ?? 0) +
            ' · Half bottles logged: ' +
            (stats.fractionCounts?.half ?? 0)}
        </Text>
      </View>

      <SectionTitle>Bottle usage</SectionTitle>
      <View style={styles.grid}>
        <StatCell label="Total bottle entries" value={String(stats.totalEntries)} />
        <StatCell
          label="Best day"
          value={
            stats.bestDay
              ? formatMl(stats.bestDay.totalMl)
              : '—'
          }
        />
        <StatCell
          label="Most used bottle"
          value={stats.mostUsedBottle ?? '—'}
        />
        <StatCell
          label="Most used fraction"
          value={stats.mostUsedFraction ? fractionLabel(stats.mostUsedFraction) : '—'}
        />
      </View>
      {stats.bestDay ? (
        <Text style={styles.bestDayNote}>
          {'Best day: ' + shortDateLabel(stats.bestDay.date) + ' · ' + formatMl(stats.bestDay.totalMl)}
        </Text>
      ) : (
        <Text style={styles.bestDayNote}>Log a few bottles to see your report grow.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xl * 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
  statCell: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.m,
  },
  statValue: { fontSize: 17, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSoft, marginTop: 2 },
  chartPanel: {
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.l,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110,
  },
  chartCol: { alignItems: 'center', flex: 1 },
  chartBar: {
    width: 18,
    borderRadius: 5,
    backgroundColor: colors.fill,
  },
  chartLabel: { fontSize: 10, color: colors.textSoft, marginTop: 4 },
  chartFoot: {
    fontSize: 12,
    color: colors.textSoft,
    marginTop: spacing.s,
    fontWeight: '600',
  },
  panel: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.l,
  },
  fractionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s },
  fractionName: { width: 60, fontSize: 13, fontWeight: '700', color: colors.text },
  fractionTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.panel,
    overflow: 'hidden',
    marginHorizontal: spacing.s,
  },
  fractionFill: { height: 10, borderRadius: 5, backgroundColor: colors.teal },
  fractionCount: { width: 30, textAlign: 'right', fontSize: 13, color: colors.textSoft },
  panelFoot: { fontSize: 12, color: colors.textFaint, marginTop: spacing.s },
  bestDayNote: {
    fontSize: 12,
    color: colors.textFaint,
    marginTop: spacing.m,
    textAlign: 'center',
  },
});
