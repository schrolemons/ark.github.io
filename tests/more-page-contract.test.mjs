import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/_views/05-More.tsx', 'utf8');
const footer = fs.readFileSync('src/pages/_views/components/Footer.tsx', 'utf8');

test('More page exposes archive intro, project metadata and system status', () => {
  for (const marker of ['data-more-page', 'PROJECT ARCHIVE', 'SYSTEM STATUS', 'PROJECTS', 'LAST UPDATE']) {
    assert.match(source, new RegExp(marker));
  }
});

test('More links have English deep-link slugs', () => {
  for (const slug of ['repository', 'documentation', 'author_profile']) {
    assert.match(source, new RegExp(`slug: ['\"]${slug}['\"]`));
  }
  assert.match(source, /navigateRoute\("more"/);
});

test('More page keeps a dedicated footer archive label', () => {
  assert.match(footer, /END OF ARCHIVE/);
  assert.match(footer, /the ark from Ninth Edge/);
});
