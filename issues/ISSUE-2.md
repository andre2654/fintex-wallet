# Issue #2 — Excluir uma transação apaga outra transação

**Prioridade:** Crítica (perda de dados)
**Reportado por:** QA interno
**Status:** Aberta

## Descrição

Depois de excluir uma transação, as exclusões seguintes começam a se comportar de forma errada: às vezes **outra transação é apagada** no lugar da escolhida, e às vezes a API responde `404` para uma transação que claramente existe.

## Passos para reproduzir

1. Rodar `npm start` e abrir http://localhost:3000 (usar o seed que vem no repositório)
2. Excluir a transação **"Aluguel" de 07/06** (funciona)
3. Em seguida, tentar excluir **"Show no Allianz Parque" (18/07)**
4. A transação errada some da lista — e o "Show no Allianz Parque" continua lá

Via API:

```bash
# com o seed intacto (ids 1 a 12):
curl -X DELETE http://localhost:3000/api/transactions/2   # ok, remove o id 2
curl -X DELETE http://localhost:3000/api/transactions/12  # responde 404, mas o id 12 existe!
curl -X DELETE http://localhost:3000/api/transactions/11  # remove o id 12 (!!) em vez do 11
```

## Comportamento esperado

`DELETE /api/transactions/:id` deve remover **exatamente** a transação cujo campo `id` é igual ao informado, e retornar `404` apenas quando esse `id` não existir. Excluir nunca pode afetar outra transação.

## Observações

O teste automatizado de remoção passa, então o problema não aparece no CI. Parece depender do estado do banco (acontece depois que alguma exclusão já foi feita).
