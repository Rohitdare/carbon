const express = require('express');
const { body, param } = require('express-validator');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  getProfile,
  updateProfile,
  getUsers,
  verifyUser
} = require('../controllers/userController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const profileUpdateValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organization name must be less than 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const idValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID')
];

// Routes
router.get('/profile', getProfile);
router.put('/profile', profileUpdateValidation, validateRequest, updateProfile);
router.get('/', authorize('admin'), getUsers);
router.post('/:id/verify', authorize('admin'), idValidation, validateRequest, verifyUser);

module.exports = router;

