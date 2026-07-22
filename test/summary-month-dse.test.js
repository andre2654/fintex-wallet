import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeSummary } from '../src/summary.js';

describe('computeSummary - Month Filter Bug Fix', () => {
  const transactions = [
    { id: 1, description: 'Transação Jun 1', amount: 100, type: 'income', category: 'Salário', date: '2026-06-01' },
    { id: 2, description: 'Transação Jun 2', amount: 50, type: 'expense', category: 'Alimentação', date: '2026-06-05' },
    { id: 3, description: 'Transação Jun 3', amount: 75, type: 'expense', category: 'Transporte', date: '2026-06-10' },
    { id: 4, description: 'Transação Jun 4', amount: 200, type: 'income', category: 'Freelance', date: '2026-06-15' },
    { id: 5, description: 'Transação Jun 5', amount: 30, type: 'expense', category: 'Alimentação', date: '2026-06-20' },
    { id: 6, description: 'Transação Jun 6', amount: 60, type: 'expense', category: 'Outros', date: '2026-06-28' },
    { id: 7, description: 'Transação Jul 1', amount: 150, type: 'income', category: 'Salário', date: '2026-07-05' },
    { id: 8, description: 'Transação Dec 1', amount: 500, type: 'income', category: 'Bônus', date: '2026-12-20' },
    { id: 9, description: 'Transação Dec 2', amount: 100, type: 'expense', category: 'Presentes', date: '2026-12-25' },
  ];

  test('filtra corretamente transações de junho (month=6)', () => {
    const summary = computeSummary(transactions, { month: 6, year: 2026 });
    assert.equal(summary.count, 6, 'Deve retornar exatamente 6 transações de junho');
    assert.equal(summary.income, 300, 'Receita de junho deve ser 300 (100 + 200)');
    assert.equal(summary.expenses, 215, 'Despesa de junho deve ser 215 (50 + 75 + 30 + 60)');
    assert.equal(summary.balance, 85, 'Saldo de junho deve ser 85 (300 - 215)');
  });

  test('filtra corretamente transações de dezembro (month=12)', () => {
    const summary = computeSummary(transactions, { month: 12, year: 2026 });
    assert.equal(summary.count, 2, 'Deve retornar exatamente 2 transações de dezembro');
    assert.equal(summary.income, 500, 'Receita de dezembro deve ser 500');
    assert.equal(summary.expenses, 100, 'Despesa de dezembro deve ser 100');
    assert.equal(summary.balance, 400, 'Saldo de dezembro deve ser 400');
  });

  test('filtra corretamente transações de julho (month=7)', () => {
    const summary = computeSummary(transactions, { month: 7, year: 2026 });
    assert.equal(summary.count, 1, 'Deve retornar exatamente 1 transação de julho');
    assert.equal(summary.income, 150, 'Receita de julho deve ser 150');
    assert.equal(summary.expenses, 0, 'Despesa de julho deve ser 0');
  });

  test('não retorna zerado para mês com transações', () => {
    const summary = computeSummary(transactions, { month: 6, year: 2026 });
    assert.notEqual(summary.balance, 0, 'Saldo não deve ser zero quando há transações');
    assert.notEqual(summary.count, 0, 'Contagem não deve ser zero quando há transações');
  });

  test('agrupa despesas por categoria para mês específico', () => {
    const summary = computeSummary(transactions, { month: 6, year: 2026 });
    assert.deepEqual(
      summary.byCategory,
      { 'Alimentação': 80, 'Transporte': 75, 'Outros': 60 },
      'Deve agrupar corretamente despesas de junho por categoria'
    );
  });
});
