import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('HTML Title', () => {
  test('public/index.html contains "Demo Example" in title tag', () => {
    const htmlPath = join(__dirname, '..', 'public', 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/);
    assert.ok(titleMatch, 'Title tag not found in HTML');
    
    const titleText = titleMatch[1];
    assert.equal(titleText, 'Demo Example', `Expected title to be "Demo Example", but got "${titleText}"`);
  });
});
