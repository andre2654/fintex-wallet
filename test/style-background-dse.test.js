import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Background Color CSS', () => {
  let styleCss;

  before(() => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    styleCss = readFileSync(stylePath, 'utf-8');
  });

  test('body background deve conter gradiente com tons de verde', () => {
    const bodyRuleMatch = styleCss.match(/body\s*\{[^}]*background:[^}]*\}/);
    assert.ok(bodyRuleMatch, 'Regra CSS body não encontrada');
    
    const bodyRule = bodyRuleMatch[0];
    assert.ok(
      bodyRule.includes('#1a4d2e') || bodyRule.includes('green'),
      'Background deve conter cor verde (#1a4d2e ou similar)'
    );
  });

  test('body background deve usar radial-gradient com cores verdes', () => {
    const bodyRuleMatch = styleCss.match(/body\s*\{[^}]*background:[^}]*\}/);
    assert.ok(bodyRuleMatch, 'Regra CSS body não encontrada');
    
    const bodyRule = bodyRuleMatch[0];
    assert.ok(
      bodyRule.includes('radial-gradient'),
      'Background deve usar radial-gradient'
    );
    assert.ok(
      bodyRule.includes('#1a4d2e') && bodyRule.includes('#0d2818'),
      'Gradiente deve conter tons de verde (#1a4d2e e #0d2818)'
    );
  });

  test('style.css deve estar referenciado em index.html', () => {
    const indexPath = join(__dirname, '..', 'public', 'index.html');
    const indexHtml = readFileSync(indexPath, 'utf-8');
    assert.ok(
      indexHtml.includes('style.css'),
      'index.html deve referenciar style.css'
    );
  });
});
