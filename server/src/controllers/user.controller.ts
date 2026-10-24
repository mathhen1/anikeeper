import type { Request, Response } from 'express';
import { z } from 'zod';
import { ApiError } from '../lib/api-error.js';
import {
  deleteProfilePhoto,
  deleteUserAccount,
  deleteUserAnimeData,
  getProfilePhoto,
  getUserProfile,
  saveProfilePhoto,
  updateUsername,
} from '../service/user.service.js';
import {
  exportUserAnimeListsAsText,
  getUserAnimeStats,
} from '../service/anime-list.service.js';

const usernameSchema = z.object({
  username: z.string().trim().toLowerCase().min(3).max(20),
});

function getUserId(request: Request): string {
  if (!request.authenticatedUserId) {
    throw new ApiError(401, 'Authentication is required.');
  }
  return request.authenticatedUserId;
}

export async function getMe(request: Request, response: Response) {
  response.json({ data: await getUserProfile(getUserId(request)) });
}

export async function patchMe(request: Request, response: Response) {
  const { username } = usernameSchema.parse(request.body);
  response.json({ data: await updateUsername(getUserId(request), username) });
}

export async function deleteMe(request: Request, response: Response) {
  await deleteUserAccount(getUserId(request));
  response.status(204).end();
}

export async function getAnimeStats(request: Request, response: Response) {
  response.json({ data: await getUserAnimeStats(getUserId(request)) });
}

export async function deleteAnimeData(request: Request, response: Response) {
  await deleteUserAnimeData(getUserId(request));
  response.status(204).end();
}

export async function exportAnimeLists(request: Request, response: Response) {
  const userId = getUserId(request);
  const user = await getUserProfile(userId);
  const exportText = await exportUserAnimeListsAsText(userId);

  response
    .type('text/plain; charset=utf-8')
    .attachment(`${user.username}.txt`)
    .send(exportText);
}

export async function uploadProfilePhoto(request: Request, response: Response) {
  if (!request.file) throw new ApiError(400, 'A profile photo file is required.');

  await saveProfilePhoto(
    getUserId(request),
    request.file.buffer,
    'image/webp',
  );
  response.status(204).end();
}

export async function getMyProfilePhoto(request: Request, response: Response) {
  const photo = await getProfilePhoto(getUserId(request));
  response.type(photo.contentType).send(photo.imageBuffer);
}

export async function deleteMyProfilePhoto(request: Request, response: Response) {
  await deleteProfilePhoto(getUserId(request));
  response.status(204).end();
}
