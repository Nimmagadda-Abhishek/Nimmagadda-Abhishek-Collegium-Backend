const express = require('express');
const {
  createProject,
  getProjects,
  getUserProjects,
  getProject,
  updateProject,
  deleteProject,
  addCollaborator,
  removeCollaborator,
  searchProjects,
} = require('../controllers/projectController');
const { verifyToken } = require('../controllers/authController');

const router = express.Router();

// Create a new project (protected)
router.post('/', verifyToken, createProject);

// Get all projects (protected)
router.get('/', verifyToken, getProjects);

// Get projects by a specific user (protected)
router.get('/user/:userId', verifyToken, getUserProjects);

// Search projects (protected)
router.get('/search', verifyToken, searchProjects);

// Get a single project by ID (protected)
router.get('/:projectId', verifyToken, getProject);

// Update a project (protected)
router.put('/:projectId', verifyToken, updateProject);

// Delete a project (protected)
router.delete('/:projectId', verifyToken, deleteProject);

// Add a collaborator to a project (protected)
router.post('/:projectId/collaborator', verifyToken, addCollaborator);

// Remove a collaborator from a project (protected)
router.delete('/:projectId/collaborator', verifyToken, removeCollaborator);

module.exports = router;
