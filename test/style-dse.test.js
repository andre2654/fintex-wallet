import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('CSS Background Color - Purple Theme', () => {
  test('public/style.css contains purple background color in :root', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Verify --bg CSS variable is set to a purple value
    const bgMatch = cssContent.match(/--bg:\s*([#\w]+);/);
    assert.ok(bgMatch, 'CSS variable --bg should be defined');
    
    const bgValue = bgMatch[1];
    // Purple hex values typically start with #1 or #2 or #3 in the 0a0c10 range changed to purple
    assert.match(bgValue, /^#[0-9a-f]{6}$/i, 'Background color should be a valid hex color');
    
    // Verify it's a purple-ish value (not the old dark blue #0a0c10)
    assert.notEqual(bgValue, '#0a0c10', 'Background should not be the old dark blue color');
    assert.equal(bgValue, '#1a0a2e', 'Background should be set to purple value #1a0a2e');
  });

  test('public/style.css body background uses purple gradient', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Verify body background gradient contains purple color
    const bodyMatch = cssContent.match(/body\s*{[^}]*background:\s*radial-gradient\([^)]+#([0-9a-f]{6})[^)]*\)/);
    assert.ok(bodyMatch, 'Body should have a radial-gradient background');
    
    const gradientColor = bodyMatch[1];
    // Old value was #16203a, new purple value should be #5d3aa1
    assert.notEqual(gradientColor, '16203a', 'Gradient should not use old dark blue');
    assert.equal(gradientColor, '5d3aa1', 'Gradient should use purple color #5d3aa1');
  });

  test('public/style.css accent color is updated to purple', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Verify --accent CSS variable is set to purple
    const accentMatch = cssContent.match(/--accent:\s*([#\w]+);/);
    assert.ok(accentMatch, 'CSS variable --accent should be defined');
    
    const accentValue = accentMatch[1];
    assert.equal(accentValue, '#8b5cf6', 'Accent color should be purple #8b5cf6');
  });
});
