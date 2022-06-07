'use strict';

const { pgp } = require('../APIServer/db/pg-client');

const tableToDeleteInOrder = [
  { name: 'users', query: 'DELETE FROM users' },
];

const queryCount = tableToDeleteInOrder.length;

async function cleanData(db) {
  for (let i = 0; i < queryCount; i++) {
    const { name, query } = tableToDeleteInOrder[i];
    try {
      await db.query(query);
    } catch (error) {
      throw new Error(`Failed to delete ${name}: ${error.stack}`);
    }
  }
}

function addUsers(db, users) {
  const values = users.map(user => ({
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    password: user.password,
    user_role: user.role,
  }));
  const insertStatement = `${pgp.helpers.insert(
    values,
    ['first_name', 'last_name', 'email', 'password', 'user_role'], 'users')} ` +
    'RETURNING id, first_name AS "firstName", last_name AS "lastName", email, user_role AS "role"';
  return db.many(insertStatement).catch(error => {
    throw new Error(`Failed inserting users: ${error.stack}`);
  });
}

function addFriends(db, userId, friendIds) {
  const values = friendIds.map(friendId => ({ user_id: userId, friend_user_id: friendId }));
  const insertStatement = pgp.helpers.insert(values, ['user_id', 'friend_user_id'], 'friends');
  return db.any(insertStatement).catch(error => {
    throw new Error(`Failed inserting friends: ${error.stack}`);
  });
}

module.exports = {
  cleanData,
  addUsers,
  addFriends,
};
