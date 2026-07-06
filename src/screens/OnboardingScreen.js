// First-launch onboarding: explains the bottle scale and manual tracking.

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import BottleScale from '../components/BottleScale';
import { colors, radius, spacing } from '../theme';

export default function OnboardingScreen({ navigation }) {
  const { setOnboardingCompleted } = useApp();
  const insets = useSafeAreaInsets();

  const finish = (goToBottles) => {
    setOnboardingCompleted(true);
    if (goToBottles) {
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'BottleSettings' }],
      });
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.m }]}
    >
      <Text style={styles.title}>Bottlello</Text>
      <Text style={styles.subtitle}>Track water with a bottle scale.</Text>

      <View style={styles.bottleWrap}>
        <BottleScale volumeMl={750} totalMl={1000} goalMl={2000} width={180} />
      </View>

      <View style={styles.points}>
        <Text style={styles.point}>Log 1/4, 1/2, 3/4, or a full bottle.</Text>
        <Text style={styles.point}>Choose your bottle volume or create custom bottles.</Text>
        <Text style={styles.point}>Set a daily goal and watch the bottle fill up.</Text>
        <Text style={styles.point}>No sensors. No Health Connect. No account. Works offline.</Text>
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Bottlello is a manual bottle-based water tracker. It does not detect
          drinking automatically and does not connect to Health Connect, Google
          Fit, sensors, or wearable devices. Bottle entries are added manually.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => finish(true)}
        accessibilityLabel="Choose bottle"
      >
        <Text style={styles.primaryButtonText}>Choose Bottle</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => finish(false)}
        accessibilityLabel="Use default bottle"
      >
        <Text style={styles.secondaryButtonText}>Use Default Bottle (500 ml)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, alignItems: 'center', paddingBottom: spacing.xl * 2 },
  title: { fontSize: 34, fontWeight: '800', color: colors.text, marginTop: spacing.xl },
  subtitle: { fontSize: 16, color: colors.textSoft, marginTop: spacing.xs },
  bottleWrap: {
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: 1,
    borderRadius: radius.l,
    padding: spacing.l,
    marginTop: spacing.l,
  },
  points: { marginTop: spacing.l, alignSelf: 'stretch' },
  point: {
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.m,
    marginTop: spacing.s,
  },
  note: {
    backgroundColor: colors.sand,
    borderColor: colors.sandBorder,
    borderWidth: 1,
    borderRadius: radius.m,
    padding: spacing.m,
    marginTop: spacing.l,
  },
  noteText: { fontSize: 12, color: colors.textSoft, lineHeight: 18 },
  primaryButton: {
    backgroundColor: colors.fillDeep,
    borderRadius: radius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: spacing.xl,
  },
  primaryButtonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  secondaryButton: {
    borderColor: colors.tealSoft,
    borderWidth: 1.5,
    borderRadius: radius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: spacing.s,
    backgroundColor: colors.white,
  },
  secondaryButtonText: { color: colors.text, fontSize: 15, fontWeight: '700' },
});
