import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('CSS Background Color', () => {
  test('public/style.css body background is yellow', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Extract body rule
    const bodyRuleMatch = cssContent.match(/body\s*\{([^}]+)\}/);
    assert.ok(bodyRuleMatch, 'body rule should exist in CSS');
    
    const bodyRule = bodyRuleMatch[1];
    
    // Check for yellow background (exact match or hex/rgb equivalent)
    const hasYellowBg = 
      /background\s*:\s*yellow/i.test(bodyRule) ||
      /background\s*:\s*#ffff00/i.test(bodyRule) ||
      /background\s*:\s*#FFFF00/i.test(bodyRule) ||
      /background\s*:\s*rgb\s*\(\s*255\s*,\s*255\s*,\s*0\s*\)/i.test(bodyRule);
    
    assert.ok(hasYellowBg, 'body background should be set to yellow or equivalent');
  });

  test('public/index.html references public/style.css', () => {
    const htmlPath = join(__dirname, '..', 'public', 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    const hasStyleLink = /href\s*=\s*["'].*style\.css["']/i.test(htmlContent);
    assert.ok(hasStyleLink, 'index.html should reference style.css');
  });
});
