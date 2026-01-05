const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');

// Apply for a job
const applyForJob = async (req, res) => {
    try {
        const { jobId, coverLetter, resume } = req.body;
        const studentId = req.user.userId;

        if (!jobId || !coverLetter) {
            return res.status(400).json({ error: 'Job ID and cover letter are required' });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        if (!job.isActive) {
            return res.status(400).json({ error: 'Job is not active' });
        }

        // Check if already applied
        const existingApplication = await JobApplication.findOne({ jobId, studentId });
        if (existingApplication) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }

        const application = new JobApplication({
            jobId,
            studentId,
            companyId: job.companyId,
            coverLetter,
            resume
        });

        await application.save();

        res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
        console.error('Apply for job error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get applications for a specific job (Company side)
const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;
        const companyId = req.company.companyId;

        // Verify job belongs to company
        const job = await Job.findOne({ _id: jobId, companyId });
        if (!job) {
            return res.status(404).json({ error: 'Job not found or unauthorized' });
        }

        const applications = await JobApplication.find({ jobId })
            .populate('studentId', 'fullName email displayName photoURL') // Populate student info
            .sort({ appliedAt: -1 });

        res.status(200).json({ applications });
    } catch (error) {
        console.error('Get job applications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get student's applications
const getStudentApplications = async (req, res) => {
    try {
        const studentId = req.user.userId;

        const applications = await JobApplication.find({ studentId })
            .populate({
                path: 'jobId',
                select: 'title description companyId hiringType workLocation',
                populate: { path: 'companyId', select: 'companyName' }
            })
            .sort({ appliedAt: -1 });

        res.status(200).json({ applications });
    } catch (error) {
        console.error('Get student applications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, notes } = req.body;
        const companyId = req.company.companyId;

        if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Verify company owns the application
        if (application.companyId.toString() !== companyId.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        application.status = status;
        if (notes) application.notes = notes;
        if (status === 'reviewed' || status === 'accepted' || status === 'rejected') {
            application.reviewedAt = new Date();
        }

        await application.save();

        res.status(200).json({ message: 'Application status updated', application });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all applications for a company
const getCompanyApplications = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const applications = await JobApplication.find({ companyId })
            .populate('studentId', 'fullName email displayName photoURL')
            .populate('jobId', 'title')
            .sort({ appliedAt: -1 });

        res.status(200).json({ applications });
    } catch (error) {
        console.error('Get company applications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get hiring stats
const getCompanyHirings = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // This is a basic implementation. You might want to aggregate this properly
        const hiredCount = await JobApplication.countDocuments({ companyId, status: 'accepted' });
        const totalApplications = await JobApplication.countDocuments({ companyId });

        res.status(200).json({ hiredCount, totalApplications });
    } catch (error) {
        console.error('Get company hirings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = {
    applyForJob,
    getJobApplications,
    getStudentApplications,
    updateApplicationStatus,
    getCompanyApplications,
    getCompanyHirings
};
