// Add / edit a water entry. Works even if the original bottle was deleted.

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { ValidationText } from '../components/common';
import { colors, radius, spacing } from '../theme';
import {
  todayDate,
  nowTime,
  isValidDate,
  isValidTime,
  fractionAmount,
  FRACTION_ORDER,
  FRACTIONS,
} from '../utils';

export default function EntryFormScreen({ navigation, route }) {
  const { entries, activeBottle, addEntry, updateEntry, deleteEntry } = useApp();
  const entryId = route?.params?.entryId ?? null;
  const presetDate = route?.params?.date ?? null;
  const existing = (entries ?? []).find((e) => e?.id === entryId) ?? null;

  const volumeForFractions = Math.max(
    1,
    Number(existing?.bottleVolumeMlSnapshot ?? activeBottle?.volumeMl) || 500
  );

  const [date, setDate] = useState(
    existing?.date ?? (isValidDate(presetDate) ? presetDate : todayDate())
  );
  const [time, setTime] = useState(existing?.time ?? nowTime());
  const [amount, setAmount] = useState(
    existing ? String(existing.amountMl ?? '') : ''
  );
  const [label, setLabel] = useState(existing?.label ?? '');
  const [fraction, setFraction] = useState(
    existing && FRACTIONS[existing.fraction] ? existing.fraction : 'custom'
  );
  const [error, setError] = useState('');

  const pickFraction = (key) => {
    setFraction(key);
    if (key !== 'custom') {
      setAmount(String(fractionAmount(volumeForFractions, key)));
    }
  };

  const validate = () => {
    if (!isValidDate(date)) {
      setError('Date must look like YYYY-MM-DD, for example 2026-07-05.');
      return null;
    }
    if (!isValidTime(time)) {
      setError('Time must look like HH:mm, for example 09:15.');
      return null;
    }
    const ml = Math.round(Number(String(amount).replace(',', '.')));
    if (!Number.isFinite(ml) || ml <= 0) {
      setError('Amount must be a number greater than 0 ml.');
      return null;
    }
    if (ml > 10000) {
      setError('Amount must not exceed 10000 ml.');
      return null;
    }
    setError('');
    return { date, time, amountMl: ml, label: String(label ?? '').trim(), fraction };
  };

  const onSave = () => {
    const values = validate();
    if (!values) return;
    if (existing) {
      updateEntry(existing.id, values);
    } else {
      addEntry({
        ...values,
        bottleId: activeBottle?.id ?? '',
        bottleNameSnapshot: activeBottle?.name ?? 'Bottle',
        bottleVolumeMlSnapshot: Math.max(1, Number(activeBottle?.volumeMl) || 500),
      });
    }
    navigation.goBack();
  };

  const onDelete = () => {
    if (!existing) return;
    Alert.alert('Delete entry?', 'Remove this bottle entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteEntry(existing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {existing ? (
        <Text style={styles.snapshot}>
          {'Bottle: ' +
            (existing.bottleNameSnapshot ?? 'Bottle') +
            ' (' +
            volumeForFractions +
            ' ml at the time of logging)'}
        </Text>
      ) : (
        <Text style={styles.snapshot}>
          {'Active bottle: ' + (activeBottle?.name ?? 'Bottle') + ' (' + volumeForFractions + ' ml)'}
        </Text>
      )}

      <Text style={styles.label}>Fraction</Text>
      <View style={styles.fractionRow}>
        {[...FRACTION_ORDER, 'custom'].map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.chip, fraction === key && styles.chipOn]}
            onPress={() => pickFraction(key)}
          >
            <Text style={[styles.chipText, fraction === key && styles.chipTextOn]}>
              {FRACTIONS[key].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Amount (ml)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={(v) => {
          setAmount(v);
          setFraction('custom');
        }}
        placeholder="e.g. 250"
        placeholderTextColor={colors.textFaint}
        keyboardType="numeric"
        maxLength={5}
      />

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="2026-07-05"
        placeholderTextColor={colors.textFaint}
        maxLength={10}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Time (HH:mm)</Text>
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="09:15"
        placeholderTextColor={colors.textFaint}
        maxLength={5}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Label (optional)</Text>
      <TextInput
        style={styles.input}
        value={label}
        onChangeText={setLabel}
        placeholder="e.g. after walk"
        placeholderTextColor={colors.textFaint}
        maxLength={60}
      />

      <ValidationText>{error}</ValidationText>

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save Entry</Text>
      </TouchableOpacity>

      {existing ? (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete Entry</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xl * 2 },
  snapshot: {
    fontSize: 13,
    color: colors.textSoft,
    backgroundColor: colors.sand,
    borderColor: colors.sandBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.m,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
    marginTop: spacing.m,
    marginBottom: spacing.xs,
  },
  fractionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
  chip: {
    borderColor: colors.tealSoft,
    borderWidth: 1.5,
    borderRadius: radius.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.white,
  },
  chipOn: { backgroundColor: colors.fillDeep, borderColor: colors.fillDeep },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.text },
  chipTextOn: { color: colors.white },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderWidth: 1.5,
    borderRadius: radius.m,
    padding: spacing.m,
    fontSize: 16,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.fillDeep,
    borderRadius: radius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  deleteButton: {
    borderColor: colors.danger,
    borderWidth: 1.5,
    borderRadius: radius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginTop: spacing.s,
    backgroundColor: colors.dangerSoft,
  },
  deleteButtonText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
});
