import { getLocalReply, normalizeInput } from '../src';
it('normalizes both configured prompts and input without losing Unicode or digits', () => {
  expect(normalizeInput('  ¡Envío   42! ')).toBe('envío 42');
  expect(
    getLocalReply('¡ENVÍO 42!', {
      prompts: [['Envío 42']],
      replies: [['Mañana']],
    }),
  ).toBe('Mañana');
  expect(
    getLocalReply('你好', { prompts: [['你好']], replies: [['您好']] }),
  ).toBe('您好');
});
it('falls back for unknown input, missing reply groups and empty replies', () => {
  for (const replies of [[], [[]], [[' ']]])
    expect(
      getLocalReply('hello', {
        prompts: [['hello']],
        replies,
        fallback: ['Fallback'],
      }),
    ).toBe('Fallback');
  expect(getLocalReply('unknown', { fallback: [] })).toBeTruthy();
});
it('uses exact matches, preserving distinctions between product numbers', () => {
  expect(
    getLocalReply('order 43', {
      prompts: [['order 42']],
      replies: [['Found']],
      fallback: ['Missing'],
    }),
  ).toBe('Missing');
});
