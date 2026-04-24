import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';

type Props = {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  continueLabel?: string;
  continueDisabled?: boolean;
  onContinue: () => void;
  onBack?: () => void;
};

export function StepLayout({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  continueLabel = 'Devam',
  continueDisabled,
  onContinue,
  onBack,
}: Props) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, step / totalSteps));

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.bg }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.bgElevated }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${pct * 100}%`, backgroundColor: theme.colors.accent },
              ]}
            />
          </View>
          <Text variant="caption" color="textDim" style={{ marginTop: 8 }}>
            {step} / {totalSteps}
          </Text>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="h1">{title}</Text>
          {subtitle ? (
            <Text variant="body" color="textMuted" style={{ marginTop: 8 }}>
              {subtitle}
            </Text>
          ) : null}
          <View style={{ marginTop: 24 }}>{children}</View>
        </ScrollView>

        <View style={styles.footer}>
          {onBack ? (
            <Button label="Geri" variant="ghost" onPress={onBack} style={{ flex: 1 }} />
          ) : null}
          <Button
            label={continueLabel}
            onPress={onContinue}
            disabled={continueDisabled}
            style={{ flex: 2 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%' },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
});
