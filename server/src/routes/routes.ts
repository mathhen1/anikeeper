import { Router } from 'express';
import { animeListRouter } from './anime-list.routes.js';
import { authRouter } from './auth.routes.js';
import { userRouter } from './user.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/anime-lists', animeListRouter);

export { apiRouter };
