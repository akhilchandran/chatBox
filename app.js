'use strict';
const express = require('express');
const app = express();
const helmet = require('helmet');
const router = require('./routes');
// const express_enforces_ssl = require('express-enforces-ssl');
// app.use(express_enforces_ssl());
app.use(helmet());
app.use('/', router);
const server = app.listen(8080, function() {
  const host = server.address().address;
  const port = server.address().port;
  console.log('API server listening on host '+host+', port '+port+'!');
});
