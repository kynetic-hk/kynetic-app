# Kynetic App

Companion app for the Kynetic smart exercise wearable: live form coaching, rep scoring and left/right balance from the IMU pods.

Built with **Expo (SDK 58) + React Native + Expo Router**, TypeScript. One codebase for iPhone and Android.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) to open the app on your phone. Press `w` to open it in a browser.

To redo the first-time setup, go to **Profile → Reset & redo setup**.

## What's built

| Area | Status |
| --- | --- |
| First-time setup: name, basics, dominant arm, experience, goals, injuries, pod pairing, calibration | ✅ |
| Home: greeting, start workout, last session score, L/R balance, weekly strip, recent sessions | ✅ (demo data) |
| Profile (with reset) | ✅ |
| Choose exercise → Live set → Set Review ("Wrapped") → Session summary | Next |
| Progress, Exercise library | Placeholders |
| Real Bluetooth connection to the ESP32 hub | Planned (see `docs/BLE.md`) |

## Project layout

```
app/                    screens (Expo Router: file = route)
  _layout.tsx           root stack + providers
  index.tsx             entry gate: onboarding on first launch, else Home
  onboarding/index.tsx  first-time setup flow
  (tabs)/               Home, Progress, Library, Profile
src/
  theme/                colours, spacing, type (brand orange lives here)
  components/           buttons, chips, cards, score ring, icons
  store/profile.tsx     user profile, saved on the device
  sensors/              SensorSource interface + demo (mock) source
  data/                 exercises + demo sessions
docs/BLE.md             plan for the real Bluetooth link
```

## Design

Dark base `#0E0E10`, brand orange `#FF6B1A` (placeholder: swap in the exact logo hex in `src/theme/index.ts`).

## Demo vs real sensors

Every screen reads sensor data through `getSensorSource()` (`src/sensors/index.ts`). Today that returns `MockSensorSource`, which simulates 5 pods and streams realistic curl data, so the app works for demos with no hardware. Adding Bluetooth means writing a `BleSensorSource` with the same interface. The screens don't change.
