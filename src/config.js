// Tabela de preços. Valores em centavos para evitar erros de ponto flutuante.
module.exports = {
  toleranciaMinutos: 15,
  primeiraHora: 1000, // R$ 10,00
  horaAdicional: 500, // R$ 5,00 por hora adicional ou fração
  diariaMaxima: 5000, // R$ 50,00 a cada 24h
  multiplicadorPorVeiculo: {
    carro: 1,
    moto: 0.5,
    utilitario: 1,
  },
};
