import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Background Color Styling', () => {
  test('public/style.css contains blue background color', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Verify that the body element has a blue background
    // The fix changes the background to use blue hex colors (#1e3a8a and #0c1d4a)
    const hasBlueBackground = 
      cssContent.includes('#1e3a8a') || 
      cssContent.includes('#0c1d4a') ||
      cssContent.includes('background: blue') ||
      cssContent.includes('background-color: blue');
    
    assert.ok(
      hasBlueBackground,
      'style.css should contain blue background color (either #1e3a8a, #0c1d4a, or blue keyword)'
    );
  });

  test('public/style.css body element has background property', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Extract body rule
    const bodyRuleMatch = cssContent.match(/body\s*\{[^}]*\}/);
    assert.ok(bodyRuleMatch, 'style.css should contain a body rule');
    
    const bodyRule = bodyRuleMatch[0];
    const hasBackgroundProperty = bodyRule.includes('background');
    assert.ok(hasBackgroundProperty, 'body rule should contain a background property');
  });

  test('public/style.css does not use old dark gradient without blue', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Verify the old dark gradient is replaced with blue tones
    const hasOldGradient = cssContent.includes('var(--bg)');
    assert.equal(
      hasOldGradient,
      false,
      'style.css should not use var(--bg) in the body background (should use blue colors instead)'
    );
  });
});
