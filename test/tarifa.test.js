const test = require('node:test');
const assert = require('node:assert/strict');
const { calcularTarifa, ErroValidacao } = require('../src/tarifa');

const entrada = '2026-10-17T08:00:00Z';
const saidaApos = (minutos) => new Date(Date.parse(entrada) + minutos * 60000).toISOString();
const valor = (minutos, tipoVeiculo) =>
  calcularTarifa({ entrada, saida: saidaApos(minutos), tipoVeiculo }).valorCentavos;

test('permanência dentro da tolerância é gratuita', () => {
  assert.equal(valor(0), 0);
  assert.equal(valor(15), 0);
});

test('logo após a tolerância cobra a primeira hora', () => {
  assert.equal(valor(16), 1000);
  assert.equal(valor(60), 1000);
});

test('horas adicionais são cobradas por fração', () => {
  assert.equal(valor(61), 1500);
  assert.equal(valor(120), 1500);
  assert.equal(valor(121), 2000);
});

test('valor é limitado à diária máxima', () => {
  assert.equal(valor(10 * 60), 5000);
  assert.equal(valor(24 * 60), 5000);
});

test('permanência de vários dias soma diárias e o período restante', () => {
  assert.equal(valor(24 * 60 + 30), 6000);
  assert.equal(valor(48 * 60 + 61), 11500);
});

test('aplica multiplicador por tipo de veículo', () => {
  assert.equal(valor(61, 'moto'), 750);
  assert.equal(valor(61, 'utilitario'), 1500);
});

test('segundos parciais contam como minuto adicional', () => {
  const r = calcularTarifa({ entrada, saida: '2026-10-17T08:15:01Z' });
  assert.equal(r.permanenciaMinutos, 16);
  assert.equal(r.valorCentavos, 1000);
});

test('rejeita entradas inválidas', () => {
  assert.throws(() => calcularTarifa({ saida: entrada }), ErroValidacao);
  assert.throws(() => calcularTarifa({ entrada: 'abc', saida: entrada }), ErroValidacao);
  assert.throws(() => calcularTarifa({ entrada: saidaApos(10), saida: entrada }), ErroValidacao);
  assert.throws(() => calcularTarifa({ entrada, saida: saidaApos(10), tipoVeiculo: 'aviao' }), ErroValidacao);
});
