/**
 * Converts transaction data to CSV format.
 * Properly escapes values and formats dates and amounts for readability.
 */

/**
 * Converts an array of transactions to CSV format string.
 * @param {Array} transactions - Array of transaction objects
 * @returns {string} CSV formatted string
 */
export function transactionsToCSV(transactions) {
  const headers = ['ID', 'Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)'];
  const rows = [headers.map(escapeCSVField).join(',')];

  for (const t of transactions) {
    const row = [
      String(t.id),
      formatDate(t.date),
      t.description,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      formatCurrency(t.amount),
    ];
    rows.push(row.map(escapeCSVField).join(','));
  }

  return rows.join('\n');
}

/**
 * Escapes a field value for CSV format.
 * Wraps fields containing special characters in quotes and escapes internal quotes.
 * @param {string} field - Field value to escape
 * @returns {string} Escaped field value
 */
function escapeCSVField(field) {
  const str = String(field);
  // If field contains comma, newline, or quote, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Formats a date from ISO format (YYYY-MM-DD) to Brazilian format (DD/MM/YYYY).
 * @param {string} iso - ISO format date string
 * @returns {string} Formatted date string
 */
function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Formats a currency value for CSV output (Brazilian Real).
 * @param {number} amount - Amount in BRL
 * @returns {string} Formatted currency string (e.g., "1.234,56")
 */
function formatCurrency(amount) {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
  // Remove the currency symbol (R$ ) to leave only the number
  return formatted.replace('R$ ', '').trim();
}

/**
 * Generates a filename for the CSV export with current date.
 * @returns {string} Filename in format "transacoes-YYYY-MM-DD.csv"
 */
export function generateExportFileName() {
  const today = new Date().toISOString().slice(0, 10);
  return `transacoes-${today}.csv`;
}
