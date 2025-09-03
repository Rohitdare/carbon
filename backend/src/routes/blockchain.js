const express = require('express');
const { param } = require('express-validator');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  getCarbonCreditHistory,
  verifyCarbonCredit,
  getNetworkStatus
} = require('../controllers/blockchainController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const creditIdValidation = [
  param('creditId')
    .notEmpty()
    .withMessage('Credit ID is required')
];

// Routes
router.get('/network/status', getNetworkStatus);
router.get('/credits/:creditId/history', creditIdValidation, validateRequest, getCarbonCreditHistory);
router.get('/credits/:creditId/verify', creditIdValidation, validateRequest, verifyCarbonCredit);

module.exports = router;

