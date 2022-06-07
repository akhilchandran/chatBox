'use strict';

const config = require('config');

const { getApp } = require('../APIServer/app');
const { getFakeLogger } = require('./logger');
const { getDB } = require('../APIServer/db/pg-client');


const logger = getFakeLogger();

function getTestApp(overrides = {}) {
  const db = overrides.db || getDB(config.pgConnection);
  const testLogger = overrides.logger || logger;
  const currentConfig = overrides && overrides.config ? overrides.config : config;
  return getApp({ config: currentConfig, logger: testLogger, db });
}


module.exports = {
  getTestApp,
  logger,
};
