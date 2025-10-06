const Report = require('../models/Report');
const { asyncHandler } = require('../middleware/errorHandler');

class ReportsController {
  // Create a new report
  static createReport = asyncHandler(async (req, res) => {
    const { crimeType, victimNumber, description, placeId, reportType, userId } = req.body;

    if (!crimeType || !description || !placeId || !reportType || !userId) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const report = await Report.create({
      crimeType,
      victimNumber,
      description,
      placeId,
      reportType,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report: {
        id: report.id,
        crimeType: report.crimeType,
        description: report.description,
        placeId: report.placeId,
        reportType: report.reportType,
        status: report.status
      }
    });
  });

  // Get all reports (admin)
  static getAllReports = asyncHandler(async (req, res) => {
    const { status, reportType, crimeType, page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const filters = { status, reportType, crimeType };

    const reports = await Report.findAll(filters, parseInt(limit), offset);

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: reports.length
      }
    });
  });

  // Get report by ID
  static getReportById = asyncHandler(async (req, res) => {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      report
    });
  });

  // Update report status
  static updateReportStatus = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    await Report.updateStatus(reportId, status);

    res.json({
      success: true,
      message: 'Report status updated successfully'
    });
  });

  // Get user's reports
  static getUserReports = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const reports = await Report.getByUser(userId, parseInt(limit), offset);

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: reports.length
      }
    });
  });

  // Delete report
  static deleteReport = asyncHandler(async (req, res) => {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.delete();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  });
}

module.exports = ReportsController;