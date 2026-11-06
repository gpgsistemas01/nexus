import { webcrypto } from 'node:crypto';
import { expect, it, vi } from 'vitest';
import { createUuid } from '../../../../src/shared/utils/createUuid.js';

const uuidV4 = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/;

it.each(['native', 'fallback'] as const)(
  'genera identidades UUID v4 distintas con la implementación %s',
  (implementation) => {
    vi.stubGlobal(
      'crypto',
      implementation === 'native'
        ? webcrypto
        : { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) },
    );
    const first = createUuid();
    const second = createUuid();
    expect(first).toMatch(uuidV4);
    expect(second).toMatch(uuidV4);
    expect(first).not.toBe(second);
  },
);

it('fija versión y variante sin depender de randomUUID en HTTP', () => {
  vi.stubGlobal('crypto', { getRandomValues: (bytes: Uint8Array) => bytes.fill(0xff) });
  expect(createUuid()).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
});
