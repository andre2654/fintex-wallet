import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { escapeField, transactionsToCSV, generateFilename } from '../src/csv-export.js';

describe('CSV Export', () => {
  describe('escapeField', () => {
    test('retorna campo simples sem aspas', () => {
      assert.equal(escapeField('Café'), 'Café');
    });

    test('escapa campo com vírgula', () => {
      assert.equal(escapeField('Café, com vírgula'), '"Café, com vírgula"');
    });

    test('escapa campo com aspas duplicando-as', () => {
      assert.equal(escapeField('Descrição "especial"'), '"Descrição ""especial"""');
    });

    test('escapa campo com quebra de linha', () => {
      assert.equal(escapeField('Linha 1\nLinha 2'), '"Linha 1\nLinha 2"');
    });

    test('converte null/undefined para string vazia', () => {
      assert.equal(escapeField(null), '');
      assert.equal(escapeField(undefined), '');
    });
  });

  describe('transactionsToCSV', () => {
    test('gera CSV com cabeçalho correto', () => {
      const transactions = [
        {
          id: 1,
          date: '2026-07-05',
          description: 'Salário',
          type: 'income',
          category: 'Salário',
          amount: 5000,
        },
      ];
      const csv = transactionsToCSV(transactions);
      assert.match(csv, /ID;Data;Descrição;Tipo;Categoria;Valor/);
    });

    test('formata data como DD/MM/YYYY', () => {
      const transactions = [
        {
          id: 1,
          date: '2026-07-05',
          description: 'Test',
          type: 'expense',
          category: 'Cat',
          amount: 100,
        },
      ];
      const csv = transactionsToCSV(transactions);
      assert.match(csv, /05\/07\/2026/);
    });

    test('traduz tipo para português', () => {
      const income = [
        {
          id: 1,
          date: '2026-07-05',
          description: 'Test',
          type: 'income',
          category: 'Cat',
          amount: 100,
        },
      ];
      const expense = [
        {
          id: 2,
          date: '2026-07-05',
          description: 'Test',
          type: 'expense',
          category: 'Cat',
          amount: 100,
        },
      ];
      const csvIncome = transactionsToCSV(income);
      const csvExpense = transactionsToCSV(expense);
      assert.match(csvIncome, /Receita/);
      assert.match(csvExpense, /Despesa/);
    });

    test('formata moeda com separador pt-BR', () => {
      const transactions = [
        {
          id: 1,
          date: '2026-07-05',
          description: 'Test',
          type: 'expense',
          category: 'Cat',
          amount: 1234.56,
        },
      ];
      const csv = transactionsToCSV(transactions);
      assert.match(csv, /1\.234,56/);
    });

    test('inclui BOM UTF-8 no início', () => {
      const transactions = [];
      const csv = transactionsToCSV(transactions);
      assert.equal(csv.charCodeAt(0), 0xfeff);
    });

    test('retorna CSV vazio com apenas cabeçalho', () => {
      const csv = transactionsToCSV([]);
      const lines = csv.split('\n');
      assert.equal(lines.length, 1);
      assert.match(lines[0], /ID;Data;Descrição;Tipo;Categoria;Valor/);
    });

    test('escapa campos especiais em CSV', () => {
      const transactions = [
        {
          id: 1,
          date: '2026-07-05',
          description: 'Café, com "aspas"',
          type: 'expense',
          category: 'Alimentação',
          amount: 12.5,
        },
      ];
      const csv = transactionsToCSV(transactions);
      assert.match(csv, /"Café, com ""aspas"""/);
    });
  });

  describe('generateFilename', () => {
    test('gera nome padrão sem filtros', () => {
      assert.equal(generateFilename(), 'transactions.csv');
    });

    test('gera nome com ano', () => {
      assert.equal(generateFilename({ year: 2026 }), 'transactions-2026.csv');
    });

    test('gera nome com ano e mês', () => {
      assert.equal(generateFilename({ year: 2026, month: 7 }), 'transactions-2026-07.csv');
    });

    test('padroniza mês com zero à esquerda', () => {
      assert.equal(generateFilename({ year: 2026, month: 1 }), 'transactions-2026-01.csv');
    });
  });
});
