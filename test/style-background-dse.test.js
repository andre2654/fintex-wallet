import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Background Style - Yellow', () => {
  test('verifica que public/style.css contém background amarelo no body', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const styleContent = readFileSync(stylePath, 'utf-8');
    
    // Verifica que o seletor body contém a cor amarela (#ffeb3b ou #fdd835)
    assert.match(
      styleContent,
      /body\s*{[^}]*background:[^}]*#ffeb3b[^}]*}/s,
      'body deve ter background com cor amarela #ffeb3b'
    );
  });

  test('verifica que public/style.css não contém mais o gradiente antigo', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const styleContent = readFileSync(stylePath, 'utf-8');
    
    // Verifica que o gradiente antigo (com #16203a) foi removido
    assert.doesNotMatch(
      styleContent,
      /background:[^}]*#16203a[^}]*var\(--bg\)[^}]*/s,
      'body não deve conter o gradiente antigo com #16203a'
    );
  });

  test('verifica que public/index.html carrega o style.css', () => {
    const htmlPath = join(__dirname, '..', 'public', 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    assert.match(
      htmlContent,
      /<link[^>]*href=["'].*style\.css["'][^>]*>/,
      'index.html deve carregar style.css'
    );
  });

  test('verifica que o gradiente amarelo está completo no body', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const styleContent = readFileSync(stylePath, 'utf-8');
    
    // Verifica que ambas as cores do gradiente amarelo estão presentes
    assert.match(
      styleContent,
      /background:[^}]*#ffeb3b[^}]*#fdd835[^}]*/s,
      'body deve ter gradiente com #ffeb3b e #fdd835'
    );
  });
});
