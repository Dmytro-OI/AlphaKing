const chalk = require('chalk'); 
const now = () => new Date().toISOString();

module.exports = {
  log: (msg) => console.log(`[${now()}] ${chalk.cyan(msg)}`),
  warn: (msg) => console.warn(`[${now()}] ${chalk.yellow(msg)}`),
  error: (msg) => console.error(`[${now()}] ${chalk.red(msg)}`)
};
