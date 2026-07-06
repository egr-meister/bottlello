// Daily goal settings with friendly validation.

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { ValidationText } from '../components/common';
import { colors, radius, spacing } from '../theme';
import { formatMl } from '../utils';

const DEFAULT_GOAL = 2000;

export default function GoalSettingsScreen({ navigation }) {
  const { dailyGoalMl, setDailyGoal } = useApp();
  const [goal, setGoal] = useState(String(dailyGoalMl ?? DEFAULT_GOAL));
  const [error, setError] = useState('');

  const onSave = () => {
    const value = Math.round(Number(String(goal).replace(',', '.')));
    if (!Number.isFinite(value) || value <= 0) {
      setError('Goal must be a number greater than 0 ml.');
      return;
    }
    if (value > 10000) {
      setError('Goal should not exceed 10000 ml.');
      return;
    }
    setError('');
    setDailyGoal(value);
    navigation.goBack();
  };

  const onReset = () => {
    setGoal(String(DEFAULT_GOAL));
    setError('');
    setDailyGoal(DEFAULT_GOAL);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.current}>{'Current goal: ' + formatMl(dailyGoalMl)}</Text>

      <Text style={styles.label}>Daily water goal (ml)</Text>
      <TextInput
        style={styles.input}
        value={goal}
        onChangeText={setGoal}
        keyboardType="numeric"
        maxLength={5}
        placeholder="2000"
        placeholderTextColor={colors.textFaint}
      />
      <Text style={styles.helper}>
        The bottle scale fill on the home screen is measured against this goal.
      </Text>

      <ValidationText>{error}</ValidationText>

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save Goal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>Reset to Default (2000 ml)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xl * 2 },
  current: {
    fontSize: 14,
    color: colors.textSoft,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.m,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
    marginTop: spacing.l,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderWidth: 1.5,
    borderRadius: radius.m,
    padding: spacing.m,
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
  },
  helper: { fontSize: 12, color: colors.textFaint, marginTop: spacing.xs },
  saveButton: {
    backgroundColor: colors.fillDeep,
    borderRadius: radius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  resetButton: {
    borderColor: colors.tealSoft,
    borderWidth: 1.5,
    borderRadius: radius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginTop: spacing.s,
    backgroundColor: colors.white,
  },
  resetButtonText: { color: colors.slate, fontSize: 14, fontWeight: '700' },
});
