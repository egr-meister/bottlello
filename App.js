// Bottlello: offline manual bottle-scale water tracker.
// Local data only (AsyncStorage). No internet, no notifications, no sensors.

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { colors } from './src/theme';

import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import BottleSettingsScreen from './src/screens/BottleSettingsScreen';
import BottleFormScreen from './src/screens/BottleFormScreen';
import EntryFormScreen from './src/screens/EntryFormScreen';
import DayDetailScreen from './src/screens/DayDetailScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import ReminderSettingsScreen from './src/screens/ReminderSettingsScreen';
import GoalSettingsScreen from './src/screens/GoalSettingsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

// Extend DefaultTheme (never build a navigation theme from scratch).
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    primary: colors.fillDeep,
    border: colors.cardBorder,
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: { color: colors.text, fontWeight: '800' },
  headerTintColor: colors.fillDeep,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

function RootNavigator() {
  const { loaded, settings } = useApp();

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.fillDeep} />
        <Text style={styles.loadingText}>Bottlello</Text>
      </View>
    );
  }

  const initialRoute = settings?.onboardingCompleted === true ? 'Home' : 'Onboarding';

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={screenOptions}>
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="BottleSettings"
        component={BottleSettingsScreen}
        options={{ title: 'My Bottles' }}
      />
      <Stack.Screen
        name="BottleForm"
        component={BottleFormScreen}
        options={({ route }) => ({
          title: route?.params?.bottleId ? 'Edit Bottle' : 'New Bottle',
        })}
      />
      <Stack.Screen
        name="EntryForm"
        component={EntryFormScreen}
        options={({ route }) => ({
          title: route?.params?.entryId ? 'Edit Entry' : 'Add Entry',
        })}
      />
      <Stack.Screen
        name="DayDetail"
        component={DayDetailScreen}
        options={{ title: 'Day Detail' }}
      />
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Past Bottles' }} />
      <Stack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{ title: 'Bottle Report' }}
      />
      <Stack.Screen
        name="ReminderSettings"
        component={ReminderSettingsScreen}
        options={{ title: 'In-App Reminders' }}
      />
      <Stack.Screen
        name="GoalSettings"
        component={GoalSettingsScreen}
        options={{ title: 'Daily Goal' }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" backgroundColor={colors.background} />
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
});
