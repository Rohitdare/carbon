const { db } = require('../config/database');
const { logger } = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - ecosystemType
 *         - boundary
 *         - areaHectares
 *         - startDate
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         ecosystemType:
 *           type: string
 *           enum: [mangrove, seagrass, salt_marsh, tidal_wetland]
 *         status:
 *           type: string
 *           enum: [planning, active, monitoring, completed, cancelled]
 *         boundary:
 *           type: object
 *           description: GeoJSON geometry
 *         areaHectares:
 *           type: number
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: ecosystemType
 *         schema:
 *           type: string
 *           enum: [mangrove, seagrass, salt_marsh, tidal_wetland]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, monitoring, completed, cancelled]
 *     responses:
 *       200:
 *         description: List of projects
 */
const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      ecosystemType,
      status,
      ownerId
    } = req.query;

    const offset = (page - 1) * limit;
    let query = db('projects')
      .select(
        'projects.*',
        'users.first_name as owner_first_name',
        'users.last_name as owner_last_name',
        'users.organization as owner_organization'
      )
      .leftJoin('users', 'projects.owner_id', 'users.id');

    // Apply filters
    if (ecosystemType) {
      query = query.where('projects.ecosystem_type', ecosystemType);
    }
    if (status) {
      query = query.where('projects.status', status);
    }
    if (ownerId) {
      query = query.where('projects.owner_id', ownerId);
    }

    // Role-based filtering
    if (req.user.role === 'ngo' || req.user.role === 'researcher') {
      query = query.where('projects.owner_id', req.user.id);
    }

    const [projects, totalCount] = await Promise.all([
      query.clone().limit(limit).offset(offset),
      query.clone().count('* as count').first()
    ]);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(totalCount.count),
          pages: Math.ceil(totalCount.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created successfully
 */
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      ecosystemType,
      boundary,
      areaHectares,
      startDate,
      endDate,
      metadata
    } = req.body;

    const [project] = await db('projects')
      .insert({
        name,
        description,
        ecosystem_type: ecosystemType,
        boundary: db.raw('ST_GeomFromGeoJSON(?)', [JSON.stringify(boundary)]),
        area_hectares: areaHectares,
        start_date: startDate,
        end_date: endDate,
        owner_id: req.user.id,
        metadata: metadata ? JSON.stringify(metadata) : null
      })
      .returning('*');

    logger.info(`New project created: ${name} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
};

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
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
 *         description: Project details
 *       404:
 *         description: Project not found
 */
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await db('projects')
      .select(
        'projects.*',
        'users.first_name as owner_first_name',
        'users.last_name as owner_last_name',
        'users.organization as owner_organization'
      )
      .leftJoin('users', 'projects.owner_id', 'users.id')
      .where('projects.id', id)
      .first();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (req.user.role === 'ngo' || req.user.role === 'researcher') {
      if (project.owner_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Get project statistics
    const stats = await db('carbon_credits')
      .where('project_id', id)
      .select(
        db.raw('COUNT(*) as total_credits'),
        db.raw('SUM(amount_tonnes_co2) as total_co2'),
        db.raw('COUNT(CASE WHEN status = \'verified\' THEN 1 END) as verified_credits')
      )
      .first();

    res.json({
      success: true,
      data: {
        project,
        statistics: stats
      }
    });
  } catch (error) {
    logger.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
};

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
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
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated successfully
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if project exists and user has permission
    const existingProject = await db('projects')
      .where({ id })
      .first();

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (req.user.role === 'ngo' || req.user.role === 'researcher') {
      if (existingProject.owner_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Prepare update data
    const updateFields = {};
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.ecosystemType) updateFields.ecosystem_type = updateData.ecosystemType;
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.areaHectares) updateFields.area_hectares = updateData.areaHectares;
    if (updateData.startDate) updateFields.start_date = updateData.startDate;
    if (updateData.endDate) updateFields.end_date = updateData.endDate;
    if (updateData.metadata) updateFields.metadata = JSON.stringify(updateData.metadata);

    if (updateData.boundary) {
      updateFields.boundary = db.raw('ST_GeomFromGeoJSON(?)', [JSON.stringify(updateData.boundary)]);
    }

    const [updatedProject] = await db('projects')
      .where({ id })
      .update(updateFields)
      .returning('*');

    logger.info(`Project updated: ${id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });
  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject
};

