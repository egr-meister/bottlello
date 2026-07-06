// App settings: shortcuts, compact mode, data actions, disclaimers.

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { SectionTitle } from '../components/common';
import { colors, radius, spacing } from '../theme';
import { todayDate, formatMl } from '../utils';

function LinkRow({ label, sub, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Text style={styles.chevron}>▸</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const {
    settings,
    dailyGoalMl,
    setCompactMode,
    setOnboardingCompleted,
    resetDay,
    deleteAllEntries,
    resetAllData,
  } = useApp();

  const onResetToday = () => {
    Alert.alert(
      'Reset this day?',
      'This will remove all bottle entries for the selected day.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetDay(todayDate()) },
      ]
    );
  };

  const onDeleteAllEntries = () => {
    Alert.alert(
      'Delete all bottle entries?',
      'This removes every logged entry from history. Bottles and settings are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', style: 'destructive', onPress: deleteAllEntries },
      ]
    );
  };

  const onResetAll = () => {
    Alert.alert(
      'Reset all local data?',
      'This removes all bottles, entries, goals, and settings stored on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset Everything', style: 'destructive', onPress: () => resetAllData() },
      ]
    );
  };

  const onShowOnboarding = () => {
    setOnboardingCompleted(false);
    navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionTitle>Tracking</SectionTitle>
      <LinkRow
        label="Daily goal"
        sub={'Currently ' + formatMl(dailyGoalMl)}
        onPress={() => navigation.navigate('GoalSettings')}
      />
      <LinkRow
        label="Bottle settings"
        sub="Active bottle, custom bottles, favorites"
        onPress={() => navigation.navigate('BottleSettings')}
      />
      <LinkRow
        label="In-app reminders"
        sub="Gentle reminder cards, no notifications"
        onPress={() => navigation.navigate('ReminderSettings')}
      />

      <SectionTitle>Appearance</SectionTitle>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Compact mode</Text>
          <Text style={styles.rowSub}>Smaller bottle scale on the home screen</Text>
        </View>
        <Switch
          value={settings?.compactMode === true}
          onValueChange={(v) => setCompactMode(v === true)}
          trackColor={{ false: colors.cardBorder, true: colors.tealSoft }}
          thumbColor={settings?.compactMode ? colors.teal : colors.white}
        />
      </View>
      <LinkRow label="Show onboarding again" onPress={onShowOnboarding} />

      <SectionTitle>Data</SectionTitle>
      <LinkRow label="Reset today" sub="Remove today’s bottle entries" onPress={onResetToday} />
      <LinkRow
        label="Delete all bottle entries"
        sub="Clears history and statistics"
        onPress={onDeleteAllEntries}
      />
      <LinkRow
        label="Reset all local data"
        sub="Bottles, entries, goal, and settings"
        onPress={onResetAll}
      />

      <SectionTitle>About</SectionTitle>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>Bottlello 1.0</Text>
        <Text style={styles.aboutText}>
          A manual bottle-scale water tracker. Bottle entries are added
          manually. Bottlello does not detect drinking automatically and does
          not connect to Health Connect, Google Fit, sensors, or wearable
          devices. It is not a medical app and does not provide medical advice.
        </Text>
        <Text style={styles.aboutHeading}>Privacy</Text>
        <Text style={styles.aboutText}>
          Bottlello stores bottles, bottle entries, goals, reminders, history,
          and statistics only on this device. No account, no ads, no analytics,
          no internet connection, no sensors, no Google Fit, no Health Connect,
          and no notification permission. The app works fully in airplane mode.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xl * 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  rowLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  rowSub: { fontSize: 12, color: colors.textFaint, marginTop: 2 },
  chevron: { fontSize: 16, color: colors.textFaint, marginLeft: spacing.s },
  aboutCard: {
    backgroundColor: colors.sand,
    borderColor: colors.sandBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.l,
  },
  aboutTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  aboutHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.m,
  },
  aboutText: { fontSize: 12, color: colors.textSoft, lineHeight: 18, marginTop: spacing.xs },
});
