import { Router } from 'express';
import * as animeListController from '../controllers/anime-list.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const animeListRouter = Router();

animeListRouter.use(authenticate);

animeListRouter.get('/counts', animeListController.getListCounts);
animeListRouter.get('/animes/:kitsuId', animeListController.getAnimeStatus);
animeListRouter.get('/:key/animes', animeListController.getAnimeList);
animeListRouter.post('/:key/animes', animeListController.addAnime);
animeListRouter.delete('/:key/animes', animeListController.clearList);
animeListRouter.delete('/animes/:kitsuId', animeListController.removeAnime);

export { animeListRouter };
