import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdentity, parseIdentity, specialIdentity } from '../src/utils/identity.ts';

test('first visit and corrupt storage require a choice', () => {
  for (const value of [null, '', '{', '{}', '{"version":1,"kind":"member","name":"  "}', '{"version":2,"kind":"guest"}']) {
    assert.equal(parseIdentity(value), null);
  }
});
test('guest and ordinary names survive storage round trips', () => {
  for (const input of [null, '  风旅人  ', '昵称'.repeat(40), '<script>alert(1)</script>']) {
    const identity = createIdentity(input);
    assert.deepEqual(parseIdentity(JSON.stringify(identity)), identity);
  }
  assert.equal(createIdentity('  '), null);
  assert.equal(createIdentity('  风旅人  ').name, '风旅人');
});
test('special aliases match exactly, case insensitively, with bilingual display', () => {
  for (const name of ['Mosae', 'Mosae', '墨薛', '  Mosae  ']) {
    assert.deepEqual(specialIdentity(name), { name: '墨薛', english: 'Mosae', code: '009', signature: '喵喵' });
  }
  assert.equal(specialIdentity('Mosae123'), undefined);
  assert.equal(specialIdentity('游客'), undefined);
});
