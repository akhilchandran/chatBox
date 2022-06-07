'use strict';

const config = require('config');
const stoppable = require('stoppable');

const { getApp } = require('./APIServer/app');
const { runMigrations } = require('./db/migrate');
const { getContext } = require('./APIServer/context');
const { getDB } = require('./APIServer/db/pg-client');
const { getLogger } = require('./APIServer/logger');

const logger = getLogger(config);

const killSignals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGUSR2: 12,
  SIGTERM: 15,
};

function shutdown(nodeApp, context, signal, value) {
  context.logger.info(`Trying shutdown, got signal ${signal}`);
  nodeApp.stop(() => {
    context.logger.info('Node app stopped.');
    context.logger.info('Status app stopped.');
    context.pgDB.$pool.end();
    context.logger.info('DB connections stopped.');
    process.exit(128 + value);
  });
}

function start(context) {
  const app = getApp(context);

  const nodeApp = stoppable(
    app.listen(config.port, () =>
      context.logger.info(`Node app listening on port ${config.port}!`),
    ),
  );

  nodeApp.timeout = 0;

  process.once('SIGUSR2', () => shutdown(nodeApp, context, 'SIGUSR2', killSignals.SIGUSR2));
  process.once('SIGHUP', () => shutdown(nodeApp, context, 'SIGHUP', killSignals.SIGHUP));
  process.once('SIGINT', () => shutdown(nodeApp, context, 'SIGINT', killSignals.SIGINT));
  process.once('SIGTERM', () => shutdown(nodeApp, context, 'SIGTERM', killSignals.SIGTERM));

  return nodeApp;
}

runMigrations(config, logger)
  .then(() => getContext(config, logger, getDB(config.pgConnection)))
  .then(start)
  .catch(error => {
    logger.info(`Failed to start services: ${error.stack}`);
    process.exit(1);
  });
