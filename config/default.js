'use strict';

module.exports = {
  port: process.env.PORT || 3000,
  loggerLevel: process.env.LOGGER_LEVEL || 'info',
  pgMigrationConnection: process.env.PG_MIGRATION_CONNECTION || 'postgres://postgres:postgres@localhost:15432/postgres',
  pgConnection:
    process.env.PG_CONNECTION || 'postgres://chat-box-user:password123!@localhost:15432/chat-box-local',
};
