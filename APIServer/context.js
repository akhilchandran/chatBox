'use strict';

const { waitDBConnect } = require('./db/pg-client');

/**
 * Gets the text app context
 * @param {Object} config the node config object
 * @param {Object} logger the winston logger client object
 * @param {Object} db the pg-promise pool db object
 * @return {Promise<{config: object, db: object}>} a promise the resolves to the context
 */
function getContext(config, logger, db) {
  return waitDBConnect(db, logger).then(db => {
    return {
      config,
      logger,
      db,
    };
  });
}

module.exports = { getContext };
