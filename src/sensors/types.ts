// Shared sensor types. The UI only talks to a `SensorSource`, so the demo
// (mock) source and the real Bluetooth source are interchangeable.

export type SensorId = 'L_FOREARM' | 'L_UPPER' | 'R_FOREARM' | 'R_UPPER' | 'HUB';

export interface SensorInfo {
  id: SensorId;
  label: string; // human name, e.g. "Left wrist"
  placement: string; // where to wear it
  battery: number; // 0–100
  connected: boolean;
}

/** One processed sample from the hub (joint angles in degrees). */
export interface JointSample {
  t: number; // ms since set start
  left: { elbowFlexion: number; shoulderAbduction: number; supination: number };
  right: { elbowFlexion: number; shoulderAbduction: number; supination: number };
}

export type SensorEvent =
  | { type: 'status'; sensors: SensorInfo[] }
  | { type: 'sample'; sample: JointSample };

export interface SensorSource {
  readonly kind: 'mock' | 'ble';
  scan(): Promise<SensorInfo[]>;
  connect(ids: SensorId[]): Promise<void>;
  calibrate(): Promise<void>; // user holds the neutral pose
  subscribe(cb: (e: SensorEvent) => void): () => void;
  disconnect(): Promise<void>;
}

export const SENSOR_LAYOUT: Omit<SensorInfo, 'battery' | 'connected'>[] = [
  { id: 'HUB', label: 'Hub', placement: 'Chest / torso strap' },
  { id: 'L_UPPER', label: 'Left upper arm', placement: 'Outer upper arm, near the shoulder' },
  { id: 'L_FOREARM', label: 'Left wrist', placement: 'Just above the wrist' },
  { id: 'R_UPPER', label: 'Right upper arm', placement: 'Outer upper arm, near the shoulder' },
  { id: 'R_FOREARM', label: 'Right wrist', placement: 'Just above the wrist' },
];
