# Calculadora-de-tarifa-de-estacionamento-A

API HTTP para cálculo de tarifas de estacionamento, escrita em Node.js sem dependências externas.

## Como executar

Requer Node.js 18 ou superior.

```bash
npm start      # sobe a API em http://localhost:3000 (porta configurável via PORT)
npm test       # executa os testes
```

## Regras de cobrança

Configuráveis em [src/config.js](src/config.js):

| Regra | Valor padrão |
|---|---|
| Tolerância (gratuita) | até 15 minutos |
| Primeira hora | R$ 10,00 |
| Cada hora adicional (ou fração) | R$ 5,00 |
| Diária máxima (a cada 24h) | R$ 50,00 |
| Multiplicador por veículo | carro e utilitário 1×, moto 0,5× |

Permanências acima de 24h somam uma diária por dia completo e calculam o período restante normalmente (limitado também à diária).

## Endpoints

### `POST /calcular`

```json
{
  "entrada": "2026-10-17T08:00:00",
  "saida": "2026-10-17T10:30:00",
  "tipoVeiculo": "carro"
}
```

`tipoVeiculo` é opcional (padrão `carro`). Datas em formato ISO 8601.

Resposta:

```json
{
  "entrada": "2026-10-17T11:00:00.000Z",
  "saida": "2026-10-17T13:30:00.000Z",
  "tipoVeiculo": "carro",
  "permanenciaMinutos": 150,
  "dentroTolerancia": false,
  "diariasCompletas": 0,
  "minutosRestantes": 150,
  "multiplicador": 1,
  "valorCentavos": 2000,
  "valor": 20,
  "valorFormatado": "R$ 20,00"
}
```

### `GET /calcular?entrada=...&saida=...&tipoVeiculo=...`

Mesmo cálculo, recebendo os parâmetros via query string.

### `GET /tarifas`

Retorna a tabela de preços vigente.

### `GET /health`

Verificação de disponibilidade.

### Erros

Dados inválidos retornam `400` com `{ "erro": "mensagem" }`.
