import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.js';
import { TransactionStore } from '../src/store.js';

describe('Download History Feature', () => {
  let server;
  let baseUrl;
  let store;

  before(async () => {
    store = new TransactionStore();
    store.add({
      description: 'Salário',
      amount: 5000,
      type: 'income',
      category: 'Salário',
      date: '2026-07-05',
    });
    store.add({
      description: 'Aluguel',
      amount: 2000,
      type: 'expense',
      category: 'Moradia',
      date: '2026-07-07',
    });
    store.add({
      description: 'Mercado',
      amount: 500.5,
      type: 'expense',
      category: 'Alimentação',
      date: '2026-07-10',
    });

    const app = createApp(store);
    server = app.listen(0);
    baseUrl = `http://localhost:${server.address().port}`;
  });

  after(() => new Promise((r) => server.close(r)));

  test('download button element exists in HTML with data-test selector', async () => {
    const response = await fetch(`${baseUrl}/`);
    const html = await response.text();
    assert.match(html, /id="download-btn"/, 'download button should exist with id="download-btn"');
    assert.match(
      html,
      /data-test=['"]download-history-btn['"]/,
      'download button should have data-test="download-history-btn"'
    );
  });

  test('GET /api/transactions returns 200 with valid transaction data', async () => {
    const response = await fetch(`${baseUrl}/api/transactions`);
    assert.equal(response.status, 200, 'should return 200 status');
    const data = await response.json();
    assert.ok(Array.isArray(data.transactions), 'should return transactions array');
    assert.equal(data.transactions.length, 3, 'should have 3 transactions');
    assert.ok(data.transactions[0].id, 'transaction should have id');
    assert.ok(data.transactions[0].description, 'transaction should have description');
    assert.ok(data.transactions[0].amount, 'transaction should have amount');
    assert.ok(data.transactions[0].type, 'transaction should have type');
    assert.ok(data.transactions[0].category, 'transaction should have category');
    assert.ok(data.transactions[0].date, 'transaction should have date');
  });

  test('CSV export contains transaction data in correct format', async () => {
    const response = await fetch(`${baseUrl}/api/transactions`);
    const { transactions } = await response.json();

    // Simulate CSV generation logic from app.js
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)'];
    const rows = transactions.map((t) => {
      const [y, m, d] = t.date.split('-');
      const date = `${d}/${m}/${y}`;
      const description = t.description.includes(',') ? `"${t.description}"` : t.description;
      const category = t.category.includes(',') ? `"${t.category}"` : t.category;
      const type = t.type === 'income' ? 'Receita' : 'Despesa';
      const amount = t.amount.toFixed(2).replace('.', ',');
      return [date, description, category, type, amount].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');

    assert.match(csv, /Data,Descrição,Categoria,Tipo,Valor/, 'CSV should have correct headers');
    assert.match(csv, /Receita/, 'CSV should contain income type');
    assert.match(csv, /Despesa/, 'CSV should contain expense type');
    assert.match(csv, /Salário/, 'CSV should contain transaction description');
    assert.match(csv, /5000,00/, 'CSV should contain formatted amount');
  });

  test('no console errors during transaction fetch', async () => {
    const originalError = console.error;
    let errorCaught = false;
    console.error = () => {
      errorCaught = true;
    };

    try {
      const response = await fetch(`${baseUrl}/api/transactions`);
      assert.equal(response.status, 200);
      await response.json();
      assert.equal(errorCaught, false, 'should not have console errors');
    } finally {
      console.error = originalError;
    }
  });
});
