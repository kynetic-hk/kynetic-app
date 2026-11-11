import { JointSample, SENSOR_LAYOUT, SensorEvent, SensorId, SensorInfo, SensorSource } from './types';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Demo sensor source: simulates the 5 pods and streams believable curl data
 * (≈2.6 s per rep, slight left/right imbalance, occasional short reps).
 * Used for competitions/demos and when no hardware is nearby.
 */
export class MockSensorSource implements SensorSource {
  readonly kind = 'mock' as const;
  private listeners = new Set<(e: SensorEvent) => void>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private sensors: SensorInfo[] = SENSOR_LAYOUT.map((s, i) => ({ ...s, battery: 92 - i * 7, connected: false }));

  async scan() {
    await wait(1200);
    return this.sensors.map((s) => ({ ...s }));
  }

  async connect(ids: SensorId[]) {
    for (const id of ids) {
      await wait(350);
      this.sensors = this.sensors.map((s) => (s.id === id ? { ...s, connected: true } : s));
      this.emit({ type: 'status', sensors: this.sensors });
    }
    this.start();
  }

  async calibrate() {
    await wait(3000);
  }

  subscribe(cb: (e: SensorEvent) => void) {
    this.listeners.add(cb);
    cb({ type: 'status', sensors: this.sensors });
    return () => this.listeners.delete(cb);
  }

  async disconnect() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.sensors = this.sensors.map((s) => ({ ...s, connected: false }));
    this.emit({ type: 'status', sensors: this.sensors });
  }

  private emit(e: SensorEvent) {
    this.listeners.forEach((l) => l(e));
  }

  private start() {
    if (this.timer) return;
    const t0 = Date.now();
    this.timer = setInterval(() => {
      const t = Date.now() - t0;
      const rep = Math.floor(t / 2600);
      const phase = (t % 2600) / 2600;
      const short = rep % 5 === 3 ? 0.78 : 1; // every 5th rep is a partial
      const curl = (Math.sin(phase * Math.PI * 2 - Math.PI / 2) + 1) / 2; // 0..1
      const sample: JointSample = {
        t,
        left: { elbowFlexion: 20 + curl * 120 * short * 0.94, shoulderAbduction: 8 + curl * 4, supination: curl * 70 },
        right: { elbowFlexion: 20 + curl * 120 * short, shoulderAbduction: 6 + curl * 3, supination: curl * 75 },
      };
      this.emit({ type: 'sample', sample });
    }, 40);
  }
}
