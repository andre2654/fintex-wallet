import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TransactionStore } from '../src/store.js';
import { createApp } from '../server.js';

describe('DELETE bug fix — remove transação correta após exclusões', () => {
  test('store.remove() usa ID, não índice de array', () => {
    const store = new TransactionStore();
    // Adiciona 5 transações (IDs 1-5)
    store.add({ description: 'T1', amount: 10, type: 'expense', category: 'X', date: '2026-07-01' });
    store.add({ description: 'T2', amount: 20, type: 'expense', category: 'X', date: '2026-07-01' });
    store.add({ description: 'T3', amount: 30, type: 'expense', category: 'X', date: '2026-07-01' });
    store.add({ description: 'T4', amount: 40, type: 'expense', category: 'X', date: '2026-07-01' });
    store.add({ description: 'T5', amount: 50, type: 'expense', category: 'X', date: '2026-07-01' });

    // Remove ID 2 (índice 1)
    assert.equal(store.remove(2), true);
    assert.equal(store.all().length, 4);
    assert.equal(store.all().find(t => t.id === 2), undefined);

    // Remove ID 5 (deve remover T5, não T4 que agora está no índice 3)
    assert.equal(store.remove(5), true);
    assert.equal(store.all().length, 3);
    assert.equal(store.all().find(t => t.id === 5), undefined);
    assert.equal(store.all().find(t => t.id === 4).description, 'T4');
    assert.equal(store.all().find(t => t.id === 1).description, 'T1');
    assert.equal(store.all().find(t => t.id === 3).description, 'T3');
  });

  test('DELETE /api/transactions/:id remove transação correta após exclusões', async () => {
    const store = new TransactionStore();
    store.add({ description: 'Aluguel', amount: 2000, type: 'expense', category: 'Moradia', date: '2026-07-06' });
    store.add({ description: 'Salário', amount: 5000, type: 'income', category: 'Salário', date: '2026-07-05' });
    store.add({ description: 'Mercado', amount: 300, type: 'expense', category: 'Alimentação', date: '2026-07-10' });
    store.add({ description: 'Show', amount: 150, type: 'expense', category: 'Lazer', date: '2026-07-18' });
    store.add({ description: 'Bônus', amount: 1000, type: 'income', category: 'Salário', date: '2026-07-20' });

    const server = createApp(store);
    await new Promise((resolve) => server.listen(0, resolve));
    const baseUrl = `http://localhost:${server.address().port}`;

    try {
      // DELETE /2 (Aluguel)
      let res = await fetch(`${baseUrl}/api/transactions/2`, { method: 'DELETE' });
      assert.equal(res.status, 200);

      // DELETE /5 (Bônus) — não deve remover ID 4
      res = await fetch(`${baseUrl}/api/transactions/5`, { method: 'DELETE' });
      assert.equal(res.status, 200);

      // Verifica que ID 5 foi removido, ID 4 ainda existe
      res = await fetch(`${baseUrl}/api/transactions`);
      const txns = (await res.json()).transactions;
      assert.equal(txns.find(t => t.id === 5), undefined);
      assert.equal(txns.find(t => t.id === 4).description, 'Show');
      assert.equal(txns.length, 3);
    } finally {
      server.close();
    }
  });
});
