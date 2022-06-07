'use strict';

const config = require('config');
const session = require('supertest-session');
const { StatusCodes } = require('http-status-codes');
const { assert } = require('chai');

const { getTestApp } = require('./app');
const { getTestDB } = require('../APIServer/db/pg-client');
const { cleanData, addUsers } = require('./db-helpers');

describe('GET /api/users', () => {
  let app = null;
  let testDB = null;
  let testUsers = [];
  let testSession = null;

  before(async () => {
    app = getTestApp();
    testDB = getTestDB(config);
    await cleanData(testDB);

    testUsers = await addUsers(testDB, [
      { firstName: 'Alexandra', lastName: 'McGlynn', email: 'Alexandra@123.com', password: 'djfkndfhk', role: 'ADMIN' },
      { firstName: 'Howell', lastName: 'Parisian', email: 'Howell@123.com', password: 'byujscfdh', role: 'ADMIN' },
      { firstName: 'Joanie', lastName: 'Miller', email: 'Joanie@123.com', password: 'dssdcdsfggrt', role: 'USER' },
      { firstName: 'Otho', lastName: 'Ferry', email: 'Otho@123.com', password: 'rtghrytyty4554', role: 'USER' },
      { firstName: 'Kiana', lastName: 'Cummerata', email: 'Kiana@123.com', password: 'djfkndf!@hk', role: 'ADMIN' },
      { firstName: 'Samantha', lastName: 'Waters', email: 'Samantha@123.com', password: 'freeg', role: 'ADMIN' },
      { firstName: 'Norberto', lastName: 'Considine', email: 'Norberto@123.com', password: ' dfdsv', role: 'USER' },
      { firstName: 'Zita', lastName: 'Hintz', email: 'Zita@123.com', password: 'bgfvfvfdbvg', role: 'ADMIN' },
      { firstName: 'Reggie', lastName: 'Kohler', email: 'Reggie@123.com', password: 'dfgbfggbg', role: 'USER' },
      { firstName: 'Albert', lastName: 'Moen', email: 'Albert@123.com', password: 'thtyuhy', role: 'ADMIN' },
      { firstName: 'Yazmin', lastName: 'Breitenberg', email: 'Yazmin@123.com', password: 'bfkndfhk', role: 'USER' },
      { firstName: 'Gerhard', lastName: 'Beer', email: 'Gerhard@123.com', password: 'dfvgdjfkndfhk', role: 'ADMIN' },
    ]);

    testSession = session(app);

    await testSession.post('/api/auth/login').send(
      { email: 'Alexandra@123.com', password: 'djfkndfhk' },
    );
  });

  it('returns users default to page 1 size 10', async () => {
    const res = await testSession.get('/api/users');

    assert.equal(res.status, StatusCodes.OK, `Did not get status OK: ${JSON.stringify(res, null, 2)}`);
    assert.equal(res.body.page, 1);
    assert.equal(res.body.size, 10);
    assert.equal(res.body.users.length, 10);
    assert.deepEqual(res.body.users, testUsers.slice(0, 10));
  });

  it('returns users in sorted acending on firstName', async () => {
    const res = await testSession.get('/api/users?sort=firstName&direction=ASC');
    assert.equal(res.status, StatusCodes.OK, `Did not get status OK: ${JSON.stringify(res, null, 2)}`);
    assert.equal(res.body.page, 1);
    assert.equal(res.body.size, 10);
    assert.equal(res.body.users.length, 10);
    const sortedUsers = testUsers.sort((a, b) => a.firstName > b.firstName? 1: -1);
    assert.deepEqual(res.body.users, sortedUsers.slice(0, 10));
  });

  it('returns users in sorted decending on lastName', async () => {
    const res = await testSession.get('/api/users?sort=lastName&direction=DESC');
    assert.equal(res.status, StatusCodes.OK, `Did not get status OK: ${JSON.stringify(res, null, 2)}`);
    assert.equal(res.body.page, 1);
    assert.equal(res.body.size, 10);
    assert.equal(res.body.users.length, 10);
    const sortedUsers = testUsers.sort((a, b) => a.lastName > b.lastName? -1: 1);
    assert.deepEqual(res.body.users, sortedUsers.slice(0, 10));
  });


  it('returns bad request when page is not a integer >= 1', () =>
    testSession
      .get('/api/users?page=-1')
      .then(res => {
        assert.equal(res.status, StatusCodes.BAD_REQUEST,
          `Did not get status BAD REQUEST: ${JSON.stringify(res, null, 2)}`);
        assert.deepEqual(res.body, ['Page must be greater than or equal to 1']);
      }));

  it('returns bad request when size is not a integer between 1 and 100', () =>
    testSession
      .get('/api/users?size=101')
      .then(res => {
        assert.equal(res.status, StatusCodes.BAD_REQUEST,
          `Did not get status BAD REQUEST: ${JSON.stringify(res, null, 2)}`);
        assert.deepEqual(res.body, ['Size must be less than or equal to 100']);
      }));

  it('returns bad request when page and size are not integer', () =>
    testSession
      .get('/api/users?page=bad&size=break')
      .then(res => {
        assert.equal(res.status, StatusCodes.BAD_REQUEST,
          `Did not get status BAD REQUEST: ${JSON.stringify(res, null, 2)}`);
        assert.deepEqual(res.body, [
          'Page must be a valid number',
          'Size must be a valid number',
        ]);
      }));

  it('returns empty if past last page', () => {
    testSession
      .get('/api/users?page=1&size=10')
      .then(res => {
        assert.equal(res.status, StatusCodes.OK,
          `Did not get status OK: ${JSON.stringify(res, null, 2)}`);
        assert.equal(res.body.users.length, 0);
      });
  });

  it('returns bad request when passed invalid sort', () =>
    testSession
      .get('/api/users?sort=asdfg')
      .then(res => {
        assert.equal(res.status, StatusCodes.BAD_REQUEST,
          `Did not get status BAD REQUEST: ${JSON.stringify(res, null, 2)}`);
        assert.deepEqual(res.body, ['Sort Only allow FirstName, LastName or Id']);
      }));

  it('returns bad request when passed invalid direction', () =>
    testSession
      .get('/api/users?direction=asw')
      .then(res => {
        assert.equal(res.status, StatusCodes.BAD_REQUEST,
          `Did not get status BAD REQUEST: ${JSON.stringify(res, null, 2)}`);
        assert.deepEqual(res.body, ['Direction Only allow ASC or DESC']);
      }));
});

