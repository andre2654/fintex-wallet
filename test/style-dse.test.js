import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Public Style - Background Color', () => {
  test('public/style.css contains background-color: yellow for body element', () => {
    const stylePath = join(process.cwd(), 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Verify that body rule contains yellow background
    const bodyRuleMatch = cssContent.match(/body\s*\{[^}]*background:\s*yellow[^}]*\}/);
    assert.ok(
      bodyRuleMatch,
      'body element should have background: yellow in public/style.css'
    );
  });

  test('public/style.css body rule does not contain old radial-gradient', () => {
    const stylePath = join(process.cwd(), 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Verify old gradient is removed from body
    const bodyRuleMatch = cssContent.match(/body\s*\{[^}]*\}/);
    assert.ok(bodyRuleMatch, 'body rule should exist');
    
    const bodyRule = bodyRuleMatch[0];
    assert.ok(
      !bodyRule.includes('radial-gradient'),
      'body rule should not contain radial-gradient'
    );
  });

  test('public/index.html exists and references style.css', () => {
    const htmlPath = join(process.cwd(), 'public', 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    assert.ok(
      htmlContent.includes('style.css'),
      'index.html should reference style.css'
    );
  });
});
