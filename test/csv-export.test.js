import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { transactionsToCSV, generateExportFileName } from '../src/csv-export.js';

describe('CSV Export', () => {
  test('transactionsToCSV returns valid CSV with headers', () => {
    const transactions = [
      {
        id: 1,
        date: '2026-07-05',
        description: 'Salário',
        category: 'Salário',
        type: 'income',
        amount: 5000,
      },
    ];
    const csv = transactionsToCSV(transactions);
    assert.match(csv, /ID,Data,Descrição,Categoria,Tipo,Valor \(R\$\)/);
    assert.match(csv, /1,05\/07\/2026,Salário,Salário,Receita/);
  });

  test('transactionsToCSV formats dates as DD/MM/YYYY', () => {
    const transactions = [
      {
        id: 1,
        date: '2026-12-25',
        description: 'Test',
        category: 'Cat',
        type: 'expense',
        amount: 100,
      },
    ];
    const csv = transactionsToCSV(transactions);
    assert.match(csv, /25\/12\/2026/);
  });

  test('transactionsToCSV escapes special characters in descriptions', () => {
    const transactions = [
      {
        id: 1,
        date: '2026-07-01',
        description: 'Café com "aspas" e, vírgula',
        category: 'Food',
        type: 'expense',
        amount: 25.5,
      },
    ];
    const csv = transactionsToCSV(transactions);
    assert.match(csv, /"Café com ""aspas"" e, vírgula"/);
  });

  test('transactionsToCSV escapes newlines in descriptions', () => {
    const transactions = [
      {
        id: 1,
        date: '2026-07-01',
        description: 'Line1\nLine2',
        category: 'Test',
        type: 'expense',
        amount: 50,
      },
    ];
    const csv = transactionsToCSV(transactions);
    assert.match(csv, /"Line1\nLine2"/);
  });

  test('transactionsToCSV converts type to Portuguese labels', () => {
    const transactions = [
      {
        id: 1,
        date: '2026-07-01',
        description: 'Income',
        category: 'Salary',
        type: 'income',
        amount: 1000,
      },
      {
        id: 2,
        date: '2026-07-02',
        description: 'Expense',
        category: 'Food',
        type: 'expense',
        amount: 50,
      },
    ];
    const csv = transactionsToCSV(transactions);
    assert.match(csv, /Receita/);
    assert.match(csv, /Despesa/);
  });

  test('transactionsToCSV formats currency with Brazilian locale', () => {
    const transactions = [
      {
        id: 1,
        date: '2026-07-01',
        description: 'Test',
        category: 'Cat',
        type: 'expense',
        amount: 1234.56,
      },
    ];
    const csv = transactionsToCSV(transactions);
    assert.match(csv, /1.234,56/);
  });

  test('transactionsToCSV handles empty transaction list', () => {
    const csv = transactionsToCSV([]);
    assert.match(csv, /ID,Data,Descrição,Categoria,Tipo,Valor \(R\$\)/);
    const lines = csv.split('\n');
    assert.equal(lines.length, 1);
  });

  test('generateExportFileName returns correct format', () => {
    const filename = generateExportFileName();
    assert.match(filename, /^transacoes-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  test('generateExportFileName uses current date', () => {
    const filename = generateExportFileName();
    const today = new Date().toISOString().slice(0, 10);
    assert.equal(filename, `transacoes-${today}.csv`);
  });
});
