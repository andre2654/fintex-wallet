/**
 * Calcula o resumo financeiro de um conjunto de transações.
 *
 * @param {Array} transactions
 * @param {{month?: number, year?: number}} filters — month de 1 a 12
 * @returns {{income: number, expenses: number, balance: number, count: number, byCategory: object}}
 */
export function computeSummary(transactions, filters = {}) {
  let filtered = transactions;

  if (filters.year !== undefined) {
    const year = Number(filters.year);
    filtered = filtered.filter((t) => new Date(t.date).getUTCFullYear() === year);
  }

  if (filters.month !== undefined) {
    const month = Number(filters.month);
    filtered = filtered.filter((t) => new Date(t.date).getUTCMonth() === month - 1);
  }

  let income = 0;
  let expenses = 0;
  const byCategory = {};

  for (const t of filtered) {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expenses += t.amount;
      byCategory[t.category] = round2((byCategory[t.category] ?? 0) + t.amount);
    }
  }

  return {
    income: round2(income),
    expenses: round2(expenses),
    balance: round2(income - expenses),
    count: filtered.length,
    byCategory,
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
