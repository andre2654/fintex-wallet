/**
 * CSV export utilities for transactions
 * RFC 4180 compliant with pt-BR formatting
 */

/**
 * Escape a field value for CSV output
 * Wraps in quotes if contains comma, quote, or newline
 * @param {any} value - The value to escape
 * @returns {string} - Escaped CSV field
 */
export function escapeField(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Translate transaction type to Portuguese
 * @param {string} type - 'income' or 'expense'
 * @returns {string} - Portuguese label
 */
function translateType(type) {
  return type === 'income' ? 'Receita' : 'Despesa';
}

/**
 * Format date from ISO 8601 to DD/MM/YYYY
 * @param {string} iso - ISO 8601 date string (YYYY-MM-DD)
 * @returns {string} - Formatted date (DD/MM/YYYY)
 */
function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Format currency amount as pt-BR (comma as decimal separator)
 * @param {number} amount - Amount in reais
 * @returns {string} - Formatted as "1.234,56"
 */
function formatCurrency(amount) {
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * Convert array of transactions to CSV string
 * @param {Array} transactions - Array of transaction objects
 * @returns {string} - CSV content with UTF-8 BOM
 */
export function transactionsToCSV(transactions) {
  const headers = ['ID', 'Data', 'Descrição', 'Tipo', 'Categoria', 'Valor'];
  const headerLine = headers.map(escapeField).join(';');

  const rows = transactions.map((t) => {
    const cells = [
      t.id,
      formatDate(t.date),
      t.description,
      translateType(t.type),
      t.category,
      formatCurrency(t.amount),
    ];
    return cells.map(escapeField).join(';');
  });

  // UTF-8 BOM for Excel compatibility
  const csv = [headerLine, ...rows].join('\n');
  return '﻿' + csv;
}

/**
 * Generate filename based on applied filters
 * @param {Object} filters - {month?: number, year?: number}
 * @returns {string} - Filename like "transactions-2026-07.csv"
 */
export function generateFilename(filters = {}) {
  let base = 'transactions';
  const { month, year } = filters;

  if (year && month) {
    const monthStr = String(month).padStart(2, '0');
    return `${base}-${year}-${monthStr}.csv`;
  }
  if (year) {
    return `${base}-${year}.csv`;
  }
  return `${base}.csv`;
}
