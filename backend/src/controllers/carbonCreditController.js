const { db } = require('../config/database');
const { logger } = require('../utils/logger');
const { validationResult } = require('express-validator');
const { blockchainService } = require('../services/blockchainService');

/**
 * @swagger
 * components:
 *   schemas:
 *     CarbonCredit:
 *       type: object
 *       required:
 *         - projectId
 *         - amountTonnesCo2
 *         - verificationStandard
 *         - vintageYear
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         projectId:
 *           type: string
 *           format: uuid
 *         creditId:
 *           type: string
 *         amountTonnesCo2:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, verified, issued, retired, transferred]
 *         verificationStandard:
 *           type: string
 *           enum: [VCS, Gold_Standard, CAR, ACR]
 *         vintageYear:
 *           type: integer
 *         issuanceDate:
 *           type: string
 *           format: date
 *         blockchainTransactionHash:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/carbon-credits:
 *   get:
 *     summary: Get carbon credits
 *     tags: [Carbon Credits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, verified, issued, retired, transferred]
 *       - in: query
 *         name: vintageYear
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of carbon credits
 */
const getCarbonCredits = async (req, res) => {
  try {
    const {
      projectId,
      status,
      vintageYear,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    let query = db('carbon_credits')
      .select(
        'carbon_credits.*',
        'projects.name as project_name',
        'projects.ecosystem_type',
        'users.first_name as verifier_first_name',
        'users.last_name as verifier_last_name'
      )
      .leftJoin('projects', 'carbon_credits.project_id', 'projects.id')
      .leftJoin('users', 'carbon_credits.verifier_id', 'users.id');

    // Apply filters
    if (projectId) {
      query = query.where('carbon_credits.project_id', projectId);
    }
    if (status) {
      query = query.where('carbon_credits.status', status);
    }
    if (vintageYear) {
      query = query.where('carbon_credits.vintage_year', vintageYear);
    }

    // Role-based filtering
    if (req.user.role === 'ngo' || req.user.role === 'researcher') {
      query = query.where('projects.owner_id', req.user.id);
    }

    const [credits, totalCount] = await Promise.all([
      query.clone().limit(limit).offset(offset).orderBy('carbon_credits.created_at', 'desc'),
      query.clone().count('* as count').first()
    ]);

    res.json({
      success: true,
      data: {
        credits,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(totalCount.count),
          pages: Math.ceil(totalCount.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching carbon credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch carbon credits'
    });
  }
};

/**
 * @swagger
 * /api/v1/carbon-credits/{id}/issue:
 *   post:
 *     summary: Issue carbon credits on blockchain
 *     tags: [Carbon Credits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Carbon credits issued successfully
 */
const issueCarbonCredits = async (req, res) => {
  try {
    const { id } = req.params;

    const credit = await db('carbon_credits')
      .where({ id })
      .first();

    if (!credit) {
      return res.status(404).json({
        success: false,
        message: 'Carbon credit not found'
      });
    }

    if (credit.status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Only verified credits can be issued'
      });
    }

    // Issue on blockchain
    const blockchainResult = await blockchainService.issueCarbonCredit({
      creditId: credit.credit_id,
      projectId: credit.project_id,
      amount: credit.amount_tonnes_co2,
      vintageYear: credit.vintage_year,
      verificationStandard: credit.verification_standard
    });

    // Update credit status
    const [updatedCredit] = await db('carbon_credits')
      .where({ id })
      .update({
        status: 'issued',
        issuance_date: new Date(),
        blockchain_transaction_hash: blockchainResult.transactionHash
      })
      .returning('*');

    logger.info(`Carbon credits issued: ${credit.credit_id} on blockchain`);

    res.json({
      success: true,
      message: 'Carbon credits issued successfully',
      data: {
        credit: updatedCredit,
        blockchainTransaction: blockchainResult
      }
    });
  } catch (error) {
    logger.error('Error issuing carbon credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue carbon credits'
    });
  }
};

