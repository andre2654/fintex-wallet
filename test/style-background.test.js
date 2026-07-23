import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('CSS Background Color', () => {
  test('verifica que public/style.css contém background: red para body', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Verifica que a regra body contém background: red
    const bodyRuleMatch = cssContent.match(/body\s*\{[^}]*background:\s*red[^}]*\}/);
    assert.ok(bodyRuleMatch, 'body deve ter background: red definido em public/style.css');
  });

  test('verifica que public/index.html está linkado ao style.css', () => {
    const htmlPath = join(__dirname, '..', 'public', 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    // Verifica que existe um link para style.css
    const linkMatch = htmlContent.match(/<link[^>]*href=["'].*style\.css["'][^>]*>/);
    assert.ok(linkMatch, 'public/index.html deve linkar public/style.css');
  });

  test('verifica que style.css não contém mais o gradiente radial anterior', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Verifica que o gradiente antigo foi removido
    const oldGradientMatch = cssContent.match(/radial-gradient\(1200px\s*600px\s*at\s*70%\s*-10%/);
    assert.equal(oldGradientMatch, null, 'O gradiente radial antigo não deve estar presente');
  });
});
