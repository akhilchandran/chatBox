-- CREATE TABLE IF NOT EXISTS roles (
--   id SERIAL PRIMARY KEY NOT NULL,
--   role_name VARCHAR NOT NULL,
--   role_type VARCHAR NOT NULL
-- );

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  user_role VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS measage_groups (
  id SERIAL PRIMARY KEY NOT NULL,
  group_name VARCHAR NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS group_users (
  id SERIAL PRIMARY KEY NOT NULL,
  group_id INTEGER NOT NULL REFERENCES measage_groups(id),
  member_id INTEGER NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS group_messages (
  id SERIAL PRIMARY KEY NOT NULL,
  group_id INTEGER NOT NULL REFERENCES measage_groups(id),
  meassedby_id INTEGER NOT NULL REFERENCES users(id),
  message VARCHAR NOT NULL
);

CREATE INDEX IF NOT EXISTS group_users_member_idx ON group_users(member_id);
-- INSERT INTO roles(role_name,role_type) VALUES('ADMIN','USER');
-- INSERT INTO roles(role_name,role_type) VALUES('USER','USER');
-- INSERT INTO users 
--  (SELECT
--   'superadmin@admin.com' as email,
--   'super' as first_name,
--   'admin' as last_name,
--   't4ere3as@31n' as password,
--   roles.id as user_role
--     FROM roles R
--    WHERE R.role_name = 'ADMIN');