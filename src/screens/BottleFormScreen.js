// Add / edit a bottle with friendly validation. Never crashes on bad input.

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { ValidationText } from '../components/common';
import { colors, radius, spacing } from '../theme';

export default function BottleFormScreen({ navigation, route }) {
  const { bottles, addBottle, updateBottle, deleteBottle } = useApp();
  const bottleId = route?.params?.bottleId ?? null;
  const existing = (bottles ?? []).find((b) => b?.id === bottleId) ?? null;

  const [name, setName] = useState(existing?.name ?? '');
  const [volume, setVolume] = useState(
    existing ? String(existing.volumeMl ?? '') : ''
  );
  const [favorite, setFavorite] = useState(existing?.favorite === true);
  const [error, setError] = useState('');

  const validate = () => {
    if (!String(name).trim()) {
      setError('Please give the bottle a name.');
      return null;
    }
    const vol = Math.round(Number(String(volume).replace(',', '.')));
    if (!Number.isFinite(vol) || vol <= 0) {
      setError('Volume must be a number greater than 0 ml.');
      return null;
    }
    if (vol > 5000) {
      setError('Volume must not exceed 5000 ml.');
      return null;
    }
    setError('');
    return { name: String(name).trim(), volumeMl: vol, favorite };
  };

  const onSave = () => {
    const values = validate();
    if (!values) return;
    if (existing) {
      updateBottle(existing.id, values);
    } else {
      addBottle(values);
    }
    navigation.goBack();
  };

  const onDelete = () => {
    if (!existing) return;
    if (existing.custom !== true) {
      Alert.alert(
        'Default bottle',
        'Default bottles cannot be deleted. You can edit them or use Reset Default Bottles.'
      );
      return;
    }
    Alert.alert('Delete bottle?', 'Past entries keep their saved bottle name and volume.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBottle(existing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Bottle name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Office Bottle"
        placeholderTextColor={colors.textFaint}
        maxLength={40}
      />

      <Text style={styles.label}>Volume (ml)</Text>
      <TextInput
        style={styles.input}
        value={volume}
        onChangeText={setVolume}
        placeholder="e.g. 600"
        placeholderTextColor={colors.textFaint}
        keyboardType="numeric"
        maxLength={5}
      />
      <Text style={styles.helper}>Between 1 and 5000 ml.</Text>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Mark as favorite</Text>
        <Switch
          value={favorite}
          onValueChange={setFavorite}
          trackColor={{ false: colors.cardBorder, true: colors.tealSoft }}
          thumbColor={favorite ? colors.teal : colors.white}
        />
      </View>

      <ValidationText>{error}</ValidationText>

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save Bottle</Text>
      </TouchableOpacity>

      {existing ? (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete Bottle</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xl * 2 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
    marginTop: spacing.m,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderWidth: 1.5,
    borderRadius: radius.m,
    padding: spacing.m,
    fontSize: 16,
    color: colors.text,
  },
  helper: { fontSize: 12, color: colors.textFaint, marginTop: spacing.xs },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.l,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.m,
  },
  switchLabel: { fontSize: 15, color: colors.text, fontWeight: '600' },
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
