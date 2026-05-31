import { useCallback, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import { useChatStore } from '@/state/chatStore';
import { useDailyStore } from '@/state/dailyStore';
import { useSettingsStore } from '@/state/settingsStore';
import { useUserStore } from '@/state/userStore';
import { computePhase } from '@/utils/cycle';
import { ChatInput } from './luna/ChatInput';
import { MessageBubble } from './luna/MessageBubble';
import { TypingIndicator } from './luna/TypingIndicator';

export function LunaScreen() {
  const theme = useTheme();
  const profile = useUserStore((s) => s.profile);
  const language = useSettingsStore((s) => s.language) ?? 'tr';

  const messages = useChatStore((s) => s.messages);
  const status = useChatStore((s) => s.status);
  const error = useChatStore((s) => s.error);
  const planNote = useChatStore((s) => s.lastPlanNote);
  const send = useChatStore((s) => s.send);
  const dismissError = useChatStore((s) => s.dismissError);
  const dismissPlanNote = useChatStore((s) => s.dismissPlanNote);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 40);
    return () => clearTimeout(id);
  }, [messages.length, status]);

  const buildContext = useCallback(() => {
    const daily = useDailyStore.getState();
    const today = daily.getToday();
    const c = profile.cycle;
    const phase =
      c?.lastPeriodStart
        ? computePhase({
            lastPeriodStart: c.lastPeriodStart,
            averageCycleDays: c.averageCycleDays || 28,
          })
        : null;
    return {
      profile,
      phase,
      today,
      streak: daily.streak,
      waterGoal: daily.waterGoal,
      language,
    };
  }, [profile, language]);

  const onSend = useCallback(
    (text: string) => {
      void send(text, buildContext);
    },
    [send, buildContext],
  );

  const petName = profile.pet?.name ?? 'Luna';
  const petAvatar = profile.pet?.avatar ?? '🌙';

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.root, { backgroundColor: theme.colors.bg }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.header}>
          <View style={[styles.headerAvatar, { backgroundColor: theme.colors.bgElevated }]}>
            <Text style={{ fontSize: 22 }}>{petAvatar}</Text>
          </View>
          <View>
            <Text variant="overline" color="textMuted">
              AI KOÇ
            </Text>
            <Text variant="h2">{petName}</Text>
          </View>
        </View>

        {planNote ? (
          <Pressable onPress={dismissPlanNote} style={styles.noteRow}>
            <View
              style={[
                styles.note,
                {
                  backgroundColor: theme.colors.bgElevated,
                  borderColor: theme.colors.accent,
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <Text variant="caption" color="accent">
                Bugünün planı güncellendi: {planNote}
              </Text>
            </View>
          </Pressable>
        ) : null}

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 ? (
            <View style={styles.empty}>
              <Text variant="h3" color="textMuted">
                Merhaba {profile.name ?? ''} 👋
              </Text>
              <Text variant="body" color="textDim" style={{ marginTop: 6, textAlign: 'center' }}>
                Nasılsın bugün? Antrenman, beslenme, döngü — ne istersen konuşabiliriz.
              </Text>
            </View>
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} petAvatar={petAvatar} />)
          )}
          {status === 'sending' ? (
            <TypingIndicator petAvatar={petAvatar} petName={petName} />
          ) : null}
        </ScrollView>

        {error ? (
          <Pressable onPress={dismissError} style={styles.errRow}>
            <View
              style={[
                styles.err,
                {
                  backgroundColor: theme.colors.bgElevated,
                  borderColor: theme.colors.danger,
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <Text variant="caption" color="danger">
                {error} (dokunup kapat)
              </Text>
            </View>
          </Pressable>
        ) : null}

        <ChatInput onSend={onSend} disabled={status === 'sending'} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteRow: { paddingHorizontal: 16, marginBottom: 4 },
  note: {
    padding: 10,
    borderWidth: 1,
  },
  errRow: { paddingHorizontal: 16, marginBottom: 4 },
  err: {
    padding: 10,
    borderWidth: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
});
