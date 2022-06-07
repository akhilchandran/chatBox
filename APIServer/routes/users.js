'use strict';

const express = require('express');

const userController = require('../controllers/users');

const { requireAdmin, requireLogedin } = require('../middlewares/auth');

function usersRouter(context) {
  // eslint-disable-next-line new-cap
  const router = express.Router();

  const { listUsers, getUser, createUser, updateUser } = userController(context);

  router.get('/', requireLogedin, listUsers);

  router.post('/', requireLogedin, requireAdmin, createUser);

  router.put('/:userId(\\d+)', requireLogedin, requireAdmin, updateUser);

  router.get('/:userId(\\d+)', requireLogedin, getUser);

  return router;
}

module.exports = usersRouter;
