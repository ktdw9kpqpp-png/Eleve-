import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserStore } from '@/state/userStore';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import { Step01BasicInfo } from './steps/Step01BasicInfo';
import { Step02Goals } from './steps/Step02Goals';
import { Step03FitnessLevel } from './steps/Step03FitnessLevel';
import { Step04PreferredWorkouts } from './steps/Step04PreferredWorkouts';
import { Step05Location } from './steps/Step05Location';
import { Step06WeeklyFrequency } from './steps/Step06WeeklyFrequency';
import { Step07Cycle } from './steps/Step07Cycle';
import { Step08HealthConditions } from './steps/Step08HealthConditions';
import { Step09Dietary } from './steps/Step09Dietary';
import { Step10Lifestyle } from './steps/Step10Lifestyle';
import { Step11SleepPattern } from './steps/Step11SleepPattern';
import { Step12StressLevel } from './steps/Step12StressLevel';
import { Step13WorkoutTime } from './steps/Step13WorkoutTime';
import { Step14Pet } from './steps/Step14Pet';
import type { StepProps } from './steps/types';

const STEPS: React.ComponentType<StepProps>[] = [
  Step01BasicInfo,
  Step02Goals,
  Step03FitnessLevel,
  Step04PreferredWorkouts,
  Step05Location,
  Step06WeeklyFrequency,
  Step07Cycle,
  Step08HealthConditions,
  Step09Dietary,
  Step10Lifestyle,
  Step11SleepPattern,
  Step12StressLevel,
  Step13WorkoutTime,
  Step14Pet,
];

export function OnboardingScreen() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const setOnboarded = useUserStore((s) => s.setOnboarded);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Onboarding'>>();

  const [stepIndex, setStepIndex] = useState(0);

  const totalSteps = STEPS.length;
  const CurrentStep = STEPS[stepIndex];
  if (!CurrentStep) return null;

  const finish = () => {
    setOnboarded(true);
    navigation.replace('Main');
  };

  const onContinue = () => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1);
    } else {
      finish();
    }
  };

  const onBack = stepIndex > 0 ? () => setStepIndex((i) => i - 1) : undefined;

  return (
    <CurrentStep
      profile={profile}
      update={updateProfile}
      onContinue={onContinue}
      onBack={onBack}
      step={stepIndex + 1}
      totalSteps={totalSteps}
    />
  );
}
