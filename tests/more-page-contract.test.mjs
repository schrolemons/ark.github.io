import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/_views/05-More.tsx', 'utf8');
const footer = fs.readFileSync('src/pages/_views/components/Footer.tsx', 'utf8');
const breakingNewsEndpoint = fs.readFileSync('src/pages/world/breaking-news.json.ts', 'utf8');

test('More page exposes archive intro, project metadata and system status', () => {
  for (const marker of ['data-more-page', 'PROJECT ARCHIVE', 'SYSTEM STATUS', 'PROJECTS', 'LAST UPDATE']) {
    assert.match(source, new RegExp(marker));
  }
  assert.match(source, /fetch\(window\.location\.href/);
  assert.doesNotMatch(source, /<dt[^>]*>VERSION<\/dt>/);
  assert.match(source, /OPERATOR\.data\.length/);
  assert.match(source, /WORLD\??\.items\.length/);
  assert.match(source, /world\/breaking-news\.json/);
  assert.match(source, /category\.totalCount/);
  assert.match(breakingNewsEndpoint, /totalCount/);
  assert.match(breakingNewsEndpoint, /allworld\.filter\(item => item\.data\.category === category\)\.length/);
  assert.match(source, /ARCHIVE_CARDS\.length/);
  for (const marker of ['INFORMATION RECORDS', 'NAVIGATION SECTIONS', 'data-stat="project-records"', 'data-stat="operator-records"', 'data-stat="world-entries"']) {
    assert.match(source, new RegExp(marker));
  }
  assert.doesNotMatch(source, /OPERATOR RECORDS<\/dt>[\s\S]{0,120}>03<\/dd>/);
  assert.doesNotMatch(source, /WORLD ENTRIES<\/dt>[\s\S]{0,120}>08<\/dd>/);
});

test('More links have English deep-link slugs', () => {
  for (const slug of ['repository', 'documentation', 'author_profile']) {
    assert.match(source, new RegExp(`slug: ['\"]${slug}['\"]`));
  }
  assert.match(source, /navigateRoute\("more"/);
  assert.match(source, /href=\{card\.url\}/);
});

test('More page keeps a dedicated footer archive label', () => {
  assert.match(footer, /END OF ARCHIVE/);
  assert.match(footer, /the ARK from the Ninth Edge/);
});
