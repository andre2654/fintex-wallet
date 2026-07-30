const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const els = {
  balance: document.getElementById('balance'),
  income: document.getElementById('income'),
  expenses: document.getElementById('expenses'),
  list: document.getElementById('tx-list'),
  count: document.getElementById('tx-count'),
  empty: document.getElementById('empty-state'),
  form: document.getElementById('tx-form'),
  formError: document.getElementById('form-error'),
  monthFilter: document.getElementById('month-filter'),
  yearFilter: document.getElementById('year-filter'),
  exportBtn: document.getElementById('export-csv-btn'),
};

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error ?? (data.errors ? data.errors.join('; ') : `Erro ${res.status}`);
    throw new Error(message);
  }
  return data;
}

function currentFilters() {
  const params = new URLSearchParams();
  if (els.monthFilter.value) params.set('month', els.monthFilter.value);
  if (els.yearFilter.value) params.set('year', els.yearFilter.value);
  return params;
}

async function loadSummary() {
  const params = currentFilters();
  const summary = await fetchJson(`/api/summary?${params}`);
  els.balance.textContent = brl.format(summary.balance);
  els.income.textContent = brl.format(summary.income);
  els.expenses.textContent = brl.format(summary.expenses);
}

async function loadTransactions() {
  const { transactions } = await fetchJson('/api/transactions');
  const month = els.monthFilter.value ? Number(els.monthFilter.value) : null;
  const year = els.yearFilter.value ? Number(els.yearFilter.value) : null;

  const visible = transactions.filter((t) => {
    const [y, m] = t.date.split('-').map(Number);
    if (year && y !== year) return false;
    if (month && m !== month) return false;
    return true;
  });

  els.count.textContent = `(${visible.length})`;
  els.empty.hidden = visible.length > 0;
  els.list.innerHTML = '';

  for (const t of visible) {
    const li = document.createElement('li');
    li.className = 'tx-item';

    const sign = t.type === 'income' ? '+' : '−';
    li.innerHTML = `
      <span class="tx-cat"></span>
      <span class="tx-desc"></span>
      <span class="tx-date"></span>
      <span class="tx-amount ${t.type}">${sign} ${brl.format(t.amount)}</span>
      <button class="tx-delete" title="Excluir" aria-label="Excluir transação">✕</button>
    `;
    li.querySelector('.tx-cat').textContent = t.category;
    li.querySelector('.tx-desc').textContent = t.description;
    li.querySelector('.tx-date').textContent = formatDate(t.date);
    li.querySelector('.tx-delete').addEventListener('click', () => removeTransaction(t.id));
    els.list.appendChild(li);
  }
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

async function removeTransaction(id) {
  try {
    await fetchJson(`/api/transactions/${id}`, { method: 'DELETE' });
    await refresh();
  } catch (err) {
    alert(`Não foi possível excluir: ${err.message}`);
  }
}

async function refresh() {
  await Promise.all([loadSummary(), loadTransactions()]);
}

els.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  els.formError.hidden = true;

  const payload = {
    description: document.getElementById('f-description').value,
    amount: Number(document.getElementById('f-amount').value),
    type: document.getElementById('f-type').value,
    category: document.getElementById('f-category').value,
    date: document.getElementById('f-date').value,
  };

  try {
    await fetchJson('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    els.form.reset();
    setDefaultDate();
    await refresh();
  } catch (err) {
    els.formError.textContent = err.message;
    els.formError.hidden = false;
  }
});

els.monthFilter.addEventListener('change', refresh);
els.yearFilter.addEventListener('change', refresh);

async function exportAsCSV() {
  try {
    const params = currentFilters();
    const response = await fetch(`/api/export/csv?${params}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error ?? `Erro ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = response.headers
      .get('content-disposition')
      ?.split('filename="')[1]
      ?.split('"')[0] ?? 'transacoes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert(`Não foi possível baixar o CSV: ${err.message}`);
  }
}

els.exportBtn.addEventListener('click', exportAsCSV);

function setDefaultDate() {
  document.getElementById('f-date').value = new Date().toISOString().slice(0, 10);
}

setDefaultDate();
refresh().catch((err) => console.error('Falha ao carregar dados:', err));
