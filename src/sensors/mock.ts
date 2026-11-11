import { JointSample, SENSOR_LAYOUT, SensorEvent, SensorId, SensorInfo, SensorSource } from './types';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Per-rep variation so the demo shows real feedback: duration (s), range factor, swing.
const REP_PATTERN = [
  { dur: 2.8, range: 1, swing: 0 },
  { dur: 2.6, range: 1, swing: 0 },
  { dur: 1.6, range: 1, swing: 0 }, // rushed
  { dur: 2.9, range: 0.74, swing: 0 }, // partial
  { dur: 2.7, range: 1, swing: 0 },
  { dur: 2.6, range: 1, swing: 18 }, // body swing / elbows drift
  { dur: 3.0, range: 1, swing: 0 },
  { dur: 2.7, range: 0.97, swing: 0 },
];

/**
 * Demo sensor source: simulates the 5 pods and streams believable joint angles
 * for the selected exercise (curls → elbow flexion, lateral raise → shoulder
 * abduction), with a little left/right imbalance and occasional bad reps.
 */
export class MockSensorSource implements SensorSource {
  readonly kind = 'mock' as const;
  private listeners = new Set<(e: SensorEvent) => void>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private exercise = 'bicep_curl';
  private sensors: SensorInfo[] = SENSOR_LAYOUT.map((s, i) => ({ ...s, battery: 92 - i * 7, connected: false }));
  private t0 = Date.now();
  private last = Date.now();
  private rep = 0;
  private phase = 0;

  async scan() {
    await wait(1200);
    return this.sensors.map((s) => ({ ...s }));
  }

  async connect(ids: SensorId[]) {
    for (const id of ids) {
      await wait(300);
      this.sensors = this.sensors.map((s) => (s.id === id ? { ...s, connected: true } : s));
      this.emit({ type: 'status', sensors: this.sensors });
    }
  }

  async calibrate() {
    await wait(2500);
  }

  setExercise(id: string) {
    this.exercise = id;
  }

  startSet() {
    this.t0 = this.last = Date.now();
    this.rep = 0;
    this.phase = 0;
    // Demo works even if the pods were skipped during setup.
    if (!this.sensors.some((s) => s.connected)) {
      this.sensors = this.sensors.map((s) => ({ ...s, connected: true }));
      this.emit({ type: 'status', sensors: this.sensors });
    }
    this.start();
  }

  subscribe(cb: (e: SensorEvent) => void) {
    this.listeners.add(cb);
    cb({ type: 'status', sensors: this.sensors });
    return () => {
      this.listeners.delete(cb);
    };
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
    this.timer = setInterval(() => {
      const now = Date.now();
      const dt = (now - this.last) / 1000;
      this.last = now;
      const p = REP_PATTERN[this.rep % REP_PATTERN.length];
      this.phase += dt / p.dur;
      if (this.phase >= 1) {
        this.phase -= 1;
        this.rep += 1;
      }
      const cur = REP_PATTERN[this.rep % REP_PATTERN.length];
      // 0 → 1 → 0 over one rep, with a short pause at the bottom
      const x = Math.min(1, this.phase / 0.9);
      const curve = (1 - Math.cos(x * Math.PI * 2)) / 2;
      const noise = () => (Math.random() - 0.5) * 1.5;
      const lat = this.exercise === 'lateral_raise';
      const amt = curve * cur.range;
      const sample: JointSample = lat
        ? {
            t: now - this.t0,
            left: { elbowFlexion: 18 + noise(), shoulderAbduction: 10 + amt * 80 * 0.93 + noise(), supination: 5 },
            right: { elbowFlexion: 15 + noise(), shoulderAbduction: 10 + amt * 82 + noise(), supination: 5 },
          }
        : {
            t: now - this.t0,
            left: {
              elbowFlexion: 20 + amt * 122 * 0.94 + noise(),
              shoulderAbduction: 8 + curve * (4 + cur.swing) + noise(),
              supination: this.exercise === 'hammer_curl' ? 5 : curve * 70,
            },
            right: {
              elbowFlexion: 20 + amt * 122 + noise(),
              shoulderAbduction: 6 + curve * (3 + cur.swing) + noise(),
              supination: this.exercise === 'hammer_curl' ? 5 : curve * 75,
            },
          };
      this.emit({ type: 'sample', sample });
    }, 40);
  }
}
