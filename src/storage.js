// Local persistence for Bottlello. AsyncStorage only.
// Handles empty storage, missing fields, and corrupted JSON with safe fallbacks.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeId, isValidDate, isValidTime, todayDate, nowTime, FRACTIONS } from './utils';

const KEYS = {
  bottles: '@bottlello/bottles',
  entries: '@bottlello/entries',
  settings: '@bottlello/settings',
};

export function defaultBottles() {
  const now = new Date().toISOString();
  return [
    { id: 'default-330', name: 'Small Bottle', volumeMl: 330, colorKey: 'aqua', favorite: false, custom: false, createdAt: now, updatedAt: now },
    { id: 'default-500', name: 'Regular Bottle', volumeMl: 500, colorKey: 'sky', favorite: true, custom: false, createdAt: now, updatedAt: now },
    { id: 'default-750', name: 'Large Bottle', volumeMl: 750, colorKey: 'teal', favorite: false, custom: false, createdAt: now, updatedAt: now },
    { id: 'default-1000', name: 'Big Bottle', volumeMl: 1000, colorKey: 'slate', favorite: false, custom: false, createdAt: now, updatedAt: now },
  ];
}

export function defaultReminderSettings() {
  return {
    enabled: true,
    morningEnabled: true,
    afternoonEnabled: true,
    eveningEnabled: true,
  };
}

export function defaultSettings() {
  return {
    onboardingCompleted: false,
    dailyGoalMl: 2000,
    activeBottleId: 'default-500',
    compactMode: false,
    reminders: defaultReminderSettings(),
  };
}

function sanitizeBottle(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const now = new Date().toISOString();
  const volume = Number(raw.volumeMl);
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : makeId(),
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : 'Bottle',
    volumeMl: Number.isFinite(volume) && volume > 0 ? Math.min(5000, Math.round(volume)) : 500,
    colorKey: typeof raw.colorKey === 'string' ? raw.colorKey : 'sky',
    favorite: raw.favorite === true,
    custom: raw.custom === true,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
  };
}

function sanitizeEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const now = new Date().toISOString();
  const amount = Number(raw.amountMl);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : makeId(),
    date: isValidDate(raw.date) ? raw.date : todayDate(),
    time: isValidTime(raw.time) ? raw.time : nowTime(),
    bottleId: typeof raw.bottleId === 'string' ? raw.bottleId : '',
    bottleNameSnapshot:
      typeof raw.bottleNameSnapshot === 'string' && raw.bottleNameSnapshot
        ? raw.bottleNameSnapshot
        : 'Bottle',
    bottleVolumeMlSnapshot: Math.max(1, Math.round(Number(raw.bottleVolumeMlSnapshot) || 500)),
    fraction: FRACTIONS[raw.fraction] ? raw.fraction : 'custom',
    amountMl: Math.min(10000, Math.round(amount)),
    label: typeof raw.label === 'string' ? raw.label : '',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
  };
}

function sanitizeSettings(raw) {
  const base = defaultSettings();
  if (!raw || typeof raw !== 'object') return base;
  const goal = Number(raw.dailyGoalMl);
  const reminders = raw.reminders && typeof raw.reminders === 'object' ? raw.reminders : {};
  return {
    onboardingCompleted: raw.onboardingCompleted === true,
    dailyGoalMl:
      Number.isFinite(goal) && goal > 0 ? Math.min(10000, Math.round(goal)) : base.dailyGoalMl,
    activeBottleId:
      typeof raw.activeBottleId === 'string' && raw.activeBottleId
        ? raw.activeBottleId
        : base.activeBottleId,
    compactMode: raw.compactMode === true,
    reminders: {
      enabled: reminders.enabled !== false,
      morningEnabled: reminders.morningEnabled !== false,
      afternoonEnabled: reminders.afternoonEnabled !== false,
      eveningEnabled: reminders.eveningEnabled !== false,
    },
  };
}

async function readJson(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw);
  } catch (error) {
    // Corrupted JSON or storage error: fall back to defaults.
    return null;
  }
}

export async function loadAppData() {
  const [rawBottles, rawEntries, rawSettings] = await Promise.all([
    readJson(KEYS.bottles),
    readJson(KEYS.entries),
    readJson(KEYS.settings),
  ]);

  let bottles = Array.isArray(rawBottles)
    ? rawBottles.map(sanitizeBottle).filter(Boolean)
    : [];
  if (!bottles.length) bottles = defaultBottles();

  const entries = Array.isArray(rawEntries)
    ? rawEntries.map(sanitizeEntry).filter(Boolean)
    : [];

  const settings = sanitizeSettings(rawSettings);
  if (!bottles.some((b) => b.id === settings.activeBottleId)) {
    settings.activeBottleId = bottles[0]?.id ?? null;
  }

  return { bottles, entries, settings };
}

export async function saveBottles(bottles) {
  try {
    await AsyncStorage.setItem(KEYS.bottles, JSON.stringify(Array.isArray(bottles) ? bottles : []));
  } catch (error) {
    // Persisting failed; keep in-memory state so the app keeps working.
  }
}

export async function saveEntries(entries) {
  try {
    await AsyncStorage.setItem(KEYS.entries, JSON.stringify(Array.isArray(entries) ? entries : []));
  } catch (error) {
    // Ignore write errors; in-memory state stays intact.
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(KEYS.settings, JSON.stringify(sanitizeSettings(settings)));
  } catch (error) {
    // Ignore write errors; in-memory state stays intact.
  }
}

export async function clearAllData() {
  try {
    await AsyncStorage.multiRemove([KEYS.bottles, KEYS.entries, KEYS.settings]);
  } catch (error) {
    // Ignore; caller resets in-memory state anyway.
  }
}
