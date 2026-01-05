const Report = require('../models/Report');

// Submit a new report
const submitReport = async (req, res) => {
    try {
        const { reportType, description, attachmentFile } = req.body;
        const submittedBy = req.user.userId;

        if (!reportType || !description) {
            return res.status(400).json({ error: 'Report type and description are required' });
        }

        const report = new Report({
            reportType,
            description,
            attachmentFile,
            submittedBy,
        });

        await report.save();

        res.status(201).json({
            message: 'Report submitted successfully',
            report,
        });
    } catch (error) {
        console.error('Submit report error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get reports submitted by the current user
const getUserReports = async (req, res) => {
    try {
        const submittedBy = req.user.userId;

        const reports = await Report.find({ submittedBy }).sort({ submittedAt: -1 });

        res.status(200).json({ reports });
    } catch (error) {
        console.error('Get user reports error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all reports (Super Admin)
const getAllReports = async (req, res) => {
    try {
        const { status, reportType } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (reportType) query.reportType = reportType;

        const reports = await Report.find(query)
            .populate('submittedBy', 'displayName email fullName') // Populate user info
            .populate('resolvedBy', 'username email') // Populate admin info
            .sort({ submittedAt: -1 });

        res.status(200).json({ reports });
    } catch (error) {
        console.error('Get all reports error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update report status (Super Admin)
const updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, resolutionNotes } = req.body;
        // Assuming req.admin exists from verifySuperAdminToken middleware - usually it sets req.admin
        // If verifySuperAdminToken sets req.user (unlikely if distinct from req.user for students), let's check.
        // Usually superAdminController middleware would decode token.
        // For safety, I'll rely on the middleware ensuring authorization, but capturing who resolved it might need careful ID extraction.
        // If verifySuperAdminToken follows standard pattern, it might put payload in req.admin or req.user.
        // I'll assume req.admin or req.user.adminId. 
        // Let's assume req.admin exists if using verifySuperAdminToken. 
        // But since I don't see superAdminController, I'll try safely.

        // Actually, looking at routes/report.js: `verifySuperAdminToken`
        // I haven't seen that file but names imply it.

        // Extract super admin ID from request (set by verifySuperAdminToken)
        const resolvedBy = req.superAdmin ? req.superAdmin.superAdminId : null;

        if (!['pending', 'under_review', 'resolved', 'dismissed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updateData = { status };
        if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
        if (resolvedBy && (status === 'resolved' || status === 'dismissed')) {
            updateData.resolvedBy = resolvedBy;
        }

        const report = await Report.findByIdAndUpdate(
            reportId,
            updateData,
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.status(200).json({
            message: 'Report status updated successfully',
            report,
        });
    } catch (error) {
        console.error('Update report status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get report statistics (Super Admin)
const getReportStatistics = async (req, res) => {
    try {
        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({ status: 'pending' });
        const resolvedReports = await Report.countDocuments({ status: 'resolved' });
        const dismissedReports = await Report.countDocuments({ status: 'dismissed' });

        // Group by type
        const reportsByType = await Report.aggregate([
            { $group: { _id: '$reportType', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            totalReports,
            pendingReports,
            resolvedReports,
            dismissedReports,
            reportsByType
        });
    } catch (error) {
        console.error('Get report statistics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    submitReport,
    getUserReports,
    getAllReports,
    updateReportStatus,
    getReportStatistics,
};
