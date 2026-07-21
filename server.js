import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TransactionStore } from './src/store.js';
import { computeSummary } from './src/summary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};

export function createApp(store) {
  return createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    try {
      if (url.pathname.startsWith('/api/')) {
        await handleApi(req, res, url, store);
      } else {
        await serveStatic(res, url.pathname);
      }
    } catch (err) {
      console.error(err);
      sendJson(res, 500, { error: 'Erro interno do servidor' });
    }
  });
}

async function handleApi(req, res, url, store) {
  const { pathname } = url;

  // GET /api/transactions?category=X
  if (req.method === 'GET' && pathname === '/api/transactions') {
    let transactions = store.all();
    const category = url.searchParams.get('category');
    if (category) {
      transactions = transactions.filter((t) => t.category === category);
    }
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sendJson(res, 200, { transactions });
  }

  // POST /api/transactions
  if (req.method === 'POST' && pathname === '/api/transactions') {
    const body = await readBody(req);
    if (body === null) return sendJson(res, 400, { error: 'JSON inválido' });
    const result = store.add(body);
    if (!result.ok) return sendJson(res, 422, { errors: result.errors });
    return sendJson(res, 201, { transaction: result.transaction });
  }

  // DELETE /api/transactions/:id
  const deleteMatch = pathname.match(/^\/api\/transactions\/(\d+)$/);
  if (req.method === 'DELETE' && deleteMatch) {
    const removed = store.remove(deleteMatch[1]);
    if (!removed) return sendJson(res, 404, { error: 'Transação não encontrada' });
    return sendJson(res, 200, { ok: true });
  }

  // GET /api/summary?month=1-12&year=YYYY
  if (req.method === 'GET' && pathname === '/api/summary') {
    const filters = {};
    if (url.searchParams.has('month')) filters.month = url.searchParams.get('month');
    if (url.searchParams.has('year')) filters.year = url.searchParams.get('year');
    return sendJson(res, 200, computeSummary(store.all(), filters));
  }

  sendJson(res, 404, { error: 'Rota não encontrada' });
}

async function serveStatic(res, pathname) {
  const file = pathname === '/' ? 'index.html' : pathname.slice(1);
  const filePath = path.join(PUBLIC_DIR, path.normalize(file));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const content = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 — não encontrado');
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(null);
      }
    });
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

// Só inicia o servidor quando executado diretamente (não em testes)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const store = new TransactionStore(path.join(__dirname, 'data', 'transactions.json'));
  const port = process.env.PORT ?? 3000;
  createApp(store).listen(port, () => {
    console.log(`Fintex Wallet rodando em http://localhost:${port}`);
  });
}
