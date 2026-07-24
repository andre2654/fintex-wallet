import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { percentOf } from '../src/percent.js';

describe('percentOf', () => {
  test('calculates 1 out of 4 as 25 percent', () => {
    assert.equal(percentOf(1, 4), 25);
  });

  test('calculates 1 out of 3 as 33.33 percent with 2 decimal rounding', () => {
    assert.equal(percentOf(1, 3), 33.33);
  });

  test('calculates 0 out of 5 as 0 percent', () => {
    assert.equal(percentOf(0, 5), 0);
  });

  test('handles edge case of equal part and whole', () => {
    assert.equal(percentOf(5, 5), 100);
  });

  test('rounds correctly to 2 decimal places', () => {
    assert.equal(percentOf(2, 3), 66.67);
  });
});
