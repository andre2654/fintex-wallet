import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { TransactionStore } from '../src/store.js';
import { computeSummary } from '../src/summary.js';
import { createApp } from '../server.js';

describe('TransactionStore', () => {
  test('adiciona transação válida', () => {
    const store = new TransactionStore();
    const result = store.add({
      description: 'Café',
      amount: 12.5,
      type: 'expense',
      category: 'Alimentação',
      date: '2026-07-01',
    });
    assert.equal(result.ok, true);
    assert.equal(result.transaction.id, 1);
    assert.equal(store.all().length, 1);
  });

  test('rejeita transação inválida com erros descritivos', () => {
    const store = new TransactionStore();
    const result = store.add({ description: '', amount: -5, type: 'foo', category: '', date: 'xx' });
    assert.equal(result.ok, false);
    assert.equal(result.errors.length, 5);
    assert.equal(store.all().length, 0);
  });

  test('arredonda o valor para 2 casas decimais', () => {
    const store = new TransactionStore();
    const { transaction } = store.add({
      description: 'Teste',
      amount: 10.999,
      type: 'expense',
      category: 'Outros',
      date: '2026-07-01',
    });
    assert.equal(transaction.amount, 11);
  });

  test('remove uma transação existente', () => {
    const store = new TransactionStore();
    store.add({ description: 'A', amount: 10, type: 'expense', category: 'X', date: '2026-07-01' });
    assert.equal(store.remove(1), true);
    assert.equal(store.all().length, 0);
  });

  test('retorna false ao remover id inexistente', () => {
    const store = new TransactionStore();
    assert.equal(store.remove(999), false);
  });

  test('remove a transação correta mesmo após outras exclusões', () => {
    const store = new TransactionStore();
    // Adiciona transações com IDs 1-5
    store.add({ description: 'T1', amount: 10, type: 'expense', category: 'X', date: '2026-07-01' });
    store.add({ description: 'T2', amount: 20, type: 'expense', category: 'X', date: '2026-07-01' });
    store.add({ description: 'T3', amount: 30, type: 'expense', category: 'X', date: '2026-07-01' });
    store.add({ description: 'T4', amount: 40, type: 'expense', category: 'X', date: '2026-07-01' });
    store.add({ description: 'T5', amount: 50, type: 'expense', category: 'X', date: '2026-07-01' });

    // Remove ID 2
    assert.equal(store.remove(2), true);
    assert.equal(store.all().length, 4);
    assert.equal(store.all().find(t => t.id === 2), undefined);

    // Remove ID 5 (deve remover T5, não T4)
    assert.equal(store.remove(5), true);
    assert.equal(store.all().length, 3);
    assert.equal(store.all().find(t => t.id === 5), undefined);
    assert.equal(store.all().find(t => t.id === 4).description, 'T4');

    // Verifica que IDs 1, 3, 4 ainda existem
    assert.equal(store.all().find(t => t.id === 1).description, 'T1');
    assert.equal(store.all().find(t => t.id === 3).description, 'T3');
    assert.equal(store.all().find(t => t.id === 4).description, 'T4');
  });

  test('retorna false para ID não-inteiro ou inválido', () => {
    const store = new TransactionStore();
    store.add({ description: 'T', amount: 10, type: 'expense', category: 'X', date: '2026-07-01' });
    assert.equal(store.remove('abc'), false);
    assert.equal(store.remove(0), false);
    assert.equal(store.remove(-1), false);
    assert.equal(store.remove(1.5), false);
    assert.equal(store.all().length, 1);
  });
});

describe('computeSummary', () => {
  const transactions = [
    { id: 1, description: 'Salário', amount: 5000, type: 'income', category: 'Salário', date: '2026-07-05' },
    { id: 2, description: 'Aluguel', amount: 2000, type: 'expense', category: 'Moradia', date: '2026-07-07' },
    { id: 3, description: 'Mercado', amount: 500.5, type: 'expense', category: 'Alimentação', date: '2026-07-10' },
    { id: 4, description: 'Bônus', amount: 1000, type: 'income', category: 'Salário', date: '2025-12-20' },
  ];

  test('calcula receitas, despesas e saldo', () => {
    const summary = computeSummary(transactions);
    assert.equal(summary.income, 6000);
    assert.equal(summary.expenses, 2500.5);
    assert.equal(summary.balance, 3499.5);
    assert.equal(summary.count, 4);
  });

  test('agrupa despesas por categoria', () => {
    const summary = computeSummary(transactions);
    assert.deepEqual(summary.byCategory, { Moradia: 2000, 'Alimentação': 500.5 });
  });

  test('filtra por ano', () => {
    const summary = computeSummary(transactions, { year: 2025 });
    assert.equal(summary.count, 1);
    assert.equal(summary.income, 1000);
  });
});

