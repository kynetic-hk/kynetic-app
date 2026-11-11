export type ExerciseId = 'bicep_curl' | 'hammer_curl' | 'lateral_raise' | 'shoulder_press' | 'tricep_pushdown';

export interface Exercise {
  id: ExerciseId;
  name: string;
  muscles: string[];
  status: 'ready' | 'beta' | 'soon'; // matches firmware progress
}

export const EXERCISES: Exercise[] = [
  { id: 'bicep_curl', name: 'Bicep Curl', muscles: ['Biceps', 'Forearms'], status: 'ready' },
  { id: 'hammer_curl', name: 'Hammer Curl', muscles: ['Brachialis', 'Biceps', 'Forearms'], status: 'ready' },
  { id: 'lateral_raise', name: 'Lateral Raise', muscles: ['Side delts', 'Traps'], status: 'beta' },
  { id: 'shoulder_press', name: 'Seated Shoulder Press', muscles: ['Front delts', 'Triceps'], status: 'soon' },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', muscles: ['Triceps'], status: 'soon' },
];

export const exerciseById = (id: ExerciseId) => EXERCISES.find((e) => e.id === id)!;
