import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('public/style.css', () => {
  test('body background should contain blue gradient colors', () => {
    const stylePath = join(__dirname, '..', 'public', 'style.css');
    const cssContent = readFileSync(stylePath, 'utf-8');
    
    // Verify the body rule exists
    assert.match(cssContent, /body\s*{/, 'body selector should exist');
    
    // Verify blue gradient is applied (checking for the new blue hex values)
    assert.match(cssContent, /#0a4a8f/, 'should contain primary blue color #0a4a8f');
    assert.match(cssContent, /#0a2e5e/, 'should contain secondary blue color #0a2e5e');
    
    // Verify the background property uses radial-gradient
    assert.match(cssContent, /background:\s*radial-gradient/, 'background should use radial-gradient');
    
    // Verify old dark color is replaced
    const bodyMatch = cssContent.match(/body\s*{[^}]*background:[^;]*;[^}]*}/);
    assert.ok(bodyMatch, 'body rule should be found');
    const bodyRule = bodyMatch[0];
    assert.doesNotMatch(bodyRule, /#16203a/, 'old dark color #16203a should be replaced');
  });
});
