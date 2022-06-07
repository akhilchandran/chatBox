'use strict';
const validate = require('validate.js');
const { StatusCodes } = require('http-status-codes');
const { getUserPage, getUserById, insertUser, updateUserById } = require('../managers/users');

const pagingQueryConstraints = {
  page: {
    type: 'string',
    numericality: {
      strict: true,
      onlyInteger: true,
      greaterThanOrEqualTo: 1,
    },
  },
  size: {
    type: 'string',
    numericality: {
      strict: true,
      onlyInteger: true,
      greaterThanOrEqualTo: 1,
      lessThanOrEqualTo: 100,
    },
  },
  sort: {
    inclusion: {
      within: ['firstName', 'lastName', 'id'],
      message: 'Only allow FirstName, LastName or Id',
    },
  },
  direction: {
    inclusion: {
      within: ['ASC', 'DESC'],
      message: 'Only allow ASC or DESC',
    },
  },
};

const createUserConstraints = {
  email: {
    email: true,
  },
  firstName: {
    type: 'string',
    presence: true,
    length: {
      maximum: 50,
    },
  },
  lastName: {
    type: 'string',
    presence: true,
    length: {
      maximum: 50,
    },
  },
  password: {
    type: 'string',
    presence: true,
    length: {
      minimum: 5,
      maximum: 50,
    },
  },
  role: {
    type: 'string',
    inclusion: {
      within: ['ADMIN', 'USER'],
      message: 'can either ADMIN or USER',
    },
  },
};

const updateUserConstraints = {
  id: {
    type: 'number',
    numericality: {
      strict: true,
      onlyInteger: true,
      greaterThanOrEqualTo: 1,
    },
  },
  email: {
    email: true,
  },
  firstName: {
    type: 'string',
    presence: true,
    length: {
      maximum: 50,
    },
  },
  lastName: {
    type: 'string',
    presence: true,
    length: {
      maximum: 50,
    },
  },
  password: {
    type: 'string',
    presence: true,
    length: {
      minimum: 5,
      maximum: 50,
    },
  },
  user_role: {
    type: 'number',
    numericality: {
      strict: true,
      onlyInteger: true,
      greaterThanOrEqualTo: 1,
    },
  },
};


module.exports = function userController(context) {
  const listUsers = async (req, res) => {
    try {
      const validationResults = validate(req.query, pagingQueryConstraints, { format: 'flat' });
      if (validationResults) {
        return res.status(StatusCodes.BAD_REQUEST).json(validationResults);
      }
      let page = parseInt(req.query.page, 10);
      if (isNaN(page)) {
        page = 1;
      }
      let size = parseInt(req.query.size, 10);
      if (isNaN(size)) {
        size = 10;
      }
      let sort = 'id';
      switch (req.query.sort) {
      case 'firstName':
        sort = 'first_name';
        break;
      case 'lastName':
        sort = 'last_name';
        break;
      }
      let direction = req.query.direction;
      if (!req.query.direction) {
        direction = 'ASC';
      }
      const data = await getUserPage(context.db, page, size, sort, direction);
      res.json(data);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.stack });
    }
  };

  const getUser = async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const validationResults = validate(req.query, pagingQueryConstraints, { format: 'flat' });
      if (validationResults) {
        return res.status(StatusCodes.BAD_REQUEST).json(validationResults);
      }
      const data = await getUserById(context.db, userId);
      res.json(data);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.stack });
    }
  };

  const createUser = async (req, res) => {
    try {
      const validationResults = validate(req.body, createUserConstraints, { format: 'flat' });
      if (validationResults) {
        return res.status(StatusCodes.BAD_REQUEST).json(validationResults);
      }
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const email = req.body.email;
      const role = req.body.role;
      const password = req.body.password;
      const data = await insertUser(context.db, firstName, lastName, email, password, role);
      res.json(data);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.stack });
    }
  };

  const updateUser = async (req, res) => {
    try {
      const validationResults = validate(req.body, updateUserConstraints, { format: 'flat' });
      if (validationResults) {
        return res.status(StatusCodes.BAD_REQUEST).json(validationResults);
      }
      const id = req.body.id;
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const email = req.body.email;
      const role = req.body.role;
      const password = req.body.password;
      const data = await updateUserById(context.db, id, firstName, lastName, email, password, role);
      res.json(data);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.stack });
    }
  };

  return {
    listUsers,
    getUser,
    createUser,
    updateUser,
  };
};


