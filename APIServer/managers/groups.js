'use strict';

const { fetchUsersPage, getUserById, insertUser, getUserByEmail } = require('../models/users');

async function getUserPage(db, page, size, sort, direction) {
  const usersPage = await fetchUsersPage(db, (page - 1) * size, size, sort, direction);
  return {
    page,
    size,
    users: usersPage,
  };
}


module.exports = {
  getUserPage,
  getUserById,
  insertUser,
  getUserByEmail,
};