describe('API HTTP', () => {
  let server;
  let baseUrl;

  before(async () => {
    const store = new TransactionStore();
    store.add({ description: 'Salário', amount: 5000, type: 'income', category: 'Salário', date: '2026-07-05' });
    store.add({ description: 'Mercado', amount: 300, type: 'expense', category: 'Alimentação', date: '2026-07-10' });
    server = createApp(store);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${server.address().port}`;
  });

  after(() => server.close());

  test('GET /api/transactions lista transações ordenadas por data desc', async () => {
    const res = await fetch(`${baseUrl}/api/transactions`);
    assert.equal(res.status, 200);
    const { transactions } = await res.json();
    assert.equal(transactions.length, 2);
    assert.equal(transactions[0].description, 'Mercado');
  });

  test('GET /api/transactions?category= filtra por categoria', async () => {
    const res = await fetch(`${baseUrl}/api/transactions?category=Salário`);
    const { transactions } = await res.json();
    assert.equal(transactions.length, 1);
    assert.equal(transactions[0].category, 'Salário');
  });

  test('POST /api/transactions cria transação', async () => {
    const res = await fetch(`${baseUrl}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Cinema',
        amount: 45,
        type: 'expense',
        category: 'Lazer',
        date: '2026-07-20',
      }),
    });
    assert.equal(res.status, 201);
    const { transaction } = await res.json();
    assert.equal(transaction.description, 'Cinema');
  });

  test('POST inválido retorna 422 com lista de erros', async () => {
    const res = await fetch(`${baseUrl}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: '', amount: 0 }),
    });
    assert.equal(res.status, 422);
    const { errors } = await res.json();
    assert.ok(errors.length > 0);
  });

  test('GET /api/summary calcula o resumo geral', async () => {
    const res = await fetch(`${baseUrl}/api/summary`);
    assert.equal(res.status, 200);
    const summary = await res.json();
    assert.equal(summary.income, 5000);
    assert.ok(summary.expenses >= 300);
  });

  test('rota desconhecida retorna 404', async () => {
    const res = await fetch(`${baseUrl}/api/nope`);
    assert.equal(res.status, 404);
  });

  test('DELETE /api/transactions/:id remove transação correta após outras exclusões', async () => {
    const store = new TransactionStore();
    // Cria transações com IDs 1-5
    store.add({ description: 'Aluguel', amount: 2000, type: 'expense', category: 'Moradia', date: '2026-07-06' });
    store.add({ description: 'Salário', amount: 5000, type: 'income', category: 'Salário', date: '2026-07-05' });
    store.add({ description: 'Mercado', amount: 300, type: 'expense', category: 'Alimentação', date: '2026-07-10' });
    store.add({ description: 'Show', amount: 150, type: 'expense', category: 'Lazer', date: '2026-07-18' });
    store.add({ description: 'Bônus', amount: 1000, type: 'income', category: 'Salário', date: '2026-07-20' });

    const server2 = createApp(store);
    await new Promise((resolve) => server2.listen(0, resolve));
    const baseUrl2 = `http://localhost:${server2.address().port}`;

    try {
      // Deleta ID 1 (Aluguel)
      let res = await fetch(`${baseUrl2}/api/transactions/1`, { method: 'DELETE' });
      assert.equal(res.status, 200);

      // Verifica que ID 1 foi removido
      res = await fetch(`${baseUrl2}/api/transactions`);
      let txns = (await res.json()).transactions;
      assert.equal(txns.find(t => t.id === 1), undefined);
      assert.equal(txns.length, 4);

      // Deleta ID 5 (Bônus) — não deve remover nada além do ID 5
      res = await fetch(`${baseUrl2}/api/transactions/5`, { method: 'DELETE' });
      assert.equal(res.status, 200);

      // Verifica que ID 5 foi removido e IDs 2,3,4 ainda existem
      res = await fetch(`${baseUrl2}/api/transactions`);
      txns = (await res.json()).transactions;
      assert.equal(txns.find(t => t.id === 5), undefined);
      assert.equal(txns.find(t => t.id === 2).description, 'Salário');
      assert.equal(txns.find(t => t.id === 3).description, 'Mercado');
      assert.equal(txns.find(t => t.id === 4).description, 'Show');
      assert.equal(txns.length, 3);

      // Tenta deletar ID 999 (inexistente) — deve retornar 404
      res = await fetch(`${baseUrl2}/api/transactions/999`, { method: 'DELETE' });
      assert.equal(res.status, 404);

      // Verifica que nada mudou
      res = await fetch(`${baseUrl2}/api/transactions`);
      txns = (await res.json()).transactions;
      assert.equal(txns.length, 3);
    } finally {
      server2.close();
    }
  });
});