describe('POST /api/users', () => {
  let app = null;
  let testDB = null;
  let testSession = null;

  before(async () => {
    app = getTestApp();
    testDB = getTestDB(config);
    await cleanData(testDB);
    testSession = session(app);
    await addUsers(testDB, [
      { firstName: 'Alexandra', lastName: 'McGlynn', email: 'Alexandra@123.com', password: 'djfkndfhk', role: 'ADMIN' },
      { firstName: 'Joanie', lastName: 'Miller', email: 'Joanie@123.com', password: 'dssdcdsfggrt', role: 'USER' },
    ]);

    testSession = session(app);

    await testSession.post('/api/auth/login').send(
      { email: 'Alexandra@123.com', password: 'djfkndfhk' },
    );
  });

  it('returns user with id', async () => {
    const res = await testSession.post('/api/users').send(
      { firstName: 'Kiana', lastName: 'Cummerata', email: 'Kiana@123.com', password: 'djfkndf!@hk', role: 'ADMIN' },
    );
    assert.equal(res.status, StatusCodes.OK, `Did not get status OK: ${JSON.stringify(res, null, 2)}`);
    assert.isNumber(res.body.id);
    assert.equal(res.body.firstName, 'Kiana');
    assert.equal(res.body.lastName, 'Cummerata');
    assert.equal(res.body.role, 'ADMIN');
  });

  it('returns bad request when firstName, lastName or password not passed', async () => {
    const res = await testSession.post('/api/users').send({});
    assert.equal(res.status, StatusCodes.BAD_REQUEST,
      `Did not get status BAD REQUEST: ${JSON.stringify(res, null, 2)}`);
    assert.deepEqual(
      res.body,
      [
        'First name can\'t be blank',
        'Last name can\'t be blank',
        'Password can\'t be blank',
      ]);
  });

  it('returns bad request when firstName, lastName or password is too long', async () => {
    const res = await testSession.post('/api/users').send({
      firstName: 'johnsdsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
      lastName: 'Smithsdsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
      password: 'Password can\'t to long sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
      role: 'ASSSDDFRG',

    });
    assert.equal(res.status, StatusCodes.BAD_REQUEST,
      `Did not get status BAD REQUEST: ${JSON.stringify(res, null, 2)}`);
    assert.deepEqual(
      res.body,
      [
        'First name is too long (maximum is 50 characters)',
        'Last name is too long (maximum is 50 characters)',
        'Password is too long (maximum is 50 characters)',
        'Role can either ADMIN or USER',
      ],
    );
  });
});

describe('POST /api/auth', () => {
  let app = null;
  let testDB = null;
  let testSession = null;
  before(async () => {
    app = getTestApp();
    testSession = session(app);
    testDB = getTestDB(config);
    await cleanData(testDB);
    await addUsers(testDB, [
      { firstName: 'Alexandra', lastName: 'McGlynn', email: 'Alexandra@123.com', password: 'djfkndfhk', role: 'ADMIN' },
      { firstName: 'Joanie', lastName: 'Miller', email: 'Joanie@123.com', password: 'dssdcdsfggrt', role: 'USER' },
    ]);
  });

  it('user should able to login', async () => {
    const res = await testSession.post('/api/auth/login').send(
      { email: 'Alexandra@123.com', password: 'djfkndfhk' },
    );
    assert.equal(res.status, StatusCodes.OK, `Did not get status OK: ${JSON.stringify(res, null, 2)}`);
    assert.deepEqual(res.body, { status: 'success' });
  });

  it('user should able to logout', async () => {
    const res = await testSession.post('/api/auth/logout').send(
      {},
    );
    assert.equal(res.status, StatusCodes.OK, `Did not get status OK: ${JSON.stringify(res, null, 2)}`);
    assert.deepEqual(res.body, { status: 'success' });
  });
});
