import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Public Style - Background Color', () => {
  test('body element has purple background color in style.css', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const styleContent = readFileSync(stylePath, 'utf-8');
    
    // Verify that body selector exists and contains purple background
    const bodyRegex = /body\s*\{[^}]*background:\s*purple[^}]*\}/s;
    assert.match(
      styleContent,
      bodyRegex,
      'body element should have background: purple in style.css'
    );
  });

  test('style.css does not contain old radial-gradient background', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const styleContent = readFileSync(stylePath, 'utf-8');
    
    // Verify that the old radial-gradient is removed
    const oldGradientRegex = /radial-gradient\(1200px\s+600px\s+at\s+70%\s+-10%/;
    assert.doesNotMatch(
      styleContent,
      oldGradientRegex,
      'old radial-gradient background should be removed'
    );
  });

  test('public/index.html exists and references style.css', () => {
    const indexPath = join(__dirname, '..', 'public', 'index.html');
    const indexContent = readFileSync(indexPath, 'utf-8');
    
    assert.match(
      indexContent,
      /style\.css/,
      'index.html should reference style.css'
    );
  });
});
