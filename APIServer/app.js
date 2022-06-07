'use strict';

const express = require('express');

const bodyParser = require('body-parser');

const usersRouter = require('./routes/users');

const authRouter = require('./routes/authentication');

const session = require('express-session');

/**
 * Gets the express app taking in the conext with globals like db, config
 * @param {Object} context a context object with globals like config, db, redis
 * @return {Object} the express app wired up
 */
function getApp(context) {
  const app = express();

  app.use(session({ secret: 'haha this is me', cookie: { maxAge: 60000 } }));

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  // parse application/json
  app.use(bodyParser.json());

  app.disable('x-powered-by');
  app.set('etag', false);

  app.use('/api/users', usersRouter(context));

  app.use('/api/auth', authRouter(context));

  return app;
}

module.exports = { getApp };
