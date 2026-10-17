const http = require('node:http');
const config = require('./config');
const { calcularTarifa, formatarReais, ErroValidacao } = require('./tarifa');

const LIMITE_CORPO = 10 * 1024;

function responder(res, status, corpo) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(corpo === undefined ? undefined : JSON.stringify(corpo));
}

function lerJson(req) {
  return new Promise((resolve, reject) => {
    let dados = '';
    req.on('data', (parte) => {
      dados += parte;
      if (dados.length > LIMITE_CORPO) {
        reject(new ErroValidacao('Corpo da requisição muito grande.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(dados ? JSON.parse(dados) : {});
      } catch {
        reject(new ErroValidacao('JSON inválido no corpo da requisição.'));
      }
    });
    req.on('error', reject);
  });
}

function tabelaDePrecos() {
  return {
    toleranciaMinutos: config.toleranciaMinutos,
    primeiraHora: formatarReais(config.primeiraHora),
    horaAdicional: formatarReais(config.horaAdicional),
    diariaMaxima: formatarReais(config.diariaMaxima),
    multiplicadorPorVeiculo: config.multiplicadorPorVeiculo,
  };
}

async function rotear(req, res) {
  const { pathname, searchParams } = new URL(req.url, 'http://localhost');

  if (req.method === 'OPTIONS') return responder(res, 204);

  if (req.method === 'GET' && pathname === '/health') {
    return responder(res, 200, { status: 'ok' });
  }

  if (req.method === 'GET' && pathname === '/tarifas') {
    return responder(res, 200, tabelaDePrecos());
  }

  if (pathname === '/calcular') {
    let parametros;
    if (req.method === 'POST') {
      parametros = await lerJson(req);
    } else if (req.method === 'GET') {
      parametros = Object.fromEntries(searchParams);
    } else {
      return responder(res, 405, { erro: 'Método não permitido.' });
    }
    return responder(res, 200, calcularTarifa(parametros));
  }

  return responder(res, 404, { erro: 'Rota não encontrada.' });
}

function criarServidor() {
  return http.createServer(async (req, res) => {
    try {
      await rotear(req, res);
    } catch (erro) {
      if (erro instanceof ErroValidacao) {
        return responder(res, 400, { erro: erro.message });
      }
      console.error(erro);
      return responder(res, 500, { erro: 'Erro interno do servidor.' });
    }
  });
}

module.exports = { criarServidor };
