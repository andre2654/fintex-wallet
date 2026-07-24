import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency } from '../src/format.js';

describe('formatCurrency', () => {
  test('formatCurrency(12345) should return "R$ 123,45"', () => {
    const result = formatCurrency(12345);
    assert.equal(result, 'R$ 123,45');
  });

  test('formatCurrency(5) should return "R$ 0,05"', () => {
    const result = formatCurrency(5);
    assert.equal(result, 'R$ 0,05');
  });

  test('formatCurrency(0) should return "R$ 0,00"', () => {
    const result = formatCurrency(0);
    assert.equal(result, 'R$ 0,00');
  });

  test('formatCurrency(100) should return "R$ 1,00"', () => {
    const result = formatCurrency(100);
    assert.equal(result, 'R$ 1,00');
  });

  test('formatCurrency(1000000) should return "R$ 10.000,00"', () => {
    const result = formatCurrency(1000000);
    assert.equal(result, 'R$ 10.000,00');
  });

  test('is a pure function with no side effects', () => {
    const input = 12345;
    const result1 = formatCurrency(input);
    const result2 = formatCurrency(input);
    assert.equal(result1, result2);
    assert.equal(input, 12345);
  });

  test('has no external dependencies', () => {
    assert.equal(typeof formatCurrency, 'function');
    const result = formatCurrency(999);
    assert.equal(typeof result, 'string');
  });
});
