# Bluetooth plan (ESP32 hub → app)

## Today
The hub (ESP5) already collects data from the 4 arm pods and sends it over BLE to the laptop dashboard. The app will replace the laptop as the receiver.

## Steps
1. **Library**: add `react-native-ble-plx` and its Expo config plugin. Custom Bluetooth needs a **development build** (`npx expo run:android` / EAS Build). Expo Go can't do it, but the demo source keeps working in Expo Go.
2. **Hub firmware**: expose one BLE service with:
   - a *notify* characteristic streaming joint angles (e.g. 25 Hz; compact binary: `t, L_elbow, L_abduction, L_supination, R_elbow, R_abduction, R_supination`)
   - a *write* characteristic for commands: `CALIBRATE`, `MODE <exercise>`, `START`, `STOP`
   - a *read* characteristic for pod status and battery
   UUIDs to be agreed with the firmware side and kept in `src/sensors/ble.ts`.
3. **App**: implement `BleSensorSource` (same interface as `MockSensorSource`): scan for the hub by name/service UUID, connect, decode notifications into `JointSample`s, send commands.
4. **Switch**: make `getSensorSource()` return the BLE source when a hub is paired, otherwise the demo source (keep a "Demo mode" toggle for competitions).

## Where the maths lives
Joint angles are computed on the hub (quaternion relative rotation, swing-twist), so the app only receives angles. Rep detection, ROM, tempo and form scoring run in the app so they can be tuned without reflashing.
