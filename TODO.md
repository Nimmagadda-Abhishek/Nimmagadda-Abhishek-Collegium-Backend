# TODO: Switch from AWS S3 to Cloudinary for Image Uploads

- [x] Update package.json: Remove @aws-sdk/client-s3, @aws-sdk/lib-storage, multer-s3; Add cloudinary, multer-storage-cloudinary
- [x] Update .env: Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- [x] Update controllers/postController.js: Replace S3 configuration with Cloudinary upload using multer-storage-cloudinary
- [x] Install new dependencies: npm install cloudinary multer-storage-cloudinary
- [x] Uninstall old dependencies: npm uninstall @aws-sdk/client-s3 @aws-sdk/lib-storage multer-s3
- [ ] Test the image upload functionality (run the server and verify uploads work)
