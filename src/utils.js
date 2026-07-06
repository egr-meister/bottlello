// Bottlello utilities: dates, fractions, statistics, reminders.
// Everything is defensive: bad input never throws.

export const FRACTIONS = {
  quarter: { key: 'quarter', label: '1/4', value: 0.25 },
  half: { key: 'half', label: '1/2', value: 0.5 },
  threeQuarter: { key: 'threeQuarter', label: '3/4', value: 0.75 },
  full: { key: 'full', label: 'Full', value: 1 },
  custom: { key: 'custom', label: 'Custom', value: null },
};

export const FRACTION_ORDER = ['quarter', 'half', 'threeQuarter', 'full'];

export function pad2(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '00';
  return String(Math.max(0, Math.floor(num))).padStart(2, '0');
}

export function makeId() {
  return (
    Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
  );
}

export function todayDate(d) {
  const date = d instanceof Date && !isNaN(d.getTime()) ? d : new Date();
  return (
    date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate())
  );
}

export function nowTime(d) {
  const date = d instanceof Date && !isNaN(d.getTime()) ? d : new Date();
  return pad2(date.getHours()) + ':' + pad2(date.getMinutes());
}

export function isValidDate(str) {
  if (typeof str !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  );
}

export function isValidTime(str) {
  if (typeof str !== 'string') return false;
  if (!/^\d{2}:\d{2}$/.test(str)) return false;
  const [h, m] = str.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDateLabel(dateStr) {
  if (!isValidDate(dateStr)) return String(dateStr ?? '');
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const label =
    DAY_NAMES[dt.getDay()] + ', ' + MONTH_NAMES[m - 1] + ' ' + d + ' ' + y;
  if (dateStr === todayDate()) return 'Today · ' + label;
  return label;
}

export function shortDateLabel(dateStr) {
  if (!isValidDate(dateStr)) return String(dateStr ?? '');
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return DAY_NAMES[dt.getDay()] + ' ' + MONTH_NAMES[m - 1] + ' ' + d;
}

export function addDays(dateStr, delta) {
  const base = isValidDate(dateStr) ? dateStr : todayDate();
  const [y, m, d] = base.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + Number(delta || 0));
  return todayDate(dt);
}

export function fractionAmount(volumeMl, fractionKey) {
  const volume = Math.max(1, Number(volumeMl) || 0);
  const fraction = FRACTIONS[fractionKey];
  const value = fraction && fraction.value != null ? fraction.value : 1;
  return Math.max(1, Math.round(volume * value));
}

export function fractionLabel(fractionKey) {
  return FRACTIONS[fractionKey]?.label ?? 'Custom';
}

export function formatMl(ml) {
  const n = Math.max(0, Math.round(Number(ml) || 0));
  return n.toLocaleString('en-US') + ' ml';
}

export function safeEntries(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.filter((e) => e && typeof e === 'object' && e.id);
}

export function entriesForDate(entries, dateStr) {
  return safeEntries(entries)
    .filter((e) => e.date === dateStr)
    .sort((a, b) => String(a.time ?? '').localeCompare(String(b.time ?? '')));
}

export function totalForDate(entries, dateStr) {
  return entriesForDate(entries, dateStr).reduce(
    (sum, e) => sum + Math.max(0, Number(e.amountMl) || 0),
    0
  );
}

function mostCommon(list) {
  const counts = {};
  let best = null;
  let bestCount = 0;
  for (const item of list) {
    if (item == null || item === '') continue;
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] > bestCount) {
      bestCount = counts[item];
      best = item;
    }
  }
  return best;
}

export function daySummary(entries, dateStr, goalMl) {
  const dayEntries = entriesForDate(entries, dateStr);
  const totalMl = dayEntries.reduce(
    (sum, e) => sum + Math.max(0, Number(e.amountMl) || 0),
    0
  );
  const goal = Math.max(1, Number(goalMl) || 2000);
  return {
    date: dateStr,
    totalMl,
    entryCount: dayEntries.length,
    goalReached: totalMl >= goal,
    mostUsedBottle: mostCommon(dayEntries.map((e) => e.bottleNameSnapshot)),
    mostUsedFraction: mostCommon(
      dayEntries.map((e) => (FRACTIONS[e.fraction] ? e.fraction : null))
    ),
  };
}

export function historyDays(entries, goalMl) {
  const dates = Array.from(
    new Set(safeEntries(entries).map((e) => e.date).filter(isValidDate))
  ).sort((a, b) => b.localeCompare(a));
  return dates.map((d) => daySummary(entries, d, goalMl));
}

export function lastNDates(n, endDateStr) {
  const end = isValidDate(endDateStr) ? endDateStr : todayDate();
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    out.push(addDays(end, -i));
  }
  return out;
}

export function computeStatistics(entries, goalMl) {
  const all = safeEntries(entries);
  const goal = Math.max(1, Number(goalMl) || 2000);
  const today = todayDate();
  const week = lastNDates(7, today).map((date) => ({
    date,
    totalMl: totalForDate(all, date),
  }));
  const month = lastNDates(30, today).map((date) => totalForDate(all, date));

  const last7Total = week.reduce((s, d) => s + d.totalMl, 0);
  const last30Total = month.reduce((s, t) => s + t, 0);

  let bestDay = null;
  for (const summary of historyDays(all, goal)) {
    if (!bestDay || summary.totalMl > bestDay.totalMl) bestDay = summary;
  }

  const fractionCounts = {
    quarter: 0,
    half: 0,
    threeQuarter: 0,
    full: 0,
    custom: 0,
  };
  for (const e of all) {
    const key = FRACTIONS[e.fraction] ? e.fraction : 'custom';
    fractionCounts[key] += 1;
  }

  return {
    todayTotal: totalForDate(all, today),
    last7Total,
    last30Total,
    dailyAverage: Math.round(last7Total / 7),
    bestDay,
    goalDays7: week.filter((d) => d.totalMl >= goal).length,
    totalEntries: all.length,
    fractionCounts,
    mostUsedBottle: mostCommon(all.map((e) => e.bottleNameSnapshot)),
    mostUsedFraction: mostCommon(
      all.map((e) => (FRACTIONS[e.fraction] ? e.fraction : null))
    ),
    week,
  };
}

// In-app reminder cards. Shown only while the app is open.
// No system notifications, no background work.
export function getReminderMessage(entries, reminderSettings, goalMl, now) {
  const settings = reminderSettings ?? {};
  if (!settings.enabled) return null;
  const date = now instanceof Date && !isNaN(now.getTime()) ? now : new Date();
  const hour = date.getHours();
  const today = todayDate(date);
  const dayEntries = entriesForDate(entries, today);
  const total = dayEntries.reduce(
    (sum, e) => sum + Math.max(0, Number(e.amountMl) || 0),
    0
  );
  const goal = Math.max(1, Number(goalMl) || 2000);

  if (settings.morningEnabled && hour >= 11 && hour < 16 && dayEntries.length === 0) {
    return 'No bottles logged today. Add one if you drank water.';
  }
  if (settings.afternoonEnabled && hour >= 16 && hour < 19 && total < goal * 0.5) {
    return 'You can add any bottle parts you remember.';
  }
  if (settings.eveningEnabled && hour >= 19 && total < goal) {
    return 'Add any bottle entries you missed today.';
  }
  return null;
}
