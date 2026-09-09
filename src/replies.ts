export const Dprompts = [
  ['hi', 'hey', 'hello', 'good morning', 'good afternoon'],
  ['how are you', 'how is life', 'how are things'],
  ['who are you', 'are you a bot', 'are you human'],
  ['help', 'help me', 'what can you do'],
  ['thanks', 'thank you'],
  ['bye', 'goodbye', 'see you later'],
] as const;
export const DReplies = [
  ['Hello! How can I help?', 'Hi there! What would you like to know?'],
  ["I'm ready to help. How are you?"],
  ["I'm a chatbot built with react-chat-bot42."],
  [
    'I can answer configured questions. Try saying hello, or connect me to your own response provider.',
  ],
  ["You're welcome!"],
  ['Goodbye! Have a great day.'],
] as const;
export const DnotFound = [
  "I don't have an answer for that yet. Could you try another question?",
] as const;
/** Preserve Unicode letters and numbers, normalize punctuation and whitespace. */
export function normalizeInput(input: string): string {
  return input
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’']/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}
export interface ReplyOptions {
  prompts?: readonly (readonly string[])[];
  replies?: readonly (readonly string[])[];
  fallback?: readonly string[];
}
function choose(values: readonly string[] | undefined): string | undefined {
  const valid = values?.filter(
    (value) => typeof value === 'string' && value.trim(),
  );
  return valid?.length
    ? valid[Math.floor(Math.random() * valid.length)]
    : undefined;
}
export function getLocalReply(
  input: string,
  {
    prompts = Dprompts,
    replies = DReplies,
    fallback = DnotFound,
  }: ReplyOptions = {},
): string {
  const normalized = normalizeInput(input);
  const index = normalized
    ? prompts.findIndex((group) =>
        group.some((prompt) => normalizeInput(prompt) === normalized),
      )
    : -1;
  return (
    (index >= 0 ? choose(replies[index]) : undefined) ??
    choose(fallback) ??
    DnotFound[0]
  );
}
