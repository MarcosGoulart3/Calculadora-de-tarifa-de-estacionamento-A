const { criarServidor } = require('./app');

const PORTA = process.env.PORT || 3000;

criarServidor().listen(PORTA, () => {
  console.log(`API de tarifas rodando em http://localhost:${PORTA}`);
});
