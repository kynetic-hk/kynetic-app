import { JointSample } from '../sensors/types';

export type ExerciseId = 'bicep_curl' | 'hammer_curl' | 'lateral_raise' | 'shoulder_press' | 'tricep_pushdown';

type Arm = JointSample['left'];

export interface Exercise {
  id: ExerciseId;
  name: string;
  short: string;
  muscles: string[];
  status: 'ready' | 'beta' | 'soon'; // matches firmware progress
  /** Angle that defines a rep, in degrees. */
  primary: (a: Arm) => number;
  /** Angle that should stay still; drift here is bad form. */
  stabiliser: (a: Arm) => number;
  stabiliserLimit: number; // degrees of drift allowed before it counts as cheating
  bottom: number; // start angle
  top: number; // full-range angle
  primaryLabel: string;
  cues: string[]; // how to do it
  mistakes: string[];
  idealTempo: [number, number]; // seconds per rep
}

export const EXERCISES: Exercise[] = [
  {
    id: 'bicep_curl',
    name: 'Bicep Curl',
    short: 'Curl',
    muscles: ['Biceps', 'Forearms'],
    status: 'ready',
    primary: (a) => a.elbowFlexion,
    stabiliser: (a) => a.shoulderAbduction,
    stabiliserLimit: 12,
    bottom: 20,
    top: 140,
    primaryLabel: 'Elbow flexion',
    cues: ['Stand tall, palms facing forward', 'Keep elbows pinned to your sides', 'Curl all the way up, squeeze', 'Lower slowly for 2 seconds'],
    mistakes: ['Swinging the body to lift', 'Elbows drifting forward', 'Stopping halfway up or down'],
    idealTempo: [2.2, 4],
  },
  {
    id: 'hammer_curl',
    name: 'Hammer Curl',
    short: 'Hammer',
    muscles: ['Brachialis', 'Biceps', 'Forearms'],
    status: 'ready',
    primary: (a) => a.elbowFlexion,
    stabiliser: (a) => a.shoulderAbduction,
    stabiliserLimit: 12,
    bottom: 20,
    top: 135,
    primaryLabel: 'Elbow flexion',
    cues: ['Palms face each other the whole time', 'Elbows stay by your sides', 'Lift to shoulder height', 'Control the way down'],
    mistakes: ['Rotating the wrists', 'Using momentum', 'Shrugging the shoulders'],
    idealTempo: [2.2, 4],
  },
  {
    id: 'lateral_raise',
    name: 'Lateral Raise',
    short: 'Lat raise',
    muscles: ['Side delts', 'Traps'],
    status: 'beta',
    primary: (a) => a.shoulderAbduction,
    stabiliser: (a) => a.elbowFlexion,
    stabiliserLimit: 25,
    bottom: 10,
    top: 85,
    primaryLabel: 'Shoulder abduction',
    cues: ['Slight bend in the elbows', 'Raise arms out to the side', 'Stop at shoulder height', 'Lower slowly'],
    mistakes: ['Shrugging up with the traps', 'Going above shoulder height', 'Bending the elbows more as you lift'],
    idealTempo: [2.2, 4],
  },
  {
    id: 'shoulder_press',
    name: 'Seated Shoulder Press',
    short: 'Press',
    muscles: ['Front delts', 'Triceps'],
    status: 'soon',
    primary: (a) => a.shoulderAbduction,
    stabiliser: (a) => a.supination,
    stabiliserLimit: 20,
    bottom: 80,
    top: 170,
    primaryLabel: 'Shoulder elevation',
    cues: ['Back flat against the bench', 'Start with hands at ear height', 'Press straight up', 'Lower under control'],
    mistakes: ['Arching the lower back', 'Pressing forward instead of up', 'Half reps'],
    idealTempo: [2, 4],
  },
  {
    id: 'tricep_pushdown',
    name: 'Tricep Pushdown',
    short: 'Pushdown',
    muscles: ['Triceps'],
    status: 'soon',
    primary: (a) => 160 - a.elbowFlexion,
    stabiliser: (a) => a.shoulderAbduction,
    stabiliserLimit: 12,
    bottom: 60,
    top: 160,
    primaryLabel: 'Elbow extension',
    cues: ['Elbows tucked at your sides', 'Push down until arms are straight', 'Pause and squeeze', 'Let the bar rise slowly'],
    mistakes: ['Elbows flaring out', 'Leaning over the bar', 'Not locking out'],
    idealTempo: [2, 4],
  },
];

export const exerciseById = (id: ExerciseId | string) => EXERCISES.find((e) => e.id === id) ?? EXERCISES[0];
