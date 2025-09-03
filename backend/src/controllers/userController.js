const { db } = require('../config/database');
const { logger } = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 */
const getProfile = async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'organization', 'phone', 'is_verified', 'created_at', 'last_login')
      .where({ id: req.user.id })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               organization:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, organization, phone } = req.body;

    const updateFields = {};
    if (firstName) updateFields.first_name = firstName;
    if (lastName) updateFields.last_name = lastName;
    if (organization !== undefined) updateFields.organization = organization;
    if (phone !== undefined) updateFields.phone = phone;

    const [updatedUser] = await db('users')
      .where({ id: req.user.id })
      .update(updateFields)
      .returning(['id', 'email', 'first_name', 'last_name', 'role', 'organization', 'phone', 'is_verified']);

    logger.info(`User profile updated: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [government, ngo, researcher, field_worker, market_player, admin]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of users
 */
const getUsers = async (req, res) => {
  try {
    const {
      role,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    let query = db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'organization', 'is_verified', 'is_active', 'created_at', 'last_login')
      .where('is_active', true);

    // Apply filters
    if (role) {
      query = query.where('role', role);
    }

    const [users, totalCount] = await Promise.all([
      query.clone().limit(limit).offset(offset).orderBy('created_at', 'desc'),
      query.clone().count('* as count').first()
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(totalCount.count),
          pages: Math.ceil(totalCount.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

/**
 * @swagger
 * /api/v1/users/{id}/verify:
 *   post:
 *     summary: Verify user account (admin only)
 *     tags: [Users]
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
 *         description: User verified successfully
 */
const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db('users')
      .where({ id })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const [updatedUser] = await db('users')
      .where({ id })
      .update({ is_verified: true })
      .returning(['id', 'email', 'first_name', 'last_name', 'role', 'is_verified']);

    logger.info(`User verified: ${id} by admin ${req.user.id}`);

    res.json({
      success: true,
      message: 'User verified successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    logger.error('Error verifying user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify user'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  verifyUser
};

