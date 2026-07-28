import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('CSS Background Color - Purple Theme', () => {
  test('public/style.css contains purple background color in :root --bg variable', () => {
    const cssPath = join(__dirname, '..', 'public', 'style.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    
    // Check that --bg is set to a purple value
    const bgMatch = cssContent.match(/--bg:\s*([#a-fA-F0-9]+);/);
    assert.ok(bgMatch, 'CSS should contain --bg variable');
    
    const bgValue = bgMatch[1].toLowerCase();
    // Purple values: #2a0a3a, #800080, #9370DB, etc.
    assert.match(bgValue, /^#[0-9a-f]{6}$/, 'Background color should be a valid hex color');
    
    // Verify it's in purple range (high red and blue, low green)
    const r = parseInt(bgValue.slice(1, 3), 16);
    const g = parseInt(bgValue.slice(3, 5), 16);
    const b = parseInt(bgValue.slice(5, 7), 16);
    
    assert.ok(r > 0 && b > 0 && g < r && g < b, 'Color should be purple (red and blue dominant, green low)');
  });

  test('public/style.css body background uses purple gradient', () => {
    const cssPath = join(__dirname, '..', 'public', 'style.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    
    // Check that body background contains a purple gradient color
    const bodyMatch = cssContent.match(/body\s*{[^}]*background:\s*radial-gradient\([^)]*,\s*([#a-fA-F0-9]+)/);
    assert.ok(bodyMatch, 'body should have radial-gradient background');
    
    const gradientColor = bodyMatch[1].toLowerCase();
    assert.match(gradientColor, /^#[0-9a-f]{6}$/, 'Gradient color should be a valid hex color');
    
    // Verify gradient color is purple-ish
    const r = parseInt(gradientColor.slice(1, 3), 16);
    const g = parseInt(gradientColor.slice(3, 5), 16);
    const b = parseInt(gradientColor.slice(5, 7), 16);
    
    assert.ok(r > 0 && b > 0 && g < r && g < b, 'Gradient color should be purple');
  });

  test('public/index.html references public/style.css', () => {
    const htmlPath = join(__dirname, '..', 'public', 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    assert.match(htmlContent, /href=["'].*style\.css["']/, 'HTML should reference style.css');
  });
});
