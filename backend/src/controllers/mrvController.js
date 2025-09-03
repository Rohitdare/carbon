const { db } = require('../config/database');
const { logger } = require('../utils/logger');
const { validationResult } = require('express-validator');
const axios = require('axios');

/**
 * @swagger
 * components:
 *   schemas:
 *     MRVReport:
 *       type: object
 *       required:
 *         - projectId
 *         - reportType
 *         - reportingPeriod
 *         - data
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         projectId:
 *           type: string
 *           format: uuid
 *         reportType:
 *           type: string
 *           enum: [baseline, monitoring, verification, final]
 *         reportingPeriod:
 *           type: object
 *         data:
 *           type: object
 *         status:
 *           type: string
 *           enum: [draft, submitted, under_review, approved, rejected]
 *         carbonEstimate:
 *           type: number
 *         verificationNotes:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/mrv/reports:
 *   get:
 *     summary: Get MRV reports
 *     tags: [MRV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [baseline, monitoring, verification, final]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, submitted, under_review, approved, rejected]
 *     responses:
 *       200:
 *         description: List of MRV reports
 */
const getMRVReports = async (req, res) => {
  try {
    const {
      projectId,
      reportType,
      status,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    let query = db('mrv_reports')
      .select(
        'mrv_reports.*',
        'projects.name as project_name',
        'users.first_name as submitter_first_name',
        'users.last_name as submitter_last_name'
      )
      .leftJoin('projects', 'mrv_reports.project_id', 'projects.id')
      .leftJoin('users', 'mrv_reports.submitted_by', 'users.id');

    // Apply filters
    if (projectId) {
      query = query.where('mrv_reports.project_id', projectId);
    }
    if (reportType) {
      query = query.where('mrv_reports.report_type', reportType);
    }
    if (status) {
      query = query.where('mrv_reports.status', status);
    }

    // Role-based filtering
    if (req.user.role === 'ngo' || req.user.role === 'researcher') {
      query = query.where('mrv_reports.submitted_by', req.user.id);
    }

    const [reports, totalCount] = await Promise.all([
      query.clone().limit(limit).offset(offset).orderBy('mrv_reports.created_at', 'desc'),
      query.clone().count('* as count').first()
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(totalCount.count),
          pages: Math.ceil(totalCount.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching MRV reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch MRV reports'
    });
  }
};

/**
 * @swagger
 * /api/v1/mrv/reports:
 *   post:
 *     summary: Create MRV report
 *     tags: [MRV]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MRVReport'
 *     responses:
 *       201:
 *         description: MRV report created successfully
 */
const createMRVReport = async (req, res) => {
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
      projectId,
      reportType,
      reportingPeriod,
      data,
      satelliteData,
      sensorData,
      fieldMeasurements
    } = req.body;

    // Verify project exists and user has access
    const project = await db('projects')
      .where({ id: projectId })
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

    // Call AI/ML service for carbon estimation
    let carbonEstimate = 0;
    try {
      const aiResponse = await axios.post(`${process.env.AI_ML_SERVICE_URL}/estimate-carbon`, {
        projectId,
        reportType,
        ecosystemType: project.ecosystem_type,
        areaHectares: project.area_hectares,
        satelliteData,
        sensorData,
        fieldMeasurements,
        reportingPeriod
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.AI_ML_API_KEY}`
        }
      });

      carbonEstimate = aiResponse.data.carbonEstimate;
    } catch (aiError) {
      logger.warn('AI/ML service unavailable, using default estimation:', aiError.message);
      // Fallback to basic estimation
      carbonEstimate = project.area_hectares * 10; // Basic estimation
    }

    const [report] = await db('mrv_reports')
      .insert({
        project_id: projectId,
        report_type: reportType,
        reporting_period: JSON.stringify(reportingPeriod),
        data: JSON.stringify(data),
        satellite_data: satelliteData ? JSON.stringify(satelliteData) : null,
        sensor_data: sensorData ? JSON.stringify(sensorData) : null,
        field_measurements: fieldMeasurements ? JSON.stringify(fieldMeasurements) : null,
        carbon_estimate: carbonEstimate,
        submitted_by: req.user.id,
        status: 'draft'
      })
      .returning('*');

    logger.info(`MRV report created: ${report.id} for project ${projectId}`);

    res.status(201).json({
      success: true,
      message: 'MRV report created successfully',
      data: { report }
    });
  } catch (error) {
    logger.error('Error creating MRV report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create MRV report'
    });
  }
};

/**
 * @swagger
 * /api/v1/mrv/reports/{id}/submit:
 *   post:
 *     summary: Submit MRV report for verification
 *     tags: [MRV]
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
 *         description: Report submitted successfully
 */
const submitMRVReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await db('mrv_reports')
      .where({ id })
      .first();

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'MRV report not found'
      });
    }

    // Check permissions
    if (req.user.role === 'ngo' || req.user.role === 'researcher') {
      if (report.submitted_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    if (report.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft reports can be submitted'
      });
    }

    const [updatedReport] = await db('mrv_reports')
      .where({ id })
      .update({
        status: 'submitted',
        submitted_at: new Date()
      })
      .returning('*');

    logger.info(`MRV report submitted: ${id}`);

    res.json({
      success: true,
      message: 'Report submitted for verification',
      data: { report: updatedReport }
    });
  } catch (error) {
    logger.error('Error submitting MRV report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report'
    });
  }
};

/**
 * @swagger
 * /api/v1/mrv/reports/{id}/verify:
 *   post:
 *     summary: Verify MRV report
 *     tags: [MRV]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               verificationNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report verification completed
 */
const verifyMRVReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verificationNotes } = req.body;

    const report = await db('mrv_reports')
      .where({ id })
      .first();

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'MRV report not found'
      });
    }

    if (report.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted reports can be verified'
      });
    }

    const [updatedReport] = await db('mrv_reports')
      .where({ id })
      .update({
        status,
        verification_notes: verificationNotes,
        verified_by: req.user.id,
        verified_at: new Date()
      })
      .returning('*');

    // If approved, create carbon credits
    if (status === 'approved') {
      await createCarbonCreditsFromReport(report);
    }

    logger.info(`MRV report verified: ${id} with status ${status}`);

    res.json({
      success: true,
      message: `Report ${status} successfully`,
      data: { report: updatedReport }
    });
  } catch (error) {
    logger.error('Error verifying MRV report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify report'
    });
  }
};

// Helper function to create carbon credits from approved report
const createCarbonCreditsFromReport = async (report) => {
  try {
    const creditId = `CC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await db('carbon_credits')
      .insert({
        project_id: report.project_id,
        credit_id: creditId,
        amount_tonnes_co2: report.carbon_estimate,
        status: 'verified',
        verification_standard: 'VCS',
        vintage_year: new Date().getFullYear(),
        issuance_date: new Date(),
        verifier_id: report.verified_by,
        verification_notes: report.verification_notes
      });

    logger.info(`Carbon credits created for report ${report.id}: ${creditId}`);
  } catch (error) {
    logger.error('Error creating carbon credits:', error);
  }
};

module.exports = {
  getMRVReports,
  createMRVReport,
  submitMRVReport,
  verifyMRVReport
};

