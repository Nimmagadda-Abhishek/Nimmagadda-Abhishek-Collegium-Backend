const Job = require('../models/Job');

// Create a new job posting
const createJob = async (req, res) => {
  try {
    const companyId = req.company.companyId;
    const {
      title,
      description,
      hiringType,
      workLocation,
      budget,
      stipend,
      duration,
      numberOfOpenings,
      requiredSkills,
    } = req.body;

    if (!title || !description || !hiringType || !workLocation || !budget || !duration || !numberOfOpenings || !requiredSkills) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const job = new Job({
      companyId,
      title,
      description,
      hiringType,
      workLocation,
      budget,
      stipend,
      duration,
      numberOfOpenings,
      requiredSkills,
    });

    await job.save();

    res.status(201).json({
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all jobs posted by the company
const getCompanyJobs = async (req, res) => {
  try {
    const companyId = req.company.companyId;

    const jobs = await Job.find({ companyId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Company jobs retrieved successfully',
      jobs,
    });
  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific job by ID
const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.company.companyId;

    const job = await Job.findOne({ _id: jobId, companyId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json({
      message: 'Job retrieved successfully',
      job,
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a job posting
const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.company.companyId;
    const updates = req.body;

    const job = await Job.findOneAndUpdate(
      { _id: jobId, companyId },
      updates,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json({
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a job posting
const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.company.companyId;

    const job = await Job.findOneAndDelete({ _id: jobId, companyId });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json({
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all active jobs (public)
const getAllActiveJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate('companyId', 'companyName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Active jobs retrieved successfully',
      jobs,
    });
  } catch (error) {
    console.error('Get all active jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createJob,
  getCompanyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAllActiveJobs,
};
