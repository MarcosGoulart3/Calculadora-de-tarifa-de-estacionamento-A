const configPadrao = require('./config');

const MINUTOS_POR_DIA = 24 * 60;

class ErroValidacao extends Error {}

function converterData(valor, campo) {
  if (valor === undefined || valor === null || valor === '') {
    throw new ErroValidacao(`O campo "${campo}" é obrigatório.`);
  }
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    throw new ErroValidacao(`O campo "${campo}" não é uma data válida (use ISO 8601, ex: 2026-10-17T08:00:00).`);
  }
  return data;
}

// Valor de um período menor que 24h, limitado à diária máxima.
function valorPeriodo(minutos, config) {
  if (minutos <= 0) return 0;
  const horas = Math.ceil(minutos / 60);
  const valor = config.primeiraHora + (horas - 1) * config.horaAdicional;
  return Math.min(valor, config.diariaMaxima);
}

function calcularTarifa({ entrada, saida, tipoVeiculo = 'carro' }, config = configPadrao) {
  const dataEntrada = converterData(entrada, 'entrada');
  const dataSaida = converterData(saida, 'saida');

  if (dataSaida < dataEntrada) {
    throw new ErroValidacao('A data de saída não pode ser anterior à data de entrada.');
  }

  const multiplicador = config.multiplicadorPorVeiculo[tipoVeiculo];
  if (multiplicador === undefined) {
    const tipos = Object.keys(config.multiplicadorPorVeiculo).join(', ');
    throw new ErroValidacao(`Tipo de veículo inválido: "${tipoVeiculo}". Tipos aceitos: ${tipos}.`);
  }

  const minutos = Math.ceil((dataSaida - dataEntrada) / 60000);

  let valorBase = 0;
  let dias = 0;
  let minutosRestantes = 0;
  const dentroTolerancia = minutos <= config.toleranciaMinutos;

  if (!dentroTolerancia) {
    dias = Math.floor(minutos / MINUTOS_POR_DIA);
    minutosRestantes = minutos % MINUTOS_POR_DIA;
    valorBase = dias * config.diariaMaxima + valorPeriodo(minutosRestantes, config);
  }

  const valorCentavos = Math.round(valorBase * multiplicador);

  return {
    entrada: dataEntrada.toISOString(),
    saida: dataSaida.toISOString(),
    tipoVeiculo,
    permanenciaMinutos: minutos,
    dentroTolerancia,
    diariasCompletas: dias,
    minutosRestantes,
    multiplicador,
    valorCentavos,
    valor: valorCentavos / 100,
    valorFormatado: formatarReais(valorCentavos),
  };
}

function formatarReais(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

module.exports = { calcularTarifa, formatarReais, ErroValidacao };
