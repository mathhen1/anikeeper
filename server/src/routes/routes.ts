import { Router } from 'express';
import { animeListRouter } from './anime-list.routes.js';
import { authRouter } from './auth.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/anime-lists', animeListRouter);

export { apiRouter };
