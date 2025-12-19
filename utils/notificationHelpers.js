const { getUserByIdentifier } = require('./userUtils');
const { createNotification } = require('./notificationService');

class NotificationHelpers {
  static async sendPostLikeNotification(postOwnerFirebaseUid, likerName, postId) {
    try {
      const postOwner = await getUserByIdentifier(postOwnerFirebaseUid);
      if (!postOwner) return;

      await createNotification(
        postOwner._id,
        'post_like',
        'Post Liked',
        `${likerName} liked your post.`,
        { postId },
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
      );
    } catch (error) {
      console.error('Error sending post like notification:', error);
    }
  }

  static async sendPostCommentNotification(postOwnerFirebaseUid, commenterName, commentText, postId) {
    try {
      const postOwner = await getUserByIdentifier(postOwnerFirebaseUid);
      if (!postOwner) return;

      await createNotification(
        postOwner._id,
        'post_comment',
        'New Comment',
        `${commenterName} commented on your post: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
        { postId, commentText },
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
      );
    } catch (error) {
      console.error('Error sending post comment notification:', error);
    }
  }
}

module.exports = { NotificationHelpers };
