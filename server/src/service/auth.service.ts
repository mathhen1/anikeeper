import bcrypt from 'bcrypt';
import { z } from 'zod';
import { ApiError } from '../lib/api-error.js';
import { createAccessToken } from '../lib/jwt.js';
import { AnimeListModel, animeListKeys } from '../models/anime-list.model.js';
import { UserModel } from '../models/user.model.js';

export const credentialsSchema = z.object({
  username: z.string().trim().toLowerCase().min(3).max(20),
  password: z.string().min(8).max(64),
});

type Credentials = z.infer<typeof credentialsSchema>;

export async function registerUser(credentials: Credentials) {
  const existingUser = await UserModel.exists({
    username: credentials.username,
  });
  if (existingUser) throw new ApiError(409, 'Username is already in use.');

  const user = await UserModel.create({
    username: credentials.username,
    password: await bcrypt.hash(credentials.password, 12),
  });

  try {
    const lists = await Promise.all(
      animeListKeys.map((key) =>
        AnimeListModel.create({ key, user: user._id, animes: [] }),
      ),
    );
    user.animeLists = lists.map((animeList) => animeList._id);
    await user.save();
  } catch (error) {
    await AnimeListModel.deleteMany({ user: user._id });
    await user.deleteOne();
    throw error;
  }

  return {
    accessToken: await createAccessToken(user.id),
    user: { id: user.id, username: user.username },
  };
}

export async function loginUser(credentials: Credentials) {
  const user = await UserModel.findOne({ username: credentials.username }).select(
    '+password',
  );
  const passwordMatches = user
    ? await bcrypt.compare(credentials.password, user.password)
    : false;

  if (!user || !passwordMatches) {
    throw new ApiError(401, 'Username or password is incorrect.');
  }

  return {
    accessToken: await createAccessToken(user.id),
    user: { id: user.id, username: user.username },
  };
}
