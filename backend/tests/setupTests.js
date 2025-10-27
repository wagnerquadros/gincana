
const chalk = require("chalk");

let startTime = 0;
let lastLog = {};

beforeAll(() => {
  console.log(chalk.bold.cyan("\n══════════════════════════════════════════════"));
  console.log(chalk.bold.cyan("🧩 INICIANDO SUITE DE TESTES"));
  console.log(chalk.bold.cyan("══════════════════════════════════════════════\n"));
});

beforeEach(() => {
  const state = expect.getState?.();
  const name = state?.currentTestName || "teste sem nome";
  startTime = Date.now();

  console.log(chalk.bold.blue("──────────────────────────────────────────────"));
  console.log(chalk.bold.blue(`🚀 Iniciando teste:`), chalk.whiteBright(name));
  console.log(chalk.bold.blue("──────────────────────────────────────────────"));

  // Se quiser registrar dinamicamente dados enviados:
  lastLog[name] = { start: Date.now(), dataSent: null, response: null, error: null };
  global.testLog = (info) => {
    if (typeof info === "object") lastLog[name] = { ...lastLog[name], ...info };
  };
});

afterEach(() => {
  const state = expect.getState?.();
  const name = state?.currentTestName || "teste sem nome";
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const failed = state?.currentTestAssertions?.some(a => a.status === "failed");
  const log = lastLog[name] || {};

  if (failed) {
    console.log(chalk.red.bold(`❌ FALHOU:`), chalk.white(name));
  } else {
    console.log(chalk.green.bold(`✅ SUCESSO:`), chalk.white(name));
  }

  if (log.dataSent) {
    console.log(chalk.yellowBright("📤 Enviado:"), chalk.gray(JSON.stringify(log.dataSent, null, 2)));
  }
  if (log.response) {
    console.log(chalk.greenBright("📥 Retorno:"), chalk.gray(JSON.stringify(log.response, null, 2)));
  }
  if (log.error) {
    console.log(chalk.redBright("⚠️  Erro:"), chalk.gray(log.error.message || log.error));
  }

  console.log(chalk.bold.magenta(`⏱️ Tempo: ${duration}s`));
  console.log(chalk.bold.blue("──────────────────────────────────────────────\n"));
});

afterAll(() => {
  console.log(chalk.bold.cyan("\n══════════════════════════════════════════════"));
  console.log(chalk.bold.cyan("✅ TODOS OS TESTES FINALIZADOS"));
  console.log(chalk.bold.cyan("══════════════════════════════════════════════\n"));
});
