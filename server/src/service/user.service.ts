import { Types } from 'mongoose';
import { ApiError } from '../lib/api-error.js';
import { AnimeListModel } from '../models/anime-list.model.js';
import { UserModel } from '../models/user.model.js';
import { clearAllAnimeLists, getAnimeListCounts } from './anime-list.service.js';

export async function getUserProfile(userId: string) {
  const user = await UserModel.findById(userId).select(
    'username profilePhotoContentType',
  );
  if (!user) throw new ApiError(404, 'User account was not found.');

  return {
    id: user.id,
    username: user.username,
    hasProfilePhoto: Boolean(user.profilePhotoContentType),
    animeLists: await getAnimeListCounts(userId),
  };
}

export async function updateUsername(userId: string, username: string) {
  const normalizedUsername = username.trim();
  const existingUser = await UserModel.exists({
    username: normalizedUsername,
    _id: { $ne: userId },
  });
  if (existingUser) throw new ApiError(409, 'Username is already in use.');

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { username: normalizedUsername } },
    { new: true, runValidators: true },
  ).select('username');
  if (!user) throw new ApiError(404, 'User account was not found.');

  return { id: user.id, username: user.username };
}

export async function deleteUserAccount(userId: string) {
  const userObjectId = new Types.ObjectId(userId);
  await AnimeListModel.deleteMany({ user: userObjectId });
  await UserModel.deleteOne({ _id: userObjectId });
}

export async function deleteUserAnimeData(userId: string) {
  await clearAllAnimeLists(userId);
}

export async function saveProfilePhoto(
  userId: string,
  imageBuffer: Buffer,
  contentType: string,
) {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        profilePhoto: imageBuffer,
        profilePhotoContentType: contentType,
      },
    },
    { new: true },
  ).select('_id');
  if (!user) throw new ApiError(404, 'User account was not found.');
}

export async function getProfilePhoto(userId: string) {
  const user = await UserModel.findById(userId).select(
    'profilePhoto profilePhotoContentType',
  );
  if (!user?.profilePhoto || !user.profilePhotoContentType) {
    throw new ApiError(404, 'Profile photo was not found.');
  }

  return {
    imageBuffer: user.profilePhoto,
    contentType: user.profilePhotoContentType,
  };
}

export async function deleteProfilePhoto(userId: string) {
  const user = await UserModel.findByIdAndUpdate(userId, {
    $unset: { profilePhoto: 1, profilePhotoContentType: 1 },
  }).select('_id');
  if (!user) throw new ApiError(404, 'User account was not found.');
}

