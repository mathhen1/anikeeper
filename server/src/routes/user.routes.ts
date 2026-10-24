import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { profilePhotoMiddleware } from '../middleware/photo-middleware.js';

const userRouter = Router();

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
  ...profilePhotoMiddleware,
  userController.uploadProfilePhoto,
);
userRouter.delete('/me/profile-photo', userController.deleteMyProfilePhoto);

export { userRouter };
