# Issue #1 — Resumo mensal mostra valores do mês errado

**Prioridade:** Alta
**Reportado por:** usuário beta (via suporte)
**Status:** Aberta

## Descrição

Ao filtrar o dashboard por um mês específico, os cards de **Saldo / Receitas / Despesas** não batem com as transações listadas abaixo.

## Passos para reproduzir

1. Rodar `npm start` e abrir http://localhost:3000
2. No filtro de período, selecionar **Junho** de 2026
3. A lista de transações mostra corretamente as 6 transações de junho
4. Porém os cards de resumo mostram os valores de **julho** (ex: despesas de R$ 3.672,25 em vez de R$ 3.236,40)

Também dá pra reproduzir direto na API:

```bash
curl "http://localhost:3000/api/summary?month=6&year=2026"
# retorna os totais de JULHO, não de junho
```

Selecionando **Dezembro**, o resumo vem zerado mesmo quando há transações em dezembro.

## Comportamento esperado

`GET /api/summary?month=6&year=2026` deve retornar o resumo das transações de **junho** de 2026, consistente com a lista exibida no frontend. Conforme o README, o parâmetro `month` vai de 1 a 12.
