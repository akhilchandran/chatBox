'use strict';
const validate = require('validate.js');
const { StatusCodes } = require('http-status-codes');
const { getGroupPage, getGroupById, insertGroup, updateGroupById } = require('../managers/groups');

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
      within: ['groupName', 'id'],
      message: 'Only allow groupName or id',
    },
  },
  direction: {
    inclusion: {
      within: ['ASC', 'DESC'],
      message: 'Only allow ASC or DESC',
    },
  },
};

const createGroupConstraints = {
  groupName: {
    type: 'string',
    presence: true,
    length: {
      maximum: 50,
    },
  },
};

const updateGroupConstraints = {
  id: {
    type: 'number',
    numericality: {
      strict: true,
      onlyInteger: true,
      greaterThanOrEqualTo: 1,
    },
  },
  groupName: {
    type: 'string',
    presence: true,
    length: {
      maximum: 50,
    },
  },
};

const getGroupConstraints = {
  id: {
    type: 'string',
    numericality: {
      strict: true,
      onlyInteger: true,
      greaterThanOrEqualTo: 1,
    },
  },
};


module.exports = function groupController(context) {
  const listGroups = async (req, res) => {
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
      case 'groupName':
        sort = 'group_name';
        break;
      }
      let direction = req.query.direction;
      if (!req.query.direction) {
        direction = 'ASC';
      }
      const data = await getGroupPage(context.db, page, size, sort, direction);
      res.json(data);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.stack });
    }
  };

  const getGroup = async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId, 10);
      const validationResults = validate(req.params, getGroupConstraints, { format: 'flat' });
      if (validationResults) {
        return res.status(StatusCodes.BAD_REQUEST).json(validationResults);
      }
      const data = await getGroupById(context.db, groupId);
      res.json(data);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.stack });
    }
  };

  const createGroup = async (req, res) => {
    try {
      const validationResults = validate(req.body, createGroupConstraints, { format: 'flat' });
      if (validationResults) {
        return res.status(StatusCodes.BAD_REQUEST).json(validationResults);
      }
      const groupName = req.body.groupName;
      const userId = req.session.user.id;
      const data = await insertGroup(context.db, groupName, userId);
      res.json(data);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.stack });
    }
  };

  const updateGroup = async (req, res) => {
    try {
      const validationResults = validate(req.body, updateGroupConstraints, { format: 'flat' });
      if (validationResults) {
        return res.status(StatusCodes.BAD_REQUEST).json(validationResults);
      }
      const id = req.body.id;
      const groupName = req.body.groupName;
      const userId = req.session.user.id;
      const data = await updateGroupById(context.db, id, groupName, userId);
      res.json(data);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.stack });
    }
  };

  return {
    listGroups,
    getGroup,
    createGroup,
    updateGroup,
  };
};


