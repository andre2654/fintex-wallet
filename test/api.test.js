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

  test('remove a transação correta mesmo após outras remoções', () => {
    const store = new TransactionStore();
    // Adiciona 4 transações com IDs 1, 2, 3, 4
    store.add({ description: 'A', amount: 10, type: 'expense', category: 'X', date: '2026-07-01' });
    store.add({ description: 'B', amount: 20, type: 'expense', category: 'X', date: '2026-07-02' });
    store.add({ description: 'C', amount: 30, type: 'expense', category: 'X', date: '2026-07-03' });
    store.add({ description: 'D', amount: 40, type: 'expense', category: 'X', date: '2026-07-04' });
    assert.equal(store.all().length, 4);

    // Remove ID 2 (segundo elemento)
    assert.equal(store.remove(2), true);
    assert.equal(store.all().length, 3);
    assert.equal(store.all().some((t) => t.id === 2), false); // ID 2 foi removido
    assert.equal(store.all().some((t) => t.id === 1), true);  // ID 1 ainda existe
    assert.equal(store.all().some((t) => t.id === 3), true);  // ID 3 ainda existe
    assert.equal(store.all().some((t) => t.id === 4), true);  // ID 4 ainda existe

    // Remove ID 4 (agora último elemento) — antes do bug, removeria ID 3
    assert.equal(store.remove(4), true);
    assert.equal(store.all().length, 2);
    assert.equal(store.all().some((t) => t.id === 4), false); // ID 4 foi removido
    assert.equal(store.all().some((t) => t.id === 3), true);  // ID 3 AINDA DEVE EXISTIR
    assert.equal(store.all().some((t) => t.id === 1), true);  // ID 1 ainda existe
  });

  test('remove por id procura corretamente mesmo com buracos no array', () => {
    const store = new TransactionStore();
    store.add({ description: 'A', amount: 10, type: 'expense', category: 'X', date: '2026-07-01' });
    store.add({ description: 'B', amount: 20, type: 'expense', category: 'X', date: '2026-07-02' });
    store.add({ description: 'C', amount: 30, type: 'expense', category: 'X', date: '2026-07-03' });
    store.add({ description: 'D', amount: 40, type: 'expense', category: 'X', date: '2026-07-04' });
    store.add({ description: 'E', amount: 50, type: 'expense', category: 'X', date: '2026-07-05' });

    // Remove 1º e 2º
    assert.equal(store.remove(1), true);
    assert.equal(store.remove(2), true);
    assert.equal(store.all().length, 3);

    // IDs restantes: 3, 4, 5 (nos índices 0, 1, 2)
    // Tenta remover ID 5 — antes do bug, tentaria acessar índice 4 (não existe)
    assert.equal(store.remove(5), true);
    assert.equal(store.all().length, 2);
    const remaining = store.all();
    assert.equal(remaining[0].id, 3);
    assert.equal(remaining[1].id, 4);
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
});
