const express = require('express');
const { body, param } = require('express-validator');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  getCarbonCredits,
  issueCarbonCredits,
  transferCarbonCredits,
  retireCarbonCredits
} = require('../controllers/carbonCreditController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const transferValidation = [
  body('toUserId')
    .isUUID()
    .withMessage('Invalid recipient user ID'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const retirementValidation = [
  body('retirementReason')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Retirement reason must be between 5 and 200 characters'),
  body('retirementNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Retirement notes must be less than 500 characters')
];

const idValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid credit ID')
];

// Routes
router.get('/', getCarbonCredits);
router.post('/:id/issue', authorize('government', 'admin'), idValidation, validateRequest, issueCarbonCredits);
router.post('/:id/transfer', authorize('market_player', 'ngo', 'admin'), idValidation, transferValidation, validateRequest, transferCarbonCredits);
router.post('/:id/retire', authorize('market_player', 'ngo', 'admin'), idValidation, retirementValidation, validateRequest, retireCarbonCredits);

module.exports = router;

