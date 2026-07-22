import fs from 'node:fs';
import path from 'node:path';

const VALID_TYPES = ['income', 'expense'];

/**
 * Armazena transações em memória, com persistência opcional em JSON.
 * Passe `filePath` para persistir em disco; omita para uso em testes.
 */
export class TransactionStore {
  constructor(filePath = null) {
    this.filePath = filePath;
    this.transactions = [];
    this.nextId = 1;
    if (filePath) this.#load();
  }

  #load() {
    if (!fs.existsSync(this.filePath)) return;
    const raw = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    this.transactions = raw.transactions ?? [];
    this.nextId = raw.nextId ?? this.transactions.length + 1;
  }

  #persist() {
    if (!this.filePath) return;
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(
      this.filePath,
      JSON.stringify({ nextId: this.nextId, transactions: this.transactions }, null, 2)
    );
  }

  all() {
    return [...this.transactions];
  }

  /**
   * Valida e adiciona uma transação.
   * @returns {{ok: true, transaction: object} | {ok: false, errors: string[]}}
   */
  add(input) {
    const errors = validate(input);
    if (errors.length > 0) return { ok: false, errors };

    const transaction = {
      id: this.nextId++,
      description: String(input.description).trim(),
      amount: Math.round(Number(input.amount) * 100) / 100,
      type: input.type,
      category: String(input.category).trim(),
      date: input.date,
    };
    this.transactions.push(transaction);
    this.#persist();
    return { ok: true, transaction };
  }

  remove(id) {
    const transactionId = Number(id);
    const idx = this.transactions.findIndex((t) => t.id === transactionId);
    if (idx === -1) {
      return false;
    }
    this.transactions.splice(idx, 1);
    this.#persist();
    return true;
  }
}

function validate(input) {
  const errors = [];
  if (!input || typeof input !== 'object') return ['corpo da requisição inválido'];

  if (!input.description || String(input.description).trim() === '') {
    errors.push('description é obrigatório');
  }
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push('amount deve ser um número maior que zero');
  }
  if (!VALID_TYPES.includes(input.type)) {
    errors.push(`type deve ser um de: ${VALID_TYPES.join(', ')}`);
  }
  if (!input.category || String(input.category).trim() === '') {
    errors.push('category é obrigatório');
  }
  if (!input.date || Number.isNaN(new Date(input.date).getTime())) {
    errors.push('date deve ser uma data válida (ISO 8601, ex: 2026-07-15)');
  }
  return errors;
}
