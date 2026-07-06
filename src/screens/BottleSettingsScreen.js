// Bottle settings: choose active bottle, manage bottles.

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
import { colors, radius, spacing } from '../theme';
import { formatMl } from '../utils';

export default function BottleSettingsScreen({ navigation }) {
  const {
    bottles,
    activeBottle,
    setActiveBottle,
    updateBottle,
    resetDefaultBottles,
  } = useApp();

  const sorted = [...(bottles ?? [])].sort((a, b) => {
    if (a?.favorite !== b?.favorite) return a?.favorite ? -1 : 1;
    return (Number(a?.volumeMl) || 0) - (Number(b?.volumeMl) || 0);
  });

  const onReset = () => {
    Alert.alert(
      'Reset default bottles?',
      'This restores the four default bottles. Custom bottles are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetDefaultBottles },
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.hint}>
        The active bottle sets the amounts for 1/4, 1/2, 3/4, and Full taps.
      </Text>

      {sorted.map((bottle) => {
        const isActive = bottle?.id === activeBottle?.id;
        return (
          <TouchableOpacity
            key={bottle.id}
            style={[styles.bottleCard, isActive && styles.bottleCardActive]}
            onPress={() => setActiveBottle(bottle.id)}
            accessibilityLabel={'Select ' + (bottle?.name ?? 'bottle')}
          >
            <View style={styles.bottleGlyph}>
              <Text style={styles.bottleGlyphText}>▮</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bottleName} numberOfLines={1}>
                {bottle?.name ?? 'Bottle'}
                {bottle?.custom ? '  · custom' : ''}
              </Text>
              <Text style={styles.bottleVolume}>{formatMl(bottle?.volumeMl)}</Text>
            </View>
            {isActive ? <Text style={styles.activeTag}>Active</Text> : null}
            <TouchableOpacity
              onPress={() =>
                updateBottle(bottle.id, { favorite: !(bottle?.favorite === true) })
              }
              style={styles.starButton}
              accessibilityLabel="Toggle favorite"
            >
              <Text style={[styles.star, bottle?.favorite && styles.starOn]}>
                {bottle?.favorite ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('BottleForm', { bottleId: bottle.id })}
              style={styles.editButton}
              accessibilityLabel="Edit bottle"
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('BottleForm', {})}
        accessibilityLabel="Create new bottle"
      >
        <Text style={styles.addButtonText}>+ Create Bottle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>Reset Default Bottles</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xl * 2 },
  hint: { fontSize: 13, color: colors.textSoft, marginBottom: spacing.m },
  bottleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1.5,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  bottleCardActive: { borderColor: colors.fillDeep, backgroundColor: colors.panel },
  bottleGlyph: {
    width: 34,
    height: 44,
    borderRadius: radius.s,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  bottleGlyphText: { color: colors.fill, fontSize: 18 },
  bottleName: { fontSize: 15, fontWeight: '700', color: colors.text },
  bottleVolume: { fontSize: 13, color: colors.textSoft },
  activeTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
    backgroundColor: colors.fillDeep,
    paddingHorizontal: spacing.s,
    paddingVertical: 3,
    borderRadius: radius.s,
    overflow: 'hidden',
    marginRight: spacing.s,
  },
  starButton: { padding: spacing.xs },
  star: { fontSize: 20, color: colors.textFaint },
  starOn: { color: '#D9A93C' },
  editButton: {
    marginLeft: spacing.xs,
    backgroundColor: colors.sand,
    borderColor: colors.sandBorder,
    borderWidth: 1,
    borderRadius: radius.s,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
  },
  editText: { fontSize: 12, fontWeight: '700', color: colors.slate },
  addButton: {
    backgroundColor: colors.fillDeep,
    borderRadius: radius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  addButtonText: { color: colors.white, fontSize: 15, fontWeight: '800' },
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
