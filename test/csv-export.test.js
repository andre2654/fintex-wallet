import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { transactionsToCSV } from '../src/csv-export.js';

describe('CSV Export', () => {
  test('exports empty transaction list with headers only', () => {
    const csv = transactionsToCSV([]);
    const lines = csv.split('\n');
    assert.equal(lines.length, 1);
    assert.equal(lines[0], 'ID,Data,Descrição,Categoria,Tipo,Valor (R$)');
  });

  test('exports single transaction with correct formatting', () => {
    const transactions = [
      {
        id: 1,
        date: '2026-07-15',
        description: 'Café',
        category: 'Alimentação',
        type: 'expense',
        amount: 12.5,
      },
    ];
    const csv = transactionsToCSV(transactions);
    const lines = csv.split('\n');
    assert.equal(lines.length, 2);
    assert.match(lines[1], /1,2026-07-15,Café,Alimentação,Despesa/);
  });

  test('escapes special characters in CSV fields', () => {
    const transactions = [
      {
        id: 2,
        date: '2026-07-16',
        description: 'Compra com "aspas"',
        category: 'Outros, Diversos',
        type: 'expense',
        amount: 50.0,
      },
    ];
    const csv = transactionsToCSV(transactions);
    assert.match(csv, /"Compra com ""aspas"""/);
    assert.match(csv, /"Outros, Diversos"/);
  });

  test('handles newlines in description field', () => {
    const transactions = [
      {
        id: 3,
        date: '2026-07-17',
        description: 'Descrição com\nquebra de linha',
        category: 'Teste',
        type: 'income',
        amount: 100.0,
      },
    ];
    const csv = transactionsToCSV(transactions);
    assert.match(csv, /"Descrição com\nquebra de linha"/);
  });

  test('formats currency values correctly in BRL', () => {
    const transactions = [
      {
        id: 4,
        date: '2026-07-18',
        description: 'Salário',
        category: 'Salário',
        type: 'income',
        amount: 5000.99,
      },
    ];
    const csv = transactionsToCSV(transactions);
    assert.match(csv, /R\$\s*5.000,99/);
  });

  test('distinguishes income and expense types', () => {
    const transactions = [
      {
        id: 5,
        date: '2026-07-19',
        description: 'Receita',
        category: 'Salário',
        type: 'income',
        amount: 1000.0,
      },
      {
        id: 6,
        date: '2026-07-19',
        description: 'Despesa',
        category: 'Alimentação',
        type: 'expense',
        amount: 50.0,
      },
    ];
    const csv = transactionsToCSV(transactions);
    const lines = csv.split('\n');
    assert.match(lines[1], /Receita/);
    assert.match(lines[2], /Despesa/);
  });

  test('handles multiple transactions with correct row count', () => {
    const transactions = [
      {
        id: 7,
        date: '2026-07-20',
        description: 'Trans 1',
        category: 'Cat1',
        type: 'expense',
        amount: 10.0,
      },
      {
        id: 8,
        date: '2026-07-21',
        description: 'Trans 2',
        category: 'Cat2',
        type: 'income',
        amount: 20.0,
      },
      {
        id: 9,
        date: '2026-07-22',
        description: 'Trans 3',
        category: 'Cat3',
        type: 'expense',
        amount: 30.0,
      },
    ];
    const csv = transactionsToCSV(transactions);
    const lines = csv.split('\n');
    assert.equal(lines.length, 4);
  });

  test('preserves numeric precision for amounts', () => {
    const transactions = [
      {
        id: 10,
        date: '2026-07-23',
        description: 'Precisão',
        category: 'Teste',
        type: 'expense',
        amount: 123.45,
      },
    ];
    const csv = transactionsToCSV(transactions);
    assert.match(csv, /123,45/);
  });
});
