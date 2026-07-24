import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeSummary } from '../src/summary.js';

describe('computeSummary month filtering', () => {
  const transactions = [
    { id: 1, description: 'June income', amount: 3000, type: 'income', category: 'Salário', date: '2026-06-05' },
    { id: 2, description: 'June expense 1', amount: 500, type: 'expense', category: 'Alimentação', date: '2026-06-10' },
    { id: 3, description: 'June expense 2', amount: 300, type: 'expense', category: 'Transporte', date: '2026-06-15' },
    { id: 4, description: 'June expense 3', amount: 200, type: 'expense', category: 'Alimentação', date: '2026-06-20' },
    { id: 5, description: 'June expense 4', amount: 150, type: 'expense', category: 'Outros', date: '2026-06-22' },
    { id: 6, description: 'June expense 5', amount: 100, type: 'expense', category: 'Outros', date: '2026-06-25' },
    { id: 7, description: 'December income', amount: 5000, type: 'income', category: 'Salário', date: '2026-12-05' },
    { id: 8, description: 'December expense', amount: 1000, type: 'expense', category: 'Moradia', date: '2026-12-10' },
    { id: 9, description: 'May expense', amount: 400, type: 'expense', category: 'Alimentação', date: '2026-05-15' },
  ];

  test('filters transactions for June (month=6) correctly', () => {
    const summary = computeSummary(transactions, { month: 6, year: 2026 });
    assert.equal(summary.count, 6, 'Should have 6 June transactions');
    assert.equal(summary.income, 3000, 'June income should be 3000');
    assert.equal(summary.expenses, 1250, 'June expenses should be 1250 (500+300+200+150+100)');
    assert.equal(summary.balance, 1750, 'June balance should be 1750');
  });

  test('filters transactions for December (month=12) correctly', () => {
    const summary = computeSummary(transactions, { month: 12, year: 2026 });
    assert.equal(summary.count, 2, 'Should have 2 December transactions');
    assert.equal(summary.income, 5000, 'December income should be 5000');
    assert.equal(summary.expenses, 1000, 'December expenses should be 1000');
    assert.equal(summary.balance, 4000, 'December balance should be 4000');
  });

  test('filters transactions for January (month=1) correctly', () => {
    const janTransactions = [
      { id: 1, description: 'Jan income', amount: 2000, type: 'income', category: 'Salário', date: '2026-01-05' },
      { id: 2, description: 'Jan expense', amount: 500, type: 'expense', category: 'Alimentação', date: '2026-01-10' },
    ];
    const summary = computeSummary(janTransactions, { month: 1, year: 2026 });
    assert.equal(summary.count, 2, 'Should have 2 January transactions');
    assert.equal(summary.income, 2000, 'January income should be 2000');
    assert.equal(summary.expenses, 500, 'January expenses should be 500');
  });

  test('does not include May transactions when filtering for June', () => {
    const summary = computeSummary(transactions, { month: 6, year: 2026 });
    assert.equal(summary.count, 6, 'Should not include May transaction');
  });
});
