'use strict';

const { pgp } = require('../db/pg-client');


// id SERIAL PRIMARY KEY NOT NULL,
// email VARCHAR NOT NULL,
// first_name VARCHAR NOT NULL,
// last_name VARCHAR NOT NULL,
// password VARCHAR NOT NULL,
// user_role INTEGER NOT NULL REFERENCES roles(id)

function fetchUsersPage(db, offset, limit, sort='id', direction='ASC') {
  const text = pgp.as.format(`
    SELECT
      u.id,
      u.first_name as "firstName",
      u.last_name as "lastName",
      u.email as "email",
      u.user_role as "role"
    FROM users u
    ORDER BY u.$/sort:name/ $/direction:value/
    LIMIT $[limit] OFFSET $[offset]
    `,
  { offset, limit, sort, direction },
  );
  const name = 'fetch-users-ordered-by-' + sort + '-' + direction; // unique query name
  return db.any({ name, text });
}

function insertUser(db, firstName, lastName, email, password, role) {
  const insertStatement = `
  ${pgp.helpers.insert(
    { first_name: firstName, last_name: lastName, email, password, user_role: role },
    ['first_name', 'last_name', 'email', 'password', 'user_role'],
    'users',
  )}
  RETURNING id, first_name AS "firstName", last_name AS "lastName", email, user_role AS "role"
  `;
  return db.one(insertStatement);
}


const updateUserByIdSql = `
UPDATE users
SET
  first_name = $[firstName],
  last_name = $[lastName],
  email = $[email],
  password = $[password],
  user_role = $[role]
WHERE id = $[id]
RETURNING id, first_name AS "firstName", last_name AS "lastName", email, user_role AS "role";
`;

function updateUserById(db, id, firstName, lastName, email, password, role) {
  return db.any(updateUserByIdSql, { id, firstName, lastName, email, password, role });
}

const fetchUserByIdSql = `
SELECT
  u.id,
  u.first_name as "firstName",
  u.last_name as "lastName",
  u.email as "email",
  u.user_role as "role"
FROM users u
WHERE id = $[userId]
`;

function getUserById(db, userId) {
  return db.one(fetchUserByIdSql, { userId });
}

const fetchAuthDetails = `
SELECT
  u.id,
  u.first_name as "firstName",
  u.last_name as "lastName",
  u.email as "email",
  u.user_role as "role",
  u.password as "password"
FROM users u
WHERE u.email = $[emailId]
`;

function getUserByEmail(db, emailId) {
  return db.one(fetchAuthDetails, { emailId });
}

module.exports = {
  fetchUsersPage,
  getUserById,
  insertUser,
  getUserByEmail,
  updateUserById,
};
