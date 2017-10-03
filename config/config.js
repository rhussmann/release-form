const environment = (process.env.NODE_ENV) ?
      process.env.NODE_ENV.trim().toLowerCase() :
      'dev';

console.log(`Loading ${environment} config...`);
module.exports = require(`./${environment}`);
