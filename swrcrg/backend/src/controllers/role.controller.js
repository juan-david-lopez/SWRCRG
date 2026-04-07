'use strict';

const { getAllRoles } = require('../models/role.model');

const listRoles = async (req, res) => {
  try {
    const roles = await getAllRoles();
    return res.status(200).json({ roles });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { listRoles };
