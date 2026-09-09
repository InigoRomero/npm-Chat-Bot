import type { CSSProperties, ReactNode } from 'react';
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  status: 'complete' | 'streaming' | 'error' | 'cancelled';
}
export interface ResponseContext {
  messages: readonly ChatMessage[];
  signal: AbortSignal;
}
/** Async iterables yield text deltas (not accumulated text). */
export type ResponseResult = string | AsyncIterable<string>;
export type ResponseProvider = (
  input: string,
  context: ResponseContext,
) => ResponseResult | Promise<ResponseResult>;
export interface ChatOptions {
  PromptsBot?: readonly (readonly string[])[];
  RepliesBot?: readonly (readonly string[])[];
  notFoundBot?: readonly string[];
  welcomeMessage?: string | false;
  initialMessages?: readonly ChatMessage[];
  getResponse?: ResponseProvider;
  responseDelay?: number;
  /** Opt in to browser localStorage. Use a different key per conversation. */
  storageKey?: string;
  maxMessages?: number;
  maxLength?: number;
  onMessagesChange?: (messages: readonly ChatMessage[]) => void;
  onError?: (error: Error) => void;
}
export interface ChatLabels {
  title: string;
  input: string;
  placeholder: string;
  send: string;
  stop: string;
  clear: string;
  retry: string;
  typing: string;
  error: string;
  user: string;
  assistant: string;
  readAloud: string;
}
export interface ReactChatBotProps extends ChatOptions {
  botIcon?: string;
  userIcon?: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  labels?: Partial<ChatLabels>;
  suggestions?: readonly string[];
  disabled?: boolean;
  /** Show opt-in speech synthesis controls when supported by the browser. */
  speech?: boolean;
  speechLang?: string;
  renderMessage?: (message: ChatMessage) => ReactNode;
}
