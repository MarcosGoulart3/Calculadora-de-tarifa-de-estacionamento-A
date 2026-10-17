const test = require('node:test');
const assert = require('node:assert/strict');
const { criarServidor } = require('../src/app');

let servidor;
let base;

test.before(async () => {
  servidor = criarServidor();
  await new Promise((resolve) => servidor.listen(0, resolve));
  base = `http://localhost:${servidor.address().port}`;
});

test.after(() => servidor.close());

test('GET /tarifas retorna a tabela de preços', async () => {
  const res = await fetch(`${base}/tarifas`);
  assert.equal(res.status, 200);
  const corpo = await res.json();
  assert.equal(corpo.toleranciaMinutos, 15);
});

test('POST /calcular retorna o valor', async () => {
  const res = await fetch(`${base}/calcular`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entrada: '2026-10-17T08:00:00Z', saida: '2026-10-17T10:30:00Z' }),
  });
  assert.equal(res.status, 200);
  const corpo = await res.json();
  assert.equal(corpo.valorCentavos, 2000);
});

test('GET /calcular aceita query string', async () => {
  const res = await fetch(`${base}/calcular?entrada=2026-10-17T08:00:00Z&saida=2026-10-17T09:00:00Z&tipoVeiculo=moto`);
  const corpo = await res.json();
  assert.equal(corpo.valorCentavos, 500);
});

test('erros de validação retornam 400', async () => {
  const res = await fetch(`${base}/calcular`, { method: 'POST', body: '{invalido' });
  assert.equal(res.status, 400);
  const res2 = await fetch(`${base}/calcular`, { method: 'POST', body: '{}' });
  assert.equal(res2.status, 400);
});

test('rota desconhecida retorna 404', async () => {
  const res = await fetch(`${base}/nada`);
  assert.equal(res.status, 404);
});
