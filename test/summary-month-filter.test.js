import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeSummary } from '../src/summary.js';

describe('computeSummary month filter (off-by-one fix)', () => {
  const transactions = [
    { id: 1, description: 'June Income', amount: 3000, type: 'income', category: 'Salário', date: '2026-06-05' },
    { id: 2, description: 'June Expense 1', amount: 500, type: 'expense', category: 'Alimentação', date: '2026-06-10' },
    { id: 3, description: 'June Expense 2', amount: 300, type: 'expense', category: 'Transporte', date: '2026-06-15' },
    { id: 4, description: 'June Expense 3', amount: 200, type: 'expense', category: 'Outros', date: '2026-06-20' },
    { id: 5, description: 'June Expense 4', amount: 150, type: 'expense', category: 'Alimentação', date: '2026-06-25' },
    { id: 6, description: 'June Expense 5', amount: 100, type: 'expense', category: 'Transporte', date: '2026-06-28' },
    { id: 7, description: 'July Income', amount: 3000, type: 'income', category: 'Salário', date: '2026-07-05' },
    { id: 8, description: 'December Income', amount: 5000, type: 'income', category: 'Bônus', date: '2026-12-01' },
    { id: 9, description: 'December Expense', amount: 1000, type: 'expense', category: 'Presentes', date: '2026-12-20' },
  ];

  test('filters June 2026 correctly (month=6)', () => {
    const summary = computeSummary(transactions, { month: 6, year: 2026 });
    assert.equal(summary.count, 6, 'Should have 6 June transactions');
    assert.equal(summary.income, 3000, 'June income should be 3000');
    assert.equal(summary.expenses, 1250, 'June expenses should be 1250 (500+300+200+150+100)');
    assert.equal(summary.balance, 1750, 'June balance should be 1750');
  });

  test('filters December 2026 correctly (month=12)', () => {
    const summary = computeSummary(transactions, { month: 12, year: 2026 });
    assert.equal(summary.count, 2, 'Should have 2 December transactions');
    assert.equal(summary.income, 5000, 'December income should be 5000');
    assert.equal(summary.expenses, 1000, 'December expenses should be 1000');
    assert.equal(summary.balance, 4000, 'December balance should be 4000');
  });

  test('filters January 2026 correctly (month=1)', () => {
    const summary = computeSummary(transactions, { month: 1, year: 2026 });
    assert.equal(summary.count, 0, 'Should have 0 January transactions');
    assert.equal(summary.income, 0);
    assert.equal(summary.expenses, 0);
    assert.equal(summary.balance, 0);
  });

  test('does not confuse June (month=6) with July (month=7)', () => {
    const juneSum = computeSummary(transactions, { month: 6, year: 2026 });
    const julySum = computeSummary(transactions, { month: 7, year: 2026 });
    assert.notEqual(juneSum.count, julySum.count, 'June and July should have different transaction counts');
    assert.equal(julySum.count, 1, 'July should have 1 transaction');
  });
});
