import test from 'node:test';
import assert from 'node:assert/strict';
import { routeSegment, parseRoute, buildRoute } from '../src/utils/hash-route.ts';

test('option names become safe path segments', () => {
  assert.equal(routeSegment(' CIV DB '), 'CIV_DB');
  assert.equal(routeSegment('Starry Sky'), 'Starry_Sky');
  assert.equal(routeSegment('璃风'), '璃风');
  assert.equal(routeSegment('../a/b?#'), 'a_b');
  assert.equal(routeSegment('..'), '');
});

test('nested routes keep the top-level section', () => {
  assert.deepEqual(parseRoute('#world/CIV_DB'), { section: 'world', segments: ['CIV_DB'], params: {} });
  assert.equal(parseRoute('#operator/lifeng').section, 'operator');
  assert.equal(parseRoute('#media/visual_archive/Starry_Sky').segments[1], 'Starry_Sky');
});

test('encoded Chinese and legacy spaces are accepted and normalized', () => {
  assert.equal(parseRoute('#world/CIV%20DB').segments[0], 'CIV_DB');
  assert.equal(parseRoute('#operator/%E7%92%83%E9%A3%8E').segments[0], '璃风');
});

test('malformed and unknown roots safely fall back', () => {
  for (const hash of ['#unknown/a', '#world/%E0%A4%A', '#world/..', '#world/a%2Fb']) {
    assert.deepEqual(parseRoute(hash), { section: 'index', segments: [], params: {} });
  }
});

test('paging and concurrent options survive link round trips', () => {
  const hash = buildRoute('information', ['世界 设定'], { slide: '2' });
  assert.equal(hash, '#information/%E4%B8%96%E7%95%8C_%E8%AE%BE%E5%AE%9A?slide=2');
  assert.deepEqual(parseRoute(hash), { section: 'information', segments: ['世界_设定'], params: { slide: '2' } });
  assert.equal(buildRoute('world', [], { page: '2' }), '#world?page=2');
});
