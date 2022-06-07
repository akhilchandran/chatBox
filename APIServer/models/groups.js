'use strict';

const { pgp } = require('../db/pg-client');

function fetchGroupsPage(db, offset, limit, sort='id', direction='ASC') {
  const text = pgp.as.format(`
    SELECT
      u.id,
      u.group_name as "groupName",
      u.created_by as "createdUserId",
    FROM groups u
    ORDER BY u.$/sort:name/ $/direction:value/
    LIMIT $[limit] OFFSET $[offset]
    `,
  { offset, limit, sort, direction },
  );
  const name = 'fetch-groups-ordered-by-' + sort + '-' + direction; // unique query name
  return db.any({ name, text });
}

function insertGroup(db, groupName, userId) {
  const insertStatement = `
  ${pgp.helpers.insert(
    { group_name: groupName, created_by: userId },
    ['group_name', 'created_by'],
    'groups',
  )}
  RETURNING id, group_name AS "groupName", created_by AS "createdUserId"
  `;
  return db.one(insertStatement);
}


const updateGroupByIdSql = `
UPDATE groups
SET
  group_name = $[groupName],
WHERE id = $[id]
RETURNING id, group_name AS "groupName", created_by AS "createdUserId";
`;

function updateGroupById(db, id, groupName) {
  return db.any(updateGroupByIdSql, { id, groupName });
}

const fetchGroupByIdSql = `
SELECT
  u.id,
  u.group_name as "groupName",
  u.created_by as "createdUserId"
FROM groups u
WHERE id = $[id]
`;

function getGroupById(db, id) {
  return db.one(fetchGroupByIdSql, { id });
}

module.exports = {
  fetchGroupsPage,
  getGroupById,
  insertGroup,
  updateGroupById,
};
