import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('public/style.css background color', () => {
  test('body background is set to red', () => {
    const stylePath = join(process.cwd(), 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Extract body rule
    const bodyRuleMatch = cssContent.match(/body\s*\{([^}]+)\}/);
    assert.ok(bodyRuleMatch, 'body rule should exist in style.css');
    
    const bodyRule = bodyRuleMatch[1];
    
    // Verify background property contains 'red'
    const backgroundMatch = bodyRule.match(/background\s*:\s*([^;]+);/);
    assert.ok(backgroundMatch, 'background property should exist in body rule');
    
    const backgroundValue = backgroundMatch[1].trim();
    assert.equal(backgroundValue, 'red', 'background should be set to red');
  });

  test('style.css does not contain old radial-gradient background', () => {
    const stylePath = join(process.cwd(), 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    const hasOldGradient = cssContent.includes('radial-gradient(1200px 600px at 70% -10%, #16203a');
    assert.equal(hasOldGradient, false, 'old radial-gradient should be removed');
  });
});
