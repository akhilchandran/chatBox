'use strict';
const { StatusCodes } = require('http-status-codes');

module.exports.requireLogedin = function(req, res, next) {
  if (req.session && req.session.user && req.session.user.email) {
    return next();
  }
  return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Should login to access' });
};

module.exports.requireAdmin = function(req, res, next) {
  if (req.session && req.session.user && req.session.user.role == 'ADMIN') {
    return next();
  }
  return res.status(StatusCodes.FORBIDDEN).json({ error: 'Only admin is allowed' });
};
