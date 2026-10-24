import type { Request, Response } from 'express';
import { ApiError } from '../lib/api-error.js';
import {
  addAnimeToList,
  animeListKeySchema,
  clearAnimeList,
  getAnimeListCounts,
  getAnimeListPage,
  parseKitsuAnime,
  removeAnimeFromLists,
} from '../service/anime-list.service.js';

function getUserId(request: Request): string {
  if (!request.authenticatedUserId) {
    throw new ApiError(401, 'Authentication is required.');
  }
  return request.authenticatedUserId;
}

function parsePositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return fallback;
  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

export async function getAnimeList(request: Request, response: Response) {
  const userId = getUserId(request);
  const key = animeListKeySchema.parse(request.params.key);
  const requestedPage = parsePositiveInteger(request.query.page, 1);
  const requestedLimit = parsePositiveInteger(request.query.limit, 20);
  const limit = Math.min(requestedLimit, 100);
  const query = typeof request.query.q === 'string' ? request.query.q : '';

  response.json(
    await getAnimeListPage(userId, key, requestedPage, limit, query),
  );
}

export async function addAnime(request: Request, response: Response) {
  const userId = getUserId(request);
  const key = animeListKeySchema.parse(request.params.key);
  const anime = parseKitsuAnime(request.body);
  const savedAnime = await addAnimeToList(userId, key, anime);
  response.status(201).json({ data: savedAnime });
}

export async function removeAnime(request: Request, response: Response) {
  const userId = getUserId(request);
  const kitsuId = request.params.kitsuId;
  if (typeof kitsuId !== 'string' || !kitsuId) {
    throw new ApiError(400, 'A Kitsu anime ID is required.');
  }

  await removeAnimeFromLists(userId, kitsuId);
  response.status(204).end();
}

export async function clearList(request: Request, response: Response) {
  const userId = getUserId(request);
  const key = animeListKeySchema.parse(request.params.key);
  await clearAnimeList(userId, key);
  response.status(204).end();
}

export async function getListCounts(request: Request, response: Response) {
  response.json({ data: await getAnimeListCounts(getUserId(request)) });
}
