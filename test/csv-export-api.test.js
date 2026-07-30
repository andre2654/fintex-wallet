import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { TransactionStore } from '../src/store.js';
import { createApp } from '../server.js';

describe('CSV Export API', () => {
  let server;
  let baseUrl;
  const store = new TransactionStore();

  before(async () => {
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
      description: 'Café com "aspas"',
      amount: 12.5,
      type: 'expense',
      category: 'Alimentação',
      date: '2026-07-10',
    });

    server = createApp(store);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${server.address().port}`;
  });

  after(() => new Promise((r) => server.close(r)));

  test('GET /api/export/csv returns 200 with CSV content', async () => {
    const res = await fetch(`${baseUrl}/api/export/csv`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/csv; charset=utf-8');
    const csv = await res.text();
    assert.match(csv, /ID,Data,Descrição,Categoria,Tipo,Valor \(R\$\)/);
  });

  test('GET /api/export/csv includes all transactions', async () => {
    const res = await fetch(`${baseUrl}/api/export/csv`);
    const csv = await res.text();
    assert.match(csv, /Salário/);
    assert.match(csv, /Aluguel/);
    assert.match(csv, /Alimentação/);
  });

  test('GET /api/export/csv sets correct Content-Disposition header', async () => {
    const res = await fetch(`${baseUrl}/api/export/csv`);
    const disposition = res.headers.get('content-disposition');
    assert.match(disposition, /attachment; filename="transacoes-\d{4}-\d{2}-\d{2}\.csv"/);
  });

  test('GET /api/export/csv filters by month parameter', async () => {
    const res = await fetch(`${baseUrl}/api/export/csv?month=7`);
    const csv = await res.text();
    assert.match(csv, /Salário/);
    assert.match(csv, /Aluguel/);
  });

  test('GET /api/export/csv filters by year parameter', async () => {
    const res = await fetch(`${baseUrl}/api/export/csv?year=2026`);
    const csv = await res.text();
    const lines = csv.split('\n');
    assert.ok(lines.length > 1);
  });

  test('GET /api/export/csv escapes special characters', async () => {
    const res = await fetch(`${baseUrl}/api/export/csv`);
    const csv = await res.text();
    assert.match(csv, /"Café com ""aspas"""/);
  });

  test('GET /api/export/csv returns valid CSV structure', async () => {
    const res = await fetch(`${baseUrl}/api/export/csv`);
    const csv = await res.text();
    const lines = csv.split('\n');
    assert.ok(lines.length >= 2);
    const headerCount = lines[0].split(',').length;
    lines.slice(1).forEach((line) => {
      if (line.trim()) {
        assert.ok(line.split(',').length >= headerCount - 1);
      }
    });
  });
});
