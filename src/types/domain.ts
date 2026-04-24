// Domain types seeded from eleve-claude-code-prompt.pdf (spec §5, §7, §8, §9, §10.3).
// Contracts only — no implementations yet.

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export type WorkoutType =
  | 'pilates'
  | 'yoga'
  | 'hiit'
  | 'strength'
  | 'swim'
  | 'run'
  | 'dance'
  | 'walk'
  | 'restorative';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Location = 'home' | 'studio' | 'gym' | 'outdoor' | 'pool';
export type Intensity = 'low' | 'medium' | 'high';

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  note?: string;
  videoUrl?: string;
};

export type Workout = {
  id: string;
  name: string;
  duration: number;
  intensity: Intensity;
  type: WorkoutType;
  location: Location[];
  level: FitnessLevel;
  calories: number;
  phase: CyclePhase[];
  exercises: Exercise[];
};

export type DietaryPreference = 'vegetarian' | 'vegan' | 'gluten-free' | 'none';

export type UserProfile = {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  goals: string[];
  fitnessLevel: FitnessLevel;
  preferredWorkouts: WorkoutType[];
  workoutLocation: Location;
  weeklyFrequency: number;
  cycle: {
    lastPeriodStart: string | null;
    averageCycleDays: number;
  };
  healthConditions: string[];
  allergies: string[];
  dietary: DietaryPreference[];
  dislikedFoods: string[];
  lifestyle: 'sedentary' | 'active';
  sleepPattern: 'regular' | 'irregular';
  stressLevel: 'low' | 'medium' | 'high';
  preferredWorkoutTime: 'morning' | 'midday' | 'evening' | 'flexible';
  pet: {
    name: string;
    avatar: string;
    playful: number;
    calm: number;
  };
};

export type BehaviorPatterns = {
  mostSkippedDay: string | null;
  preferredWorkoutTime: UserProfile['preferredWorkoutTime'];
  energyPattern: string | null;
  commonComplaints: string[];
  completionRate: {
    workout: number;
    meal: number;
    study: number;
  };
  streakBreakers: string[];
};

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

export type TaskKind = 'workout' | 'nutrition' | 'study';

export type DailyEntry = {
  /** ISO date string, YYYY-MM-DD, device-local. */
  date: string;
  tasks: Record<TaskKind, boolean>;
  waterCups: number;
};

export type StreakState = {
  current: number;
  /** ISO date of the last day that contributed to the streak. */
  lastActiveDate: string | null;
};

export type PhaseInfo = {
  phase: CyclePhase;
  dayInCycle: number;
  dayInPhase: number;
  phaseLength: number;
  /** Energy %, per spec §7.1. */
  energy: number;
  cycleLength: number;
};
