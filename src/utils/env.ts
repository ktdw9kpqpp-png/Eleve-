import Constants from 'expo-constants';

type Extra = {
  anthropicApiKey?: string;
};

function readExtra(): Extra {
  const extra = Constants.expoConfig?.extra as Extra | undefined;
  return extra ?? {};
}

export function getAnthropicApiKey(): string | null {
  const key = readExtra().anthropicApiKey;
  return key && key.length > 0 ? key : null;
}
