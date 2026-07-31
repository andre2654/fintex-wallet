import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.js';
import { TransactionStore } from '../src/store.js';

describe('CSV Export API', () => {
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
      date: '2026-06-10',
    });

    const app = createApp(store);
    server = app.listen(0);
    baseUrl = `http://localhost:${server.address().port}`;
  });

  after(() => new Promise((r) => server.close(r)));

  test('GET /api/transactions/export retorna CSV com cabeçalho correto', async () => {
    const res = await fetch(`${baseUrl}/api/transactions/export`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/csv; charset=utf-8');

    const csv = await res.text();
    const lines = csv.split('\n');
    assert.match(lines[0], /ID;Data;Descrição;Tipo;Categoria;Valor/);
  });

  test('GET /api/transactions/export retorna todas as transações', async () => {
    const res = await fetch(`${baseUrl}/api/transactions/export`);
    const csv = await res.text();
    const lines = csv.split('\n').filter((l) => l.trim());
    assert.equal(lines.length, 4); // header + 3 transactions
  });

  test('GET /api/transactions/export?month=7 filtra por mês', async () => {
    const res = await fetch(`${baseUrl}/api/transactions/export?month=7`);
    const csv = await res.text();
    const lines = csv.split('\n').filter((l) => l.trim());
    assert.equal(lines.length, 3); // header + 2 transactions in July
  });

  test('GET /api/transactions/export?year=2026 filtra por ano', async () => {
    const res = await fetch(`${baseUrl}/api/transactions/export?year=2026`);
    const csv = await res.text();
    const lines = csv.split('\n').filter((l) => l.trim());
    assert.equal(lines.length, 4); // header + 3 transactions
  });

  test('GET /api/transactions/export?month=7&year=2026 filtra por mês e ano', async () => {
    const res = await fetch(`${baseUrl}/api/transactions/export?month=7&year=2026`);
    const csv = await res.text();
    const lines = csv.split('\n').filter((l) => l.trim());
    assert.equal(lines.length, 3); // header + 2 transactions
  });

  test('Content-Disposition header contém filename correto', async () => {
    const res = await fetch(`${baseUrl}/api/transactions/export?month=7&year=2026`);
    const disposition = res.headers.get('content-disposition');
    assert.match(disposition, /filename="transactions-2026-07.csv"/);
  });

  test('CSV ordena transações por data decrescente', async () => {
    const res = await fetch(`${baseUrl}/api/transactions/export`);
    const csv = await res.text();
    const lines = csv.split('\n').filter((l) => l.trim());
    // Newest first: 07/07/2026, then 05/07/2026, then 10/06/2026
    assert.match(lines[1], /07\/07\/2026/);
    assert.match(lines[2], /05\/07\/2026/);
    assert.match(lines[3], /10\/06\/2026/);
  });
});
