# TODO: Implement Account Deletion and Blocking Features

## Steps to Complete

- [x] Update User model to add isDeleted, deletedAt, and blockedUsers fields
- [x] Add deleteAccount function to authController.js
- [x] Add blockUser and unblockUser functions to authController.js
- [x] Update postController.js to handle blocked users in getPosts, likePost, addComment
- [x] Add blockUser and unblockUser functions to superAdminController.js
- [x] Add deleteUserAccount function to superAdminController.js
- [x] Update routes/auth.js to include delete account and block user routes
- [x] Update routes/superAdmin.js to include block/unblock and delete user routes
- [ ] Test the new endpoints
- [ ] Update API documentation
