'use strict';
const { StatusCodes } = require('http-status-codes');
const { getUserByEmail } = require('../managers/users');
const validate = require('validate.js');

const loginConstraints = {
  email: {
    email: true,
  },
  password: {
    type: 'string',
    presence: true,
    length: {
      minimum: 5,
      maximum: 50,
    },
  },
};

module.exports = function authController(context) {
  async function login(req, res, next) {
    req.session.user = null;
    const validationResults = validate(req.body, loginConstraints, { format: 'flat' });
    if (validationResults) {
      return res.status(StatusCodes.BAD_REQUEST).json(validationResults);
    }
    const user = await getUserByEmail(context.db, req.body.email);
    if (user.password != req.body.password) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid credentials' });
    }
    req.session.user = user;
    req.session.save((error, data)=> {
      if (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.stack });
      } else {
        res.json({ status: 'success' });
      }
    });
  };

  function logout(req, res, next) {
    req.session.user = null;
    req.session.save((error, data)=> {
      if (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.stack });
      } else {
        res.json({ status: 'success' });
      }
    });
  };
  return { login, logout };
};
