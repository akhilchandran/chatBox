'use strict';

const pgPromise = require('pg-promise');
const retry = require('async-retry');
const { parse } = require('pg-connection-string');

const pgpConfig = {
  capSQL: true,
  noWarnings: true,
};

const pgp = pgPromise(pgpConfig);

function getDB(connection) {
  return pgp(connection);
}

function waitDBConnect(db) {
  return retry(
    async () => {
      const conn = await db.connect();
      conn.done();
      return db;
    },
    {
      retries: 6,
    },
  );
}

function getTestDB(config) {
  const pgMigrationConfig = parse(config.pgMigrationConnection);
  const pgConfig = parse(config.pgConnection);
  return getDB({ ...pgMigrationConfig, database: pgConfig.database });
}

module.exports = {
  getDB,
  pgp,
  pgpConfig,
  waitDBConnect,
  getTestDB,
};
