// Global app state for Bottlello. Loads from AsyncStorage once,
// persists on every change, and guarantees safe fallbacks everywhere.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  loadAppData,
  saveBottles,
  saveEntries,
  saveSettings,
  clearAllData,
  defaultBottles,
  defaultSettings,
} from '../storage';
import { makeId, todayDate, nowTime, fractionAmount, FRACTIONS } from '../utils';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [loaded, setLoaded] = useState(false);
  const [bottles, setBottles] = useState(() => defaultBottles());
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState(() => defaultSettings());
  const loadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadAppData();
        if (cancelled) return;
        setBottles(data.bottles);
        setEntries(data.entries);
        setSettings(data.settings);
      } catch (error) {
        // Fall back to in-memory defaults.
      } finally {
        if (!cancelled) {
          loadedRef.current = true;
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loadedRef.current) saveBottles(bottles);
  }, [bottles]);
  useEffect(() => {
    if (loadedRef.current) saveEntries(entries);
  }, [entries]);
  useEffect(() => {
    if (loadedRef.current) saveSettings(settings);
  }, [settings]);

  // --- Derived: active bottle with safe fallback ---
  const safeBottles = bottles?.length ? bottles : defaultBottles();
  const activeBottle =
    safeBottles.find((b) => b?.id === settings?.activeBottleId) ??
    safeBottles[0] ??
    defaultBottles()[0];
  const dailyGoalMl = Math.max(1, Number(settings?.dailyGoalMl) || 2000);

  // --- Bottle actions ---
  const addBottle = useCallback(({ name, volumeMl, favorite }) => {
    const now = new Date().toISOString();
    const bottle = {
      id: makeId(),
      name: String(name ?? '').trim() || 'Bottle',
      volumeMl: Math.max(1, Math.min(5000, Math.round(Number(volumeMl) || 500))),
      colorKey: 'sky',
      favorite: favorite === true,
      custom: true,
      createdAt: now,
      updatedAt: now,
    };
    setBottles((prev) => [...(prev ?? []), bottle]);
    return bottle;
  }, []);

  const updateBottle = useCallback((id, patch) => {
    setBottles((prev) =>
      (prev ?? []).map((b) =>
        b?.id === id
          ? { ...b, ...patch, id: b.id, updatedAt: new Date().toISOString() }
          : b
      )
    );
  }, []);

  const deleteBottle = useCallback((id) => {
    setBottles((prev) => {
      let next = (prev ?? []).filter((b) => b?.id !== id);
      if (!next.length) next = defaultBottles();
      setSettings((s) => {
        const stillThere = next.some((b) => b.id === s?.activeBottleId);
        return stillThere ? s : { ...s, activeBottleId: next[0]?.id ?? null };
      });
      return next;
    });
  }, []);

  const resetDefaultBottles = useCallback(() => {
    setBottles((prev) => {
      const customs = (prev ?? []).filter((b) => b?.custom === true);
      const next = [...defaultBottles(), ...customs];
      setSettings((s) => {
        const stillThere = next.some((b) => b.id === s?.activeBottleId);
        return stillThere ? s : { ...s, activeBottleId: next[0]?.id ?? null };
      });
      return next;
    });
  }, []);

  const setActiveBottle = useCallback((id) => {
    setSettings((s) => ({ ...s, activeBottleId: id }));
  }, []);

  // --- Entry actions ---
  const addEntry = useCallback((partial) => {
    const now = new Date().toISOString();
    const entry = {
      id: makeId(),
      date: partial?.date ?? todayDate(),
      time: partial?.time ?? nowTime(),
      bottleId: partial?.bottleId ?? '',
      bottleNameSnapshot: partial?.bottleNameSnapshot ?? 'Bottle',
      bottleVolumeMlSnapshot: Math.max(
        1,
        Math.round(Number(partial?.bottleVolumeMlSnapshot) || 500)
      ),
      fraction: FRACTIONS[partial?.fraction] ? partial.fraction : 'custom',
      amountMl: Math.max(1, Math.min(10000, Math.round(Number(partial?.amountMl) || 1))),
      label: String(partial?.label ?? ''),
      createdAt: now,
      updatedAt: now,
    };
    setEntries((prev) => [...(prev ?? []), entry]);
    return entry;
  }, []);

  const logFraction = useCallback(
    (fractionKey) => {
      const bottle = activeBottle;
      const volume = Math.max(1, Number(bottle?.volumeMl) || 500);
      return addEntry({
        bottleId: bottle?.id ?? '',
        bottleNameSnapshot: bottle?.name ?? 'Bottle',
        bottleVolumeMlSnapshot: volume,
        fraction: FRACTIONS[fractionKey] ? fractionKey : 'full',
        amountMl: fractionAmount(volume, fractionKey),
      });
    },
    [activeBottle, addEntry]
  );

  const updateEntry = useCallback((id, patch) => {
    setEntries((prev) =>
      (prev ?? []).map((e) =>
        e?.id === id
          ? { ...e, ...patch, id: e.id, updatedAt: new Date().toISOString() }
          : e
      )
    );
  }, []);

  const deleteEntry = useCallback((id) => {
    setEntries((prev) => (prev ?? []).filter((e) => e?.id !== id));
  }, []);

  const resetDay = useCallback((dateStr) => {
    setEntries((prev) => (prev ?? []).filter((e) => e?.date !== dateStr));
  }, []);

  const deleteAllEntries = useCallback(() => {
    setEntries([]);
  }, []);

  // --- Settings actions ---
  const setDailyGoal = useCallback((goalMl) => {
    const goal = Math.max(1, Math.min(10000, Math.round(Number(goalMl) || 2000)));
    setSettings((s) => ({ ...s, dailyGoalMl: goal }));
  }, []);

  const setReminders = useCallback((patch) => {
    setSettings((s) => ({
      ...s,
      reminders: { ...(s?.reminders ?? {}), ...(patch ?? {}) },
    }));
  }, []);

  const setOnboardingCompleted = useCallback((value) => {
    setSettings((s) => ({ ...s, onboardingCompleted: value === true }));
  }, []);

  const setCompactMode = useCallback((value) => {
    setSettings((s) => ({ ...s, compactMode: value === true }));
  }, []);

  const resetAllData = useCallback(async () => {
    await clearAllData();
    setBottles(defaultBottles());
    setEntries([]);
    setSettings({ ...defaultSettings(), onboardingCompleted: true });
  }, []);

  const value = useMemo(
    () => ({
      loaded,
      bottles: safeBottles,
      entries: entries ?? [],
      settings,
      activeBottle,
      dailyGoalMl,
      addBottle,
      updateBottle,
      deleteBottle,
      resetDefaultBottles,
      setActiveBottle,
      addEntry,
      logFraction,
      updateEntry,
      deleteEntry,
      resetDay,
      deleteAllEntries,
      setDailyGoal,
      setReminders,
      setOnboardingCompleted,
      setCompactMode,
      resetAllData,
    }),
    [
      loaded,
      safeBottles,
      entries,
      settings,
      activeBottle,
      dailyGoalMl,
      addBottle,
      updateBottle,
      deleteBottle,
      resetDefaultBottles,
      setActiveBottle,
      addEntry,
      logFraction,
      updateEntry,
      deleteEntry,
      resetDay,
      deleteAllEntries,
      setDailyGoal,
      setReminders,
      setOnboardingCompleted,
      setCompactMode,
      resetAllData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
