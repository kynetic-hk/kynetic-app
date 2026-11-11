import { Exercise } from '../data/exercises';
import { SetResult } from '../data/sessions';
import { Experience } from '../store/profile';
import { JointSample } from '../sensors/types';

export interface Rep {
  index: number;
  duration: number; // s
  rom: { left: number; right: number }; // % of target range reached
  swing: number; // max stabiliser drift (deg), worst side
  romScore: number; // 0–100
  tempoScore: number;
  formScore: number;
  cue: Cue;
}

export type Cue = { text: string; tone: 'good' | 'warn' | 'bad' };

const clamp = (x: number, a = 0, b = 100) => Math.max(a, Math.min(b, x));

/** How strict scoring is, by experience. */
const STRICT: Record<Experience, number> = { beginner: 0.85, intermediate: 1, advanced: 1.15 };

/**
 * Turns a stream of joint-angle samples into reps.
 * A rep starts when the primary angle rises past 35% of the range and ends when
 * it comes back below 15%. ROM, tempo and form are scored per rep.
 */
export class RepCounter {
  reps: Rep[] = [];
  private up = false;
  private start = 0;
  private peakL = 0;
  private peakR = 0;
  private stabL: [number, number] = [Infinity, -Infinity];
  private stabR: [number, number] = [Infinity, -Infinity];
  private strict: number;

  constructor(private ex: Exercise, experience: Experience = 'intermediate') {
    this.strict = STRICT[experience];
  }

  /** 0–1 progress of each arm through the range, for the live gauge. */
  progress(s: JointSample) {
    const r = this.ex.top - this.ex.bottom;
    return {
      left: clamp((this.ex.primary(s.left) - this.ex.bottom) / r, 0, 1.15),
      right: clamp((this.ex.primary(s.right) - this.ex.bottom) / r, 0, 1.15),
    };
  }

  /** Feed a sample; returns a Rep when one completes. */
  feed(s: JointSample): Rep | null {
    const p = this.progress(s);
    const avg = (p.left + p.right) / 2;
    if (!this.up && avg > 0.35) {
      this.up = true;
      // rep timing starts at the bottom; estimate from when we left 15%
      this.start = s.t - 350;
      this.peakL = this.peakR = 0;
      this.stabL = [Infinity, -Infinity];
      this.stabR = [Infinity, -Infinity];
    }
    if (this.up) {
      this.peakL = Math.max(this.peakL, p.left);
      this.peakR = Math.max(this.peakR, p.right);
      const sl = this.ex.stabiliser(s.left);
      const sr = this.ex.stabiliser(s.right);
      this.stabL = [Math.min(this.stabL[0], sl), Math.max(this.stabL[1], sl)];
      this.stabR = [Math.min(this.stabR[0], sr), Math.max(this.stabR[1], sr)];
      if (avg < 0.15) {
        this.up = false;
        return this.finish(s.t);
      }
    }
    return null;
  }

  private finish(t: number): Rep {
    const duration = (t - this.start) / 1000;
    const romL = clamp(this.peakL * 100, 0, 110);
    const romR = clamp(this.peakR * 100, 0, 110);
    const swing = Math.max(this.stabL[1] - this.stabL[0], this.stabR[1] - this.stabR[0]);

    const romScore = clamp(100 - Math.max(0, 95 - Math.min(romL, romR)) * 2.2 * this.strict);
    const [lo, hi] = this.ex.idealTempo;
    const off = duration < lo ? lo - duration : duration > hi ? duration - hi : 0;
    const tempoScore = clamp(100 - off * 55 * this.strict);
    const over = Math.max(0, swing - this.ex.stabiliserLimit);
    const asym = Math.abs(romL - romR);
    const formScore = clamp(100 - over * 3.5 * this.strict - Math.max(0, asym - 6) * 1.5);

    let cue: Cue = { text: 'Great rep!', tone: 'good' };
    if (romScore < 75) cue = { text: this.ex.id === 'lateral_raise' ? 'Raise to shoulder height' : 'Go all the way up', tone: 'bad' };
    else if (formScore < 75) cue = { text: this.ex.id === 'lateral_raise' ? 'Keep a fixed elbow bend' : 'Keep your elbows pinned', tone: 'bad' };
    else if (duration < lo) cue = { text: 'Slow down on the way down', tone: 'warn' };
    else if (duration > hi) cue = { text: 'A little quicker', tone: 'warn' };
    else if (asym > 6) cue = { text: `${romL < romR ? 'Left' : 'Right'} arm is lagging`, tone: 'warn' };

    const rep: Rep = { index: this.reps.length + 1, duration, rom: { left: romL, right: romR }, swing, romScore, tempoScore, formScore, cue };
    this.reps.push(rep);
    return rep;
  }
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Summarise a finished set into a SetResult. */
export function summariseSet(ex: Exercise, reps: Rep[], durationSec: number): SetResult {
  const rom = Math.round(mean(reps.map((r) => r.romScore)));
  const tempo = Math.round(mean(reps.map((r) => r.tempoScore)));
  const form = Math.round(mean(reps.map((r) => r.formScore)));
  const workL = reps.reduce((a, r) => a + r.rom.left, 0);
  const workR = reps.reduce((a, r) => a + r.rom.right, 0);
  const left = workL + workR > 0 ? Math.round((workL / (workL + workR)) * 100) : 50;
  const balanceScore = clamp(100 - Math.abs(left - (100 - left)) * 4);
  const score = reps.length ? Math.round(rom * 0.4 + form * 0.3 + tempo * 0.2 + balanceScore * 0.1) : 0;
  return {
    exercise: ex.id,
    reps: reps.length,
    score,
    rom,
    tempo,
    form,
    balance: { left, right: 100 - left },
    durationSec: Math.round(durationSec),
    repRom: reps.map((r) => Math.round(Math.min(r.rom.left, r.rom.right))),
    repTempo: reps.map((r) => Math.round(r.duration * 10) / 10),
    repForm: reps.map((r) => Math.round(r.formScore)),
  };
}

/** One-line coaching tip for the end of a set. */
export function setTip(s: SetResult): string {
  const worst = [
    { k: 'rom', v: s.rom, t: 'Focus on full range — finish every rep at the top.' },
    { k: 'tempo', v: s.tempo, t: 'Slow the lowering phase to about 2 seconds.' },
    { k: 'form', v: s.form, t: 'Keep the rest of your body still — no swinging.' },
    { k: 'bal', v: 100 - Math.abs(s.balance.left - s.balance.right) * 4, t: `Let your ${s.balance.left < s.balance.right ? 'left' : 'right'} arm lead next set.` },
  ].sort((a, b) => a.v - b.v)[0];
  return worst.v >= 88 ? 'Excellent set. Keep the same weight and match it next set.' : worst.t;
}
