const express = require('express');
const router = express.Router();
const {
  validateChat,
  sendChatRequest,
  acceptChatRequest,
  rejectChatRequest,
  blockUser,
  unblockUser,
  reportUser,
  notify,
} = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

// All chat routes require authentication
router.use(authenticateToken);

/**
 * @route POST /api/chat/validate
 * @desc Validate if chat is allowed between two users
 * @access Private
 */
router.post('/validate', validateChat);

/**
 * @route POST /api/chat/send-request
 * @desc Send a chat request to another user
 * @access Private
 */
router.post('/send-request', sendChatRequest);

/**
 * @route POST /api/chat/accept-request
 * @desc Accept a chat request
 * @access Private
 */
router.post('/accept-request', acceptChatRequest);

/**
 * @route POST /api/chat/reject-request
 * @desc Reject a chat request
 * @access Private
 */
router.post('/reject-request', rejectChatRequest);

/**
 * @route POST /api/chat/block
 * @desc Block a user
 * @access Private
 */
router.post('/block', blockUser);

/**
 * @route POST /api/chat/unblock
 * @desc Unblock a user
 * @access Private
 */
router.post('/unblock', unblockUser);

/**
 * @route POST /api/chat/report
 * @desc Report a user
 * @access Private
 */
router.post('/report', reportUser);

/**
 * @route POST /api/chat/notify
 * @desc Send push notification for new message
 * @access Private
 */
router.post('/notify', notify);

module.exports = router;
