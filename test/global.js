'use strict';

const config = require('config');
const { expect } = require('chai');

const { runMigrations } = require('../db/migrate');
const { getFakeLogger, getLogsAtLevel } = require('./logger');

const logger = getFakeLogger();

before(async () => {
  await runMigrations(config, logger);
});

it('Run SQL migrations', async () => {
  const errorLogs = getLogsAtLevel(logger, 'error');
  expect(
    errorLogs.length,
    `Error running DB migrations: ${JSON.stringify(errorLogs, null, 2)}`,
  ).to.equal(0);
});

afterEach(logger.clearLogs);
