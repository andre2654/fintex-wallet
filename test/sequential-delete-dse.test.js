import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TransactionStore } from '../src/store.js';

describe('Sequential Delete Bug Fix', () => {
  test('deleta transações sequencialmente sem afetar outras', () => {
    const store = new TransactionStore();
    
    // Simula seed: adiciona 12 transações
    for (let i = 1; i <= 12; i++) {
      store.add({
        description: `Transaction ${i}`,
        amount: i * 10,
        type: 'expense',
        category: 'Test',
        date: '2026-07-01',
      });
    }
    assert.equal(store.all().length, 12);

    // DELETE /api/transactions/2 — remove id 2
    assert.equal(store.remove(2), true);
    assert.equal(store.all().length, 11);
    assert.equal(store.all().some((t) => t.id === 2), false);
    assert.equal(store.all().some((t) => t.id === 1), true);
    assert.equal(store.all().some((t) => t.id === 3), true);

    // DELETE /api/transactions/12 — remove id 12 (não 404)
    assert.equal(store.remove(12), true);
    assert.equal(store.all().length, 10);
    assert.equal(store.all().some((t) => t.id === 12), false);
    assert.equal(store.all().some((t) => t.id === 11), true);

    // DELETE /api/transactions/11 — remove id 11 (não id 12)
    assert.equal(store.remove(11), true);
    assert.equal(store.all().length, 9);
    assert.equal(store.all().some((t) => t.id === 11), false);
    assert.equal(store.all().some((t) => t.id === 10), true);

    // Verifica que apenas os ids corretos foram removidos
    const remaining = store.all().map((t) => t.id).sort((a, b) => a - b);
    const expected = [1, 3, 4, 5, 6, 7, 8, 9, 10];
    assert.deepEqual(remaining, expected);
  });

  test('remove por id com buracos no array após múltiplas exclusões', () => {
    const store = new TransactionStore();
    
    // Adiciona 5 transações
    store.add({ description: 'Aluguel', amount: 1000, type: 'expense', category: 'Moradia', date: '2026-07-06' });
    store.add({ description: 'Show no Allianz Parque', amount: 150, type: 'expense', category: 'Lazer', date: '2026-07-18' });
    store.add({ description: 'Supermercado', amount: 250, type: 'expense', category: 'Alimentação', date: '2026-07-10' });
    store.add({ description: 'Gasolina', amount: 80, type: 'expense', category: 'Transporte', date: '2026-07-15' });
    store.add({ description: 'Cinema', amount: 60, type: 'expense', category: 'Lazer', date: '2026-07-20' });
    
    assert.equal(store.all().length, 5);
    
    // Remove Aluguel (id 1)
    assert.equal(store.remove(1), true);
    assert.equal(store.all().length, 4);
    assert.equal(store.all().some((t) => t.description === 'Aluguel'), false);
    
    // Remove Show no Allianz Parque (id 2) — deve remover apenas este
    assert.equal(store.remove(2), true);
    assert.equal(store.all().length, 3);
    assert.equal(store.all().some((t) => t.description === 'Show no Allianz Parque'), false);
    
    // Verifica que os outros ainda existem
    assert.equal(store.all().some((t) => t.description === 'Supermercado'), true);
    assert.equal(store.all().some((t) => t.description === 'Gasolina'), true);
    assert.equal(store.all().some((t) => t.description === 'Cinema'), true);
  });
});
