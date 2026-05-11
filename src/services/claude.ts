import type { ChatMessage } from '@/types/domain';
import { getAnthropicApiKey } from '@/utils/env';

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 1024;

export class ClaudeError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ClaudeError';
  }
}

type AnthropicMessage = { role: 'user' | 'assistant'; content: string };

type AnthropicResponse = {
  id: string;
  content: Array<{ type: 'text'; text: string } | { type: string }>;
  stop_reason: string | null;
};

export type SendCoachMessageInput = {
  systemPrompt: string;
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
};

export type SendCoachMessageResult = {
  text: string;
  stopReason: string | null;
};

/**
 * Sends a message to Luna (the AI coach).
 * System prompt is built per-call from the user profile + cycle context (spec §14.1).
 *
 * SECURITY: this calls Anthropic directly from the client using an API key
 * bundled via expo-constants. For production, proxy through a trusted backend
 * so the key never ships in the app binary.
 */
export async function sendCoachMessage(
  input: SendCoachMessageInput,
): Promise<SendCoachMessageResult> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new ClaudeError('ANTHROPIC_API_KEY is not configured. Check .env.');
  }

  const body = {
    model: input.model ?? DEFAULT_MODEL,
    max_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
    system: input.systemPrompt,
    messages: toAnthropicMessages(input.messages),
    ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': API_VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      payload = await res.text();
    }
    throw new ClaudeError(`Claude API error (${res.status})`, res.status, payload);
  }

  const data = (await res.json()) as AnthropicResponse;
  const text = data.content
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
    .map((b) => b.text)
    .join('');

  return { text, stopReason: data.stop_reason };
}

function toAnthropicMessages(messages: ChatMessage[]): AnthropicMessage[] {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}
