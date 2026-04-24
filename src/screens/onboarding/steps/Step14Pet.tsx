import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { DotsPicker } from '@/components/DotsPicker';
import { StepLayout } from '@/components/StepLayout';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/theme';
import type { StepProps } from './types';

const AVATARS = ['🌙', '🦊', '🐻', '🐱', '🪷', '⭐', '🌸', '🔥'];

export function Step14Pet({ profile, update, onContinue, onBack, step, totalSteps }: StepProps) {
  const theme = useTheme();
  const [name, setName] = useState(profile.pet?.name ?? 'Luna');
  const [avatar, setAvatar] = useState(profile.pet?.avatar ?? '🌙');
  const [playful, setPlayful] = useState<number>(profile.pet?.playful ?? 3);
  const [calm, setCalm] = useState<number>(profile.pet?.calm ?? 3);

  const valid = name.trim().length > 0 && avatar.length > 0;

  const handleContinue = () => {
    if (!valid) return;
    update({ pet: { name: name.trim(), avatar, playful, calm } });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Koçuna bir kimlik ver"
      subtitle="Onunla konuşma tonunu sen seçiyorsun."
      continueLabel="Başlayalım"
      continueDisabled={!valid}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={{ gap: 24 }}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <View
            style={[
              styles.avatarBubble,
              { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border },
            ]}
          >
            <Text style={{ fontSize: 56 }}>{avatar}</Text>
          </View>
        </View>

        <View>
          <Text variant="overline" color="textMuted" style={{ marginBottom: 10 }}>
            AVATAR
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {AVATARS.map((a) => {
              const selected = a === avatar;
              return (
                <Pressable
                  key={a}
                  onPress={() => setAvatar(a)}
                  style={[
                    styles.avatarPick,
                    {
                      backgroundColor: selected ? theme.colors.accent : theme.colors.bgElevated,
                      borderColor: selected ? theme.colors.accent : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 26 }}>{a}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <TextField
          label="İSİM"
          value={name}
          onChangeText={setName}
          placeholder="Luna"
          autoCapitalize="words"
          maxLength={20}
        />

        <View>
          <Text variant="overline" color="textMuted" style={{ marginBottom: 10 }}>
            ŞAKACI ↔ CİDDİ
          </Text>
          <DotsPicker value={playful} onChange={setPlayful} />
        </View>

        <View>
          <Text variant="overline" color="textMuted" style={{ marginBottom: 10 }}>
            MOTİVE EDİCİ ↔ SAKİN
          </Text>
          <DotsPicker value={calm} onChange={setCalm} />
        </View>
      </View>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  avatarBubble: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarPick: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
