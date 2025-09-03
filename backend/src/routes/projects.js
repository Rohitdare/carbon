const express = require('express');
const { body, param } = require('express-validator');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject
} = require('../controllers/projectController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const projectValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Project name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('ecosystemType')
    .isIn(['mangrove', 'seagrass', 'salt_marsh', 'tidal_wetland'])
    .withMessage('Invalid ecosystem type'),
  body('boundary')
    .isObject()
    .withMessage('Boundary must be a valid GeoJSON geometry'),
  body('areaHectares')
    .isFloat({ min: 0.01 })
    .withMessage('Area must be a positive number'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

const updateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Project name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('ecosystemType')
    .optional()
    .isIn(['mangrove', 'seagrass', 'salt_marsh', 'tidal_wetland'])
    .withMessage('Invalid ecosystem type'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'monitoring', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('areaHectares')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Area must be a positive number'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

const idValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid project ID')
];

// Routes
router.get('/', getProjects);
router.post('/', authorize('ngo', 'researcher', 'admin'), projectValidation, validateRequest, createProject);
router.get('/:id', idValidation, validateRequest, getProjectById);
router.put('/:id', authorize('ngo', 'researcher', 'admin'), idValidation, updateValidation, validateRequest, updateProject);

module.exports = router;

