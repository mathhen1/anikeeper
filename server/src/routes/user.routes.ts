import { Router } from 'express';
import multer from 'multer';
import * as userController from '../controllers/user.controller.js';
import { ApiError } from '../lib/api-error.js';
import { authenticate } from '../middleware/authenticate.js';

const userRouter = Router();
const profilePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new ApiError(400, 'Only image files are accepted.'));
      return;
    }
    callback(null, true);
  },
});

userRouter.use(authenticate);

userRouter.get('/me', userController.getMe);
userRouter.patch('/me', userController.patchMe);
userRouter.delete('/me', userController.deleteMe);
userRouter.get('/me/stats', userController.getAnimeStats);
userRouter.delete('/me/anime-lists', userController.deleteAnimeData);
userRouter.get('/me/anime-lists/export', userController.exportAnimeLists);
userRouter.get('/me/profile-photo', userController.getMyProfilePhoto);
userRouter.put(
  '/me/profile-photo',
  profilePhotoUpload.single('photo'),
  userController.uploadProfilePhoto,
);
userRouter.delete('/me/profile-photo', userController.deleteMyProfilePhoto);

export { userRouter };
