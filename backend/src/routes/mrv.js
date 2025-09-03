const express = require('express');
const { body, param } = require('express-validator');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  getMRVReports,
  createMRVReport,
  submitMRVReport,
  verifyMRVReport
} = require('../controllers/mrvController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const mrvReportValidation = [
  body('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  body('reportType')
    .isIn(['baseline', 'monitoring', 'verification', 'final'])
    .withMessage('Invalid report type'),
  body('reportingPeriod')
    .isObject()
    .withMessage('Reporting period must be an object'),
  body('data')
    .isObject()
    .withMessage('Data must be an object')
];

const verificationValidation = [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be approved or rejected'),
  body('verificationNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Verification notes must be less than 1000 characters')
];

const idValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid report ID')
];

// Routes
router.get('/reports', getMRVReports);
router.post('/reports', authorize('ngo', 'researcher', 'admin'), mrvReportValidation, validateRequest, createMRVReport);
router.post('/reports/:id/submit', authorize('ngo', 'researcher', 'admin'), idValidation, validateRequest, submitMRVReport);
router.post('/reports/:id/verify', authorize('government', 'admin'), idValidation, verificationValidation, validateRequest, verifyMRVReport);

module.exports = router;

