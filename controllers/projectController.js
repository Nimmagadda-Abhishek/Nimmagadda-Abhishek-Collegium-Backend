const Project = require('../models/Project');
const User = require('../models/User');
const { checkLimitExceeded } = require('../utils/subscriptionUtils');

// Create a new project
const createProject = async (req, res) => {
  console.log('Create project API called for user:', req.user.userId, 'with name:', req.body.name);

  try {
    const { name, description, githubRepo, tags, allowCollaborations } = req.body;
    const userId = req.user.userId; // From JWT middleware

    if (!name || !description) {
      console.error('Create project validation failed: Name and description are required');
      return res.status(400).json({ error: 'Name and description are required' });
    }

    // Get user's collegeId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check subscription limits
    const limitExceeded = await checkLimitExceeded(userId, 'projects');
    if (limitExceeded) {
      console.error('Create project failed: Monthly project limit exceeded for user:', userId);
      return res.status(403).json({ error: 'Monthly project creation limit exceeded. Upgrade your plan for more projects.' });
    }

    console.log('Creating new project in database...');
    const newProject = new Project({
      user: userId,
      collegeId: user.collegeId,
      name,
      description,
      githubRepo,
      tags: tags || [],
      allowCollaborations: allowCollaborations !== undefined ? allowCollaborations : true,
    });

    await newProject.save();
    console.log('Project created successfully with ID:', newProject._id);

    // Populate user details for response
    await newProject.populate('user', 'displayName photoURL');
    await newProject.populate('collaborators', 'displayName photoURL');

    res.status(201).json({
      message: 'Project created successfully',
      project: newProject,
    });
  } catch (error) {
    console.error('Create project error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all projects (feed)
const getProjects = async (req, res) => {
  console.log('Get projects API called (feed)');

  try {
    const projects = await Project.find({ collegeId: req.user.collegeId })
      .populate('user', 'displayName photoURL')
      .populate('collaborators', 'displayName photoURL')
      .sort({ createdAt: -1 }); // Most recent first

    console.log('Get projects successful, returned', projects.length, 'projects');
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Get projects error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get projects by a specific user
const getUserProjects = async (req, res) => {
  console.log('Get user projects API called for user:', req.params.userId);

  try {
    const { userId } = req.params;

    const projects = await Project.find({ user: userId })
      .populate('user', 'displayName photoURL')
      .populate('collaborators', 'displayName photoURL')
      .sort({ createdAt: -1 });

    console.log('Get user projects successful, returned', projects.length, 'projects for user:', userId);
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Get user projects error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.params?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a project (only by the owner)
const updateProject = async (req, res) => {
  console.log('Update project API called for project:', req.params.projectId, 'by user:', req.user.userId);

  try {
    const { projectId } = req.params;
    const { name, description, githubRepo, tags, allowCollaborations } = req.body;
    const userId = req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      console.error('Update project failed: Project not found with ID:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user.toString() !== userId) {
      console.error('Update project failed: User', userId, 'not authorized to update project', projectId, 'owned by', project.user);
      return res.status(403).json({ error: 'You can only update your own projects' });
    }

    console.log('Updating project:', projectId);
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (githubRepo !== undefined) project.githubRepo = githubRepo;
    if (tags !== undefined) project.tags = tags;
    if (allowCollaborations !== undefined) project.allowCollaborations = allowCollaborations;

    await project.save();

    // Populate for response
    await project.populate('user', 'displayName photoURL');
    await project.populate('collaborators', 'displayName photoURL');

    console.log('Project updated successfully:', projectId);
    res.status(200).json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    console.error('Update project error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      projectId: req.params?.projectId,
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a project (only by the owner)
const deleteProject = async (req, res) => {
  console.log('Delete project API called for project:', req.params.projectId, 'by user:', req.user.userId);

  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      console.error('Delete project failed: Project not found with ID:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user.toString() !== userId) {
      console.error('Delete project failed: User', userId, 'not authorized to delete project', projectId, 'owned by', project.user);
      return res.status(403).json({ error: 'You can only delete your own projects' });
    }

    console.log('Deleting project:', projectId, 'by owner:', userId);
    await Project.findByIdAndDelete(projectId);
    console.log('Project deleted successfully:', projectId);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      projectId: req.params?.projectId,
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add a collaborator to a project (only by the owner, if collaborations allowed)
const addCollaborator = async (req, res) => {
  console.log('Add collaborator API called for project:', req.params.projectId, 'by user:', req.user.userId, 'collaborator:', req.body.collaboratorId);

  try {
    const { projectId } = req.params;
    const { collaboratorId } = req.body;
    const userId = req.user.userId;

    if (!collaboratorId) {
      console.error('Add collaborator validation failed: Collaborator ID is required');
      return res.status(400).json({ error: 'Collaborator ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      console.error('Add collaborator failed: Project not found with ID:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user.toString() !== userId) {
      console.error('Add collaborator failed: User', userId, 'not authorized to add collaborators to project', projectId, 'owned by', project.user);
      return res.status(403).json({ error: 'You can only add collaborators to your own projects' });
    }

    if (!project.allowCollaborations) {
      console.error('Add collaborator failed: Collaborations not allowed for project', projectId);
      return res.status(403).json({ error: 'Collaborations are not allowed for this project' });
    }

    if (project.collaborators.includes(collaboratorId)) {
      console.error('Add collaborator failed: User', collaboratorId, 'is already a collaborator on project', projectId);
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    console.log('Adding collaborator to project:', projectId);
    project.collaborators.push(collaboratorId);
    await project.save();

    // Populate for response
    await project.populate('user', 'displayName photoURL');
    await project.populate('collaborators', 'displayName photoURL');

    console.log('Collaborator added successfully to project:', projectId);
    res.status(200).json({
      message: 'Collaborator added successfully',
      project,
    });
  } catch (error) {
    console.error('Add collaborator error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      projectId: req.params?.projectId,
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove a collaborator from a project (by owner or the collaborator themselves)
const removeCollaborator = async (req, res) => {
  console.log('Remove collaborator API called for project:', req.params.projectId, 'by user:', req.user.userId, 'collaborator:', req.body.collaboratorId);

  try {
    const { projectId } = req.params;
    const { collaboratorId } = req.body;
    const userId = req.user.userId;

    if (!collaboratorId) {
      console.error('Remove collaborator validation failed: Collaborator ID is required');
      return res.status(400).json({ error: 'Collaborator ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      console.error('Remove collaborator failed: Project not found with ID:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }

    const isOwner = project.user.toString() === userId;
    const isCollaborator = project.collaborators.includes(collaboratorId);
    const isSelfRemoving = collaboratorId === userId;

    if (!isOwner && !isSelfRemoving) {
      console.error('Remove collaborator failed: User', userId, 'not authorized to remove collaborator', collaboratorId, 'from project', projectId);
      return res.status(403).json({ error: 'You can only remove yourself or collaborators from your own projects' });
    }

    if (!isCollaborator) {
      console.error('Remove collaborator failed: User', collaboratorId, 'is not a collaborator on project', projectId);
      return res.status(400).json({ error: 'User is not a collaborator' });
    }

    console.log('Removing collaborator from project:', projectId);
    project.collaborators = project.collaborators.filter(id => id.toString() !== collaboratorId);
    await project.save();

    // Populate for response
    await project.populate('user', 'displayName photoURL');
    await project.populate('collaborators', 'displayName photoURL');

    console.log('Collaborator removed successfully from project:', projectId);
    res.status(200).json({
      message: 'Collaborator removed successfully',
      project,
    });
  } catch (error) {
    console.error('Remove collaborator error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      projectId: req.params?.projectId,
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single project by ID
const getProject = async (req, res) => {
  console.log('Get project API called for project:', req.params.projectId);

  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('user', 'displayName photoURL')
      .populate('collaborators', 'displayName photoURL');

    if (!project) {
      console.error('Get project failed: Project not found with ID:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('Get project successful for ID:', projectId);
    res.status(200).json({ project });
  } catch (error) {
    console.error('Get project error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      projectId: req.params?.projectId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search projects by name or collaborator
const searchProjects = async (req, res) => {
  console.log('Search projects API called with query:', req.query.q);

  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      console.error('Search projects validation failed: Query must be at least 2 characters');
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const searchRegex = new RegExp(q.trim(), 'i'); // Case-insensitive regex

    console.log('Searching projects with regex:', searchRegex);
    // Find user IDs that match the search query
    const matchingUsers = await User.find({ displayName: searchRegex, collegeId: req.user.collegeId }).select('_id');
    const userIds = matchingUsers.map(user => user._id);

    const projects = await Project.find({
      collegeId: req.user.collegeId,
      $or: [
        { name: searchRegex },
        { collaborators: { $in: userIds } },
      ],
    })
      .populate('user', 'displayName photoURL')
      .populate('collaborators', 'displayName photoURL')
      .limit(20) // Limit results to prevent overload
      .sort({ createdAt: -1 }); // Most recent first

    console.log('Search projects successful, returned', projects.length, 'results');
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Search projects error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      query: req.query?.q
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getUserProjects,
  getProject,
  updateProject,
  deleteProject,
  addCollaborator,
  removeCollaborator,
  searchProjects,
};
