// Reminder settings: in-app reminder cards only. No system notifications.

import React from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing } from '../theme';

function SwitchRow({ label, sub, value, onValueChange, disabled }) {
  return (
    <View style={[styles.row, disabled && { opacity: 0.5 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value === true}
        onValueChange={onValueChange}
        disabled={disabled === true}
        trackColor={{ false: colors.cardBorder, true: colors.tealSoft }}
        thumbColor={value ? colors.teal : colors.white}
      />
    </View>
  );
}

export default function ReminderSettingsScreen() {
  const { settings, setReminders } = useApp();
  const reminders = settings?.reminders ?? {};
  const enabled = reminders.enabled === true;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.note}>
        <Text style={styles.noteText}>
          These are in-app reminder cards only. They do not send phone
          notifications. Reminders appear on the home screen while the app is
          open, based on today’s bottle progress and the current time.
        </Text>
      </View>

      <SwitchRow
        label="In-app reminders"
        sub="Show gentle reminder cards on the home screen"
        value={enabled}
        onValueChange={(v) => setReminders({ enabled: v === true })}
      />
      <SwitchRow
        label="Morning reminder"
        sub="After 11:00 if no bottles are logged yet"
        value={reminders.morningEnabled === true}
        onValueChange={(v) => setReminders({ morningEnabled: v === true })}
        disabled={!enabled}
      />
      <SwitchRow
        label="Afternoon reminder"
        sub="After 16:00 if today is below half of the goal"
        value={reminders.afternoonEnabled === true}
        onValueChange={(v) => setReminders({ afternoonEnabled: v === true })}
        disabled={!enabled}
      />
      <SwitchRow
        label="Evening reminder"
        sub="After 19:00 if the goal is not reached yet"
        value={reminders.eveningEnabled === true}
        onValueChange={(v) => setReminders({ eveningEnabled: v === true })}
        disabled={!enabled}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xl * 2 },
  note: {
    backgroundColor: colors.sand,
    borderColor: colors.sandBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  noteText: { fontSize: 13, color: colors.textSoft, lineHeight: 19 },
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
});
