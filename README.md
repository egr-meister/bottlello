# Bottlello

Bottlello is an offline, manual, bottle-based water tracker for Android built
with React Native and Expo. You choose a bottle volume, and the home screen
shows one large bottle with clear scale divisions (1/4, 1/2, 3/4, Full). You
log water by tapping how much of the bottle you drank.

## Manual tracking disclaimer

**Bottlello is a manual bottle-based water tracker. It does not detect
drinking automatically and does not connect to Health Connect, Google Fit,
sensors, or wearable devices.** Bottle entries are added manually.

Bottlello is not a medical app. It does not provide medical advice, does not
diagnose anything, and makes no health or sport-performance claims.

## Features

- Bottle scale visual: one large bottle with 1/4, 1/2, 3/4, and Full marks,
  filled according to today's progress toward your daily goal.
- Bottle volume selection with four default presets: Small Bottle (330 ml),
  Regular Bottle (500 ml), Large Bottle (750 ml), Big Bottle (1000 ml).
- Custom bottles: create, edit, favorite, and delete (with confirmation).
  Volumes are validated (greater than 0, up to 5000 ml).
- Fraction logging: tap 1/4, 1/2, 3/4, or Full. Amounts are calculated from
  the active bottle volume and rounded to whole ml (750 ml bottle:
  1/4 = 188 ml, 1/2 = 375 ml, 3/4 = 563 ml, Full = 750 ml).
- Consumed bottle list: each entry shows time, bottle name, fraction, and
  amount, with edit and delete actions ("09:15 — Regular Bottle — 1/2 — 250 ml").
- Entries snapshot the bottle name and volume, so history stays correct even
  if the bottle is later edited or deleted.
- Daily goal: default 2000 ml, editable from 1 to 10000 ml. Progress is
  visually capped at 100% while the real total is always shown.
- History by day: reverse-chronological daily cards with total, goal state,
  entry count, most used bottle, and most used fraction.
- Day detail: mini bottle preview, full entry list, add/edit/delete entries,
  and Reset Day with confirmation.
- Statistics: today, 7-day, and 30-day totals, 7-day average, best day, goal
  days, entry counts per fraction, most used bottle and fraction, and a simple
  weekly mini chart (plain React Native views, no chart library).
- Gentle in-app reminders based on today's progress and the current time.
- Compact mode, onboarding replay, reset day / delete all entries / reset all
  local data actions.

## In-app reminders only

**Bottlello uses in-app reminder cards only. It does not send system
notifications.** There are no push notifications, no background services, no
alarm permissions, no calendar permissions, and no notification runtime
permission. When the app opens, it checks today's bottle progress and can show
a calm reminder card on the home screen. Reminders work only while the app is
open. Morning, afternoon, and evening reminders can be toggled individually.

## Offline-first, private by design

- Everything is stored locally on the device with AsyncStorage: bottles,
  active bottle, entries, daily goal, reminder settings, and app settings.
- Data survives app restarts. Corrupted or missing data falls back to safe
  defaults; the app never crashes on empty storage, a deleted active bottle,
  missing fractions, invalid dates, or missing route params.
- No backend, no Firebase, no ads, no analytics, no payments, no external
  APIs, no cloud sync, no account registration.
- The Android manifest contains **no INTERNET permission** (it is explicitly
  removed), and the app requests no runtime permissions of any kind: no
  location, camera, microphone, contacts, storage, files, notifications,
  calendar, alarms, activity recognition, body sensors, Google Fit, Health
  Connect, or wearable access.
- The app works fully in airplane mode.

## Visual style: "Bottlello Bottle Scale Meter"

The layout is intentionally bottle-first and unlike a generic tracker app:

- A compact header (title, date, settings icon), never a mascot header.
- The active bottle is the central object, with scale marks and ml values
  printed next to the bottle.
- Fraction buttons (1/4, 1/2, 3/4, Full) sit directly beside the bottle scale,
  each showing the ml amount it will add.
- Today's entries appear as small "bottle marks" below the meter.
- History and statistics are small shortcut cards, not a large vertical menu.
- No circular tracker, jar, drop grid, tile board, glass shelf, timeline, or
  spreadsheet-style log as the primary UI.

Palette: warm white background, pale aqua panels, deep blue-gray text, sky
blue fill, muted teal scale marks, soft slate controls, light sand labels.

### App icon

Custom icon (no default Expo icon): a rounded pale-aqua square with a simple
bottle silhouette, visible scale marks, and a half-level water fill. Generated
by `scripts/generate_assets.py` into `assets/icon.png` and
`assets/adaptive-icon.png`.

### Splash screen

Custom splash (no default Expo splash): a centered bottle silhouette with
scale marks, the name "Bottlello", and a pale aqua background
(`assets/splash.png`).

## Data models

```js
Bottle = { id, name, volumeMl, colorKey, favorite, custom, createdAt, updatedAt }
WaterEntry = {
  id, date, time, bottleId, bottleNameSnapshot, bottleVolumeMlSnapshot,
  fraction: "quarter" | "half" | "threeQuarter" | "full" | "custom",
  amountMl, label, createdAt, updatedAt
}
ReminderSettings = { enabled, morningEnabled, afternoonEnabled, eveningEnabled }
Settings = { onboardingCompleted, dailyGoalMl, activeBottleId, compactMode, reminders }
```

Dates are `YYYY-MM-DD` strings and times are `HH:mm` strings. Invalid values
show friendly validation messages and never crash the app.

## Project setup

The project was scaffolded with the official Expo template and all packages
were installed through Expo-compatible commands so every version matches the
Expo SDK (currently SDK 57 / React Native 0.86):

