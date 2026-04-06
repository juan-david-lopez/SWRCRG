'use strict';

const { createReport, getAllReports, getReportById, updateReportStatus } = require('../models/report.model');

const create = async ({ title, description, latitude, longitude, image_url, user_id }) => {
  return createReport({ title, description, latitude, longitude, image_url, user_id });
};

const getAll = async () => {
  return getAllReports();
};

const getById = async (id) => {
  return getReportById(id);
};

const updateStatus = async (id, status) => {
  return updateReportStatus(id, status);
};

module.exports = { create, getAll, getById, updateStatus };