/**
 * @swagger
 * /api/v1/carbon-credits/{id}/transfer:
 *   post:
 *     summary: Transfer carbon credits
 *     tags: [Carbon Credits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toUserId
 *               - amount
 *             properties:
 *               toUserId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Carbon credits transferred successfully
 */
const transferCarbonCredits = async (req, res) => {
  try {
    const { id } = req.params;
    const { toUserId, amount, notes } = req.body;

    const credit = await db('carbon_credits')
      .where({ id })
      .first();

    if (!credit) {
      return res.status(404).json({
        success: false,
        message: 'Carbon credit not found'
      });
    }

    if (credit.status !== 'issued') {
      return res.status(400).json({
        success: false,
        message: 'Only issued credits can be transferred'
      });
    }

    if (amount > credit.amount_tonnes_co2) {
      return res.status(400).json({
        success: false,
        message: 'Transfer amount exceeds available credits'
      });
    }

    // Verify recipient exists
    const recipient = await db('users')
      .where({ id: toUserId })
      .first();

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Transfer on blockchain
    const blockchainResult = await blockchainService.transferCarbonCredit({
      creditId: credit.credit_id,
      fromUserId: req.user.id,
      toUserId,
      amount,
      notes
    });

    // Update credit status
    const [updatedCredit] = await db('carbon_credits')
      .where({ id })
      .update({
        status: 'transferred',
        metadata: JSON.stringify({
          ...JSON.parse(credit.metadata || '{}'),
          transfer: {
            toUserId,
            amount,
            notes,
            transferredAt: new Date(),
            blockchainTransactionHash: blockchainResult.transactionHash
          }
        })
      })
      .returning('*');

    logger.info(`Carbon credits transferred: ${credit.credit_id} to user ${toUserId}`);

    res.json({
      success: true,
      message: 'Carbon credits transferred successfully',
      data: {
        credit: updatedCredit,
        blockchainTransaction: blockchainResult
      }
    });
  } catch (error) {
    logger.error('Error transferring carbon credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transfer carbon credits'
    });
  }
};

/**
 * @swagger
 * /api/v1/carbon-credits/{id}/retire:
 *   post:
 *     summary: Retire carbon credits
 *     tags: [Carbon Credits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - retirementReason
 *             properties:
 *               retirementReason:
 *                 type: string
 *               retirementNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Carbon credits retired successfully
 */
const retireCarbonCredits = async (req, res) => {
  try {
    const { id } = req.params;
    const { retirementReason, retirementNotes } = req.body;

    const credit = await db('carbon_credits')
      .where({ id })
      .first();

    if (!credit) {
      return res.status(404).json({
        success: false,
        message: 'Carbon credit not found'
      });
    }

    if (credit.status !== 'issued') {
      return res.status(400).json({
        success: false,
        message: 'Only issued credits can be retired'
      });
    }

    // Retire on blockchain
    const blockchainResult = await blockchainService.retireCarbonCredit({
      creditId: credit.credit_id,
      userId: req.user.id,
      retirementReason,
      retirementNotes
    });

    // Update credit status
    const [updatedCredit] = await db('carbon_credits')
      .where({ id })
      .update({
        status: 'retired',
        metadata: JSON.stringify({
          ...JSON.parse(credit.metadata || '{}'),
          retirement: {
            reason: retirementReason,
            notes: retirementNotes,
            retiredAt: new Date(),
            retiredBy: req.user.id,
            blockchainTransactionHash: blockchainResult.transactionHash
          }
        })
      })
      .returning('*');

    logger.info(`Carbon credits retired: ${credit.credit_id}`);

    res.json({
      success: true,
      message: 'Carbon credits retired successfully',
      data: {
        credit: updatedCredit,
        blockchainTransaction: blockchainResult
      }
    });
  } catch (error) {
    logger.error('Error retiring carbon credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retire carbon credits'
    });
  }
};

module.exports = {
  getCarbonCredits,
  issueCarbonCredits,
  transferCarbonCredits,
  retireCarbonCredits
};

