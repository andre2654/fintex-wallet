# Fintex Wallet

## POC smoke test

DSE live turn confirmed working.

Aplicação de controle de finanças pessoais — demo da Fintex. Node.js puro, **zero dependências**.

## Como rodar

```bash
npm start          # servidor em http://localhost:3000
npm run dev        # com auto-reload
npm test           # roda a suíte de testes (node --test)
```

Requer Node.js >= 20.

## Estrutura

```
server.js            # servidor HTTP + rotas da API + arquivos estáticos
src/store.js         # armazenamento de transações (persiste em data/transactions.json)
src/summary.js       # cálculo do resumo financeiro (receitas, despesas, saldo)
public/              # frontend (HTML/CSS/JS vanilla)
data/                # dados persistidos (seed incluído)
test/                # testes com node:test
```

## API

### `GET /api/transactions`

Lista todas as transações, ordenadas por data (mais recente primeiro).

Query params opcionais:
- `category` — filtra por categoria exata.

### `POST /api/transactions`

Cria uma transação. Corpo JSON:

```json
{
  "description": "Supermercado",
  "amount": 250.9,
  "type": "expense",
  "category": "Alimentação",
  "date": "2026-07-15"
}
```

- `amount`: número > 0 (o sinal é dado pelo `type`)
- `type`: `income` ou `expense`
- `date`: ISO 8601 (`YYYY-MM-DD`)

Retorna `201` com a transação criada, ou `422` com a lista de erros de validação.

### `DELETE /api/transactions/:id`

Remove a transação com o `id` informado. Retorna `200`, ou `404` se não existir.

### `GET /api/summary`

Resumo financeiro: `{ income, expenses, balance, count, byCategory }`.

Query params opcionais:
- `month` — mês de **1 a 12**
- `year` — ano com 4 dígitos (ex: `2026`)

Exemplo: `GET /api/summary?month=7&year=2026` → resumo de julho de 2026.

## Modelo de dados

| Campo         | Tipo     | Notas                              |
| ------------- | -------- | ---------------------------------- |
| `id`          | number   | sequencial, gerado pelo servidor   |
| `description` | string   | obrigatório                        |
| `amount`      | number   | sempre positivo, 2 casas decimais  |
| `type`        | string   | `income` \| `expense`              |
| `category`    | string   | livre                              |
| `date`        | string   | `YYYY-MM-DD`                       |
