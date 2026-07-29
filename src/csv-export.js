/**
 * Converts transactions array to CSV format
 * @param {Array} transactions - Array of transaction objects
 * @returns {string} CSV content with proper escaping
 */
export function transactionsToCSV(transactions) {
  // CSV headers in Portuguese
  const headers = ['ID', 'Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    escapeCSVField(t.description),
    escapeCSVField(t.category),
    t.type === 'income' ? 'Receita' : 'Despesa',
    formatCurrency(t.amount),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
}

/**
 * Escapes CSV field content (wraps in quotes if contains comma, quote, or newline)
 * @param {string} field - The field to escape
 * @returns {string} Escaped field
 */
function escapeCSVField(field) {
  const str = String(field);
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Formats currency value for CSV export (BRL)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}
