import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Frontend Changes (wi_70a780babeea75e8a9640a3f631e7d7798b29467b5c14a2460236179b0d68697)', () => {
  let htmlContent;
  let cssContent;

  test('carrega arquivos HTML e CSS', () => {
    const htmlPath = join(process.cwd(), 'public', 'index.html');
    const cssPath = join(process.cwd(), 'public', 'style.css');
    
    htmlContent = readFileSync(htmlPath, 'utf-8');
    cssContent = readFileSync(cssPath, 'utf-8');
    
    assert.ok(htmlContent, 'HTML deve ser carregado');
    assert.ok(cssContent, 'CSS deve ser carregado');
  });

  test('título da página deve ser "Fintex Platform"', () => {
    assert.match(htmlContent, /<title>Fintex Platform<\/title>/, 'Título deve ser "Fintex Platform"');
  });

  test('h1 deve exibir "Fintex Platform"', () => {
    assert.match(htmlContent, /<h1>Fintex Platform<\/h1>/, 'H1 deve conter "Fintex Platform"');
  });

  test('descrição deve estar em inglês', () => {
    assert.match(htmlContent, /<p class="subtitle">Your finances, under control<\/p>/, 'Descrição deve estar em inglês');
  });

  test('descrição em português não deve estar presente', () => {
    assert.doesNotMatch(htmlContent, /Suas finanças, sob controle/, 'Descrição em português não deve existir');
  });

  test('fundo principal deve ser branco', () => {
    assert.match(cssContent, /background:\s*#ffffff/, 'Background do body deve ser #ffffff (branco)');
  });

  test('gradiente antigo não deve estar presente', () => {
    assert.doesNotMatch(cssContent, /radial-gradient\(1200px 600px at 70% -10%, #16203a/, 'Gradiente antigo não deve existir');
  });
});
