'use strict';

const express = require('express');

const authController = require('../controllers/authentication');

module.exports = function loginRouter(context) {
  // eslint-disable-next-line new-cap
  const router = express.Router();

  const { login, logout } = authController(context);

  router.post('/login', login);

  router.post('/logout', logout);

  return router;
};
