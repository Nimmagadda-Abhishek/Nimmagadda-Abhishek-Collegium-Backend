const ChatRequest = require('../models/ChatRequest');
const Report = require('../models/Report');
const User = require('../models/User');
const { sendPushNotification } = require('../utils/firebaseService');

/**
 * Validate if chat is allowed between two users
 * @route POST /api/chat/validate
 * @access Private
 */
const validateChat = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if users exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    // Check if blocked
    const isBlockedBySender = sender.blockedUsers.includes(receiver._id);
    const isBlockedByReceiver = receiver.blockedUsers.includes(sender._id);

    if (isBlockedBySender || isBlockedByReceiver) {
      return res.status(200).json({
        allowed: false,
        reason: 'Users are blocked from chatting'
      });
    }

    // Generate deterministic roomId using sorted Firebase UIDs
    // This is useful for the frontend to know where to connect even if "allowed" is true
    // Note: If one user doesn't have a firebaseUid, this might fail, so ensure they do.
    const firebaseUids = [sender.firebaseUid, receiver.firebaseUid].sort();
    const roomId = firebaseUids.join('_');

    res.json({
      allowed: true,
      roomId: roomId,
      participants: firebaseUids
    });
  } catch (error) {
    console.error('Error validating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Send chat request
 * @route POST /api/chat/send-request
 * @access Private
 */
const sendChatRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.userId; // From JWT middleware

    if (receiverId === senderId) {
      return res.status(400).json({ error: 'Cannot send chat request to yourself' });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already blocked
    if (sender.blockedUsers.includes(receiver._id) || receiver.blockedUsers.includes(sender._id)) {
      return res.status(403).json({ error: 'Cannot send request to blocked user' });
    }

    // Check if request already exists
    const existingRequest = await ChatRequest.findOne({
      $or: [
        { senderId: sender._id, receiverId: receiver._id },
        { senderId: receiver._id, receiverId: sender._id }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        return res.status(400).json({ error: 'Chat already active' });
      }
      return res.status(400).json({ error: 'Chat request already exists' });
    }

    const chatRequest = new ChatRequest({
      senderId: sender._id,
      receiverId: receiver._id,
    });

    await chatRequest.save();

    // Notify Receiver
    await sendPushNotification(
      receiver._id,
      'New Chat Request',
      `${sender.displayName} wants to chat with you.`,
      {
        type: 'chat_request',
        requestId: chatRequest._id.toString(),
        senderId: sender._id.toString()
      }
    );

    res.status(201).json({
      message: 'Chat request sent successfully',
      requestId: chatRequest._id
    });
  } catch (error) {
    console.error('Error sending chat request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Accept chat request
 * @route POST /api/chat/accept-request
 * @access Private
 */
const acceptChatRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user.userId;

    const chatRequest = await ChatRequest.findById(requestId)
      .populate('senderId', 'displayName firebaseUid')
      .populate('receiverId', 'displayName firebaseUid');

    if (!chatRequest) {
      return res.status(404).json({ error: 'Chat request not found' });
    }

    if (chatRequest.receiverId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }

    if (chatRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    chatRequest.status = 'accepted';
    await chatRequest.save();

    // Generate roomId
    const firebaseUids = [chatRequest.senderId.firebaseUid, chatRequest.receiverId.firebaseUid].sort();
    const roomId = firebaseUids.join('_');

    // Notify original sender that request was accepted
    await sendPushNotification(
      chatRequest.senderId._id,
      'Chat Request Accepted',
      `${chatRequest.receiverId.displayName} accepted your chat request.`,
      {
        type: 'chat_request_accepted',
        roomId: roomId,
        accepterId: userId
      }
    );

    res.json({
      message: 'Chat request accepted',
      roomId: roomId
    });
  } catch (error) {
    console.error('Error accepting chat request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Reject chat request
 * @route POST /api/chat/reject-request
 * @access Private
 */
const rejectChatRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user.userId;

    const chatRequest = await ChatRequest.findById(requestId);

    if (!chatRequest) {
      return res.status(404).json({ error: 'Chat request not found' });
    }

    if (chatRequest.receiverId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to reject this request' });
    }

    if (chatRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    chatRequest.status = 'rejected';
    await chatRequest.save();

    res.json({ message: 'Chat request rejected' });
  } catch (error) {
    console.error('Error rejecting chat request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Block user
 * @route POST /api/chat/block
 * @access Private
 */
const blockUser = async (req, res) => {
  try {
    const { userToBlockId } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    const userToBlock = await User.findById(userToBlockId);

    if (!user || !userToBlock) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.blockedUsers.includes(userToBlock._id)) {
      return res.status(400).json({ error: 'User already blocked' });
    }

    user.blockedUsers.push(userToBlock._id);
    await user.save();

    // Remove any existing chat requests between them
    await ChatRequest.deleteMany({
      $or: [
        { senderId: user._id, receiverId: userToBlock._id },
        { senderId: userToBlock._id, receiverId: user._id }
      ]
    });

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Unblock user
 * @route POST /api/chat/unblock
 * @access Private
 */
const unblockUser = async (req, res) => {
  try {
    const { userToUnblockId } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const index = user.blockedUsers.indexOf(userToUnblockId);
    if (index === -1) {
      return res.status(400).json({ error: 'User not blocked' });
    }

    user.blockedUsers.splice(index, 1);
    await user.save();

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Report user
 * @route POST /api/chat/report
 * @access Private
 */
const reportUser = async (req, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;
    const reporterId = req.user.userId;

    const reporter = await User.findById(reporterId);
    const reportedUser = await User.findById(reportedUserId);

    if (!reporter || !reportedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const report = new Report({
      reporterId,
      reportedUserId,
      reason,
      description,
    });

    await report.save();

    res.status(201).json({ message: 'User reported successfully' });
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Trigger notification for new message
 * @route POST /api/chat/notify
 * @access Private
 */
const notify = async (req, res) => {
  try {
    const { receiverId, title, body, data } = req.body;

    if (!receiverId || !title || !body) {
      return res.status(400).json({ error: 'receiverId, title, and body are required' });
    }

    // Send FCM push notification
    // Note: sendPushNotification handles finding the user and their token
    const notificationResult = await sendPushNotification(
      receiverId,
      title,
      body,
      data || {}
    );

    if (!notificationResult) {
      // user might not have a token or not found, but we don't want to crash the frontend flow
      return res.status(200).json({ success: false, message: 'Notification not sent (User not found or no token)' });
    }

    res.json({
      success: true,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  validateChat,
  sendChatRequest,
  acceptChatRequest,
  rejectChatRequest,
  blockUser,
  unblockUser,
  reportUser,
  notify,
};