```bash
npx create-expo-app bottlello --template blank
cd bottlello
npx expo install @react-native-async-storage/async-storage react-native-svg
npx expo install @react-navigation/native @react-navigation/native-stack \
  react-native-screens react-native-safe-area-context
npx expo install expo-asset expo-constants expo-font expo-modules-core
```

Every imported package is a direct dependency in `package.json`, and the
complete `package-lock.json` is committed.

## Run locally

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on an Android device (development through Expo
Go works normally; the production app itself has no INTERNET permission).

## Build Android (release)

The `android/` directory is generated with `npx expo prebuild --platform
android` and committed, including the signing configuration.

### 1. Generate a PKCS12 keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore bottlello-release-key.p12 \
  -alias bottlello_key -keyalg RSA -keysize 2048 -validity 10000
```

Use the **same password** for the keystore and the key. Never commit the
keystore or passwords to the repository (`.p12` files are gitignored).

### 2. Add GitHub Secrets

In the repository settings, add:

- `ANDROID_KEYSTORE_BASE64` — the keystore encoded with
  `base64 -w0 bottlello-release-key.p12` (macOS: `base64 -i bottlello-release-key.p12`)
- `ANDROID_KEYSTORE_PASSWORD` — the keystore password
- `ANDROID_KEY_ALIAS` — `bottlello_key`
- `ANDROID_KEY_PASSWORD` — same as the keystore password

### 3. Build

Locally:

```bash
export ANDROID_KEYSTORE_PATH=/absolute/path/to/bottlello-release-key.p12
export ANDROID_KEYSTORE_PASSWORD=...
export ANDROID_KEY_ALIAS=bottlello_key
export ANDROID_KEY_PASSWORD=...
cd android
./gradlew assembleRelease   # signed APK
./gradlew bundleRelease     # signed AAB
```

Or push to `main` and let GitHub Actions build both artifacts.

### Signing and build stability

- Release APK and AAB are signed with a **real PKCS12 keystore**, never the
  debug key. In `android/app/build.gradle` the `release` buildType uses
  `signingConfigs.release`, explicitly overriding the default Expo / React
  Native debug signing behavior, so signing works from the very first release
  build.
- Keystore and passwords are provided **only** through GitHub Secrets /
  environment variables.
- CI verifies the release APK signature with
  `apksigner verify --print-certs`, prints the certificate to the logs, and
  **fails the build if the certificate contains `CN=Android Debug`**. This
  prevents Google Play rejection caused by a debug-signed artifact.
- **Google Play upload target is the `.aab` only**, not the `.apk`. The APK
  artifact is for direct device installs and local verification.

## GitHub Actions

`.github/workflows/android-build.yml` runs on every push to `main`:

1. Install Node.js and JDK 17.
2. `npm install`.
3. Pre-flight checks: `npx expo install --fix`, `npx expo-doctor`,
   `npx expo install --check`.
4. Install Android SDK Platform 35/36 and Build Tools via `sdkmanager`.
5. Decode the keystore from `ANDROID_KEYSTORE_BASE64`.
6. Build the signed release APK and AAB.
7. Verify the APK signature and fail on a debug certificate.
8. Upload the APK and AAB as workflow artifacts.

CI is responsible for fast, stable build and signing only. It does not run
emulator smoke tests (not reliable on free runners) — see the local launch
verification checklist below.

## Google Play compatibility

- `compileSdk` / `targetSdk` **36** (Android 16) — comfortably above the
  Play requirement and never API 34, avoiding the "target API level too low"
  rejection. `minSdk` 24.
- React Native 0.86 / Expo SDK 57 produce 16 KB-page-size-compatible native
  libraries, so the AAB supports Android 15+ devices with 16 KB memory pages.
- No old native libraries and no unnecessary native SDKs: no Firebase, ads,
  analytics, payments, Google Fit, Health Connect, sensors, wearables,
  notifications, or background task SDKs.
- Hermes is enabled; release builds work with minify enabled.

## Release optimization

Standard Android R8/Proguard only — no third-party obfuscation. The committed
configuration enables release optimization:

```
android.enableMinifyInReleaseBuilds=true
android.enableShrinkResourcesInReleaseBuilds=true
```

For the very first release verification you can temporarily set both to
`false` in `android/gradle.properties`, build and launch, then re-enable them
and re-test the launch, as recommended.

## Local launch verification checklist

A CI build is not proof that the app launches. Before release:

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
adb logcat
```

Confirm there are no errors such as: `Cannot find native module`, `Module has
not been registered`, `Invariant Violation`, `theme.fonts.regular is
undefined`, AsyncStorage JSON parse crash, missing route params crash, invalid
date/time/number crash, missing active bottle crash, undefined fraction crash,
SVG native module crash, or signature misconfiguration.

Then walk through:

- first launch with empty storage; onboarding appears
- select the default bottle / choose a bottle
- add 1/4, 1/2, 3/4, and Full bottle entries
- create a custom bottle; edit its volume; delete it
- confirm the active-bottle fallback works after deletion
- edit and delete a bottle entry
- reset the selected day (with confirmation)
- change the daily goal
- check the bottle scale rendering and the consumed bottle list
- check history, day detail, and statistics
- check in-app reminder cards (morning/afternoon/evening conditions)
- reset all local data; relaunch the app
- launch in airplane mode (must work fully)
- verify the release APK signature (`apksigner verify --print-certs`)
- confirm no sensor, Google Fit, Health Connect, wearable, notification, or
  internet permission is requested (`aapt dump permissions app-release.apk`)

## Privacy note

Bottlello stores bottles, bottle entries, goals, reminders, history, and
statistics only on this device. No account, no ads, no analytics, no internet
connection, no sensors, no Google Fit, no Health Connect, and no notification
permission.
