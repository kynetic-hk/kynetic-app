import { MockSensorSource } from './mock';
import { SensorSource } from './types';

export * from './types';

/**
 * Returns the active sensor source.
 *
 * Today this is always the demo source. The real source will use Bluetooth LE
 * to talk to the ESP32 hub (see docs/BLE.md). It needs a development build
 * (react-native-ble-plx) because Expo Go cannot use custom Bluetooth.
 */
let source: SensorSource | null = null;
export function getSensorSource(): SensorSource {
  if (!source) source = new MockSensorSource();
  return source;
}
