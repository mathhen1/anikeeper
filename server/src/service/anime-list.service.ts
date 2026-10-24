import { Types } from 'mongoose';
import { z } from 'zod';
import { AnimeListModel, animeListKeys } from '../models/anime-list.model.js';
import { AnimeModel } from '../models/anime.model.js';
import { UserModel } from '../models/user.model.js';

export const animeListKeySchema = z.enum(animeListKeys);

const nullableString = z.string().nullable().optional();
const kitsuAnimeSchema = z.object({
  id: z.string().min(1),
  attributes: z.object({
    titles: z
      .object({
        en: nullableString,
        en_jp: nullableString,
        ja_jp: nullableString,
      })
      .optional(),
    canonicalTitle: nullableString,
    subtype: nullableString,
    episodeCount: z.number().int().nonnegative().nullable().optional(),
    episodeLength: z.number().int().nonnegative().nullable().optional(),
    averageRating: nullableString,
    startDate: nullableString,
    posterImage: z
      .object({
        original: nullableString,
        large: nullableString,
        small: nullableString,
      })
      .nullable()
      .optional(),
    synopsis: nullableString,
  }),
});

export type AnimeListKey = z.infer<typeof animeListKeySchema>;
export type KitsuAnimeInput = z.infer<typeof kitsuAnimeSchema>;

export function parseKitsuAnime(value: unknown): KitsuAnimeInput {
  if (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    !Array.isArray(value)
  ) {
    return kitsuAnimeSchema.parse(value.data);
  }

  return kitsuAnimeSchema.parse(value);
}

async function getOrCreateAnimeList(userId: string, key: AnimeListKey) {
  let animeList = await AnimeListModel.findOne({ user: userId, key });
  if (animeList) return animeList;

  try {
    animeList = await AnimeListModel.create({ user: userId, key, animes: [] });
  } catch (error) {
    // Another request may have created the same list after the initial lookup.
    animeList = await AnimeListModel.findOne({ user: userId, key });
    if (!animeList) throw error;
  }

  await UserModel.updateOne(
    { _id: userId },
    { $addToSet: { animeLists: animeList._id } },
  );
  return animeList;
}

export async function getAnimeListPage(
  userId: string,
  key: AnimeListKey,
  page: number,
  limit: number,
  query = '',
) {
  const animeList = await AnimeListModel.findOne({ user: userId, key }).select(
    'animes',
  );
  const allAnimeIds: Types.ObjectId[] = animeList?.animes ?? [];
  const searchTerm = query.trim();
  const pageStart = (page - 1) * limit;

  if (!searchTerm) {
    const animeIds = allAnimeIds.slice(pageStart, pageStart + limit);
    const animeDocuments = await AnimeModel.find({
      _id: { $in: animeIds },
    }).lean();
    const animeById = new Map(
      animeDocuments.map((anime) => [anime._id.toString(), anime]),
    );
    const animes = animeIds.flatMap((animeId) => {
      const anime = animeById.get(animeId.toString());
      return anime ? [anime] : [];
    });

    return {
      data: animes,
      pagination: {
        page,
        limit,
        totalItems: allAnimeIds.length,
        totalPages: Math.ceil(allAnimeIds.length / limit),
      },
    };
  }

  const escapedSearchTerm = escapeRegularExpression(searchTerm);
  const animeFilter = {
    _id: { $in: allAnimeIds },
    $or: [
      { 'titles.en': { $regex: escapedSearchTerm, $options: 'i' } },
      { 'titles.en_jp': { $regex: escapedSearchTerm, $options: 'i' } },
      { 'titles.ja_jp': { $regex: escapedSearchTerm, $options: 'i' } },
      { canonicalTitle: { $regex: escapedSearchTerm, $options: 'i' } },
    ],
  };
  const animeDocuments = await AnimeModel.find(animeFilter).lean();
  const animeById = new Map(
    animeDocuments.map((anime) => [anime._id.toString(), anime]),
  );
  const orderedAnime = allAnimeIds.flatMap((animeId) => {
    const anime = animeById.get(animeId.toString());
    return anime ? [anime] : [];
  });
  const totalItems = orderedAnime.length;
  const animes = orderedAnime.slice(pageStart, pageStart + limit);

  return {
    data: animes,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function addAnimeToList(
  userId: string,
  key: AnimeListKey,
  input: KitsuAnimeInput,
) {
  const attributes = input.attributes;
  const anime = await AnimeModel.findOneAndUpdate(
    { kitsuId: input.id },
    {
      $set: {
        titles: attributes.titles,
        canonicalTitle: attributes.canonicalTitle,
        subtype: attributes.subtype,
        episodeCount: attributes.episodeCount,
        episodeLength: attributes.episodeLength,
        averageRating: attributes.averageRating,
        startDate: attributes.startDate,
        posterImage: attributes.posterImage,
        synopsis: attributes.synopsis,
      },
      $setOnInsert: { kitsuId: input.id },
    },
    { new: true, upsert: true, runValidators: true },
  );

  const targetList = await getOrCreateAnimeList(userId, key);
  await AnimeListModel.updateMany(
    { user: userId, _id: { $ne: targetList._id } },
    { $pull: { animes: anime._id } },
  );
  await AnimeListModel.updateOne(
    { _id: targetList._id },
    { $addToSet: { animes: anime._id } },
  );

  return anime;
}

export async function removeAnimeFromLists(userId: string, kitsuId: string) {
  const anime = await AnimeModel.findOne({ kitsuId }).select('_id');
  if (!anime) return;

  await AnimeListModel.updateMany(
    { user: userId },
    { $pull: { animes: anime._id } },
  );
}

export async function clearAnimeList(userId: string, key: AnimeListKey) {
  await AnimeListModel.updateOne(
    { user: userId, key },
    { $set: { animes: [] } },
  );
}

export async function clearAllAnimeLists(userId: string) {
  await AnimeListModel.updateMany({ user: userId }, { $set: { animes: [] } });
}

export async function getAnimeListCounts(userId: string) {
  const lists = await AnimeListModel.find({ user: userId }).select('key animes');
  return Object.fromEntries(
    animeListKeys.map((key) => [
      key,
      lists.find((animeList) => animeList.key === key)?.animes.length ?? 0,
    ]),
  ) as Record<AnimeListKey, number>;
}

export async function getUserAnimeStats(userId: string) {
  const completedList = await AnimeListModel.findOne({
    user: userId,
    key: 'completed',
  }).populate({
    path: 'animes',
    select: 'episodeCount episodeLength',
  });

  const completedAnimes = (completedList?.animes ?? []) as unknown as Array<{
    episodeCount: number | null;
    episodeLength: number | null;
  }>;
  const completedEpisodeCount = completedAnimes.reduce(
    (total, anime) => total + (anime.episodeCount ?? 0),
    0,
  );
  const watchedMinutes = completedAnimes.reduce(
    (total, anime) =>
      total + (anime.episodeCount ?? 0) * (anime.episodeLength ?? 0),
    0,
  );

  return {
    completedAnimeCount: completedAnimes.length,
    completedEpisodeCount,
    watchedHours: Math.round(watchedMinutes / 60),
  };
}

export async function exportUserAnimeListsAsText(userId: string): Promise<string> {
  const lists = await AnimeListModel.find({ user: userId })
    .select('key animes')
    .populate({ path: 'animes', select: 'titles canonicalTitle' });

  const titleByKey: Record<AnimeListKey, string> = {
    completed: 'ANIMES CONCLUÍDOS',
    watching: 'ASSISTINDO ATUALMENTE',
    planned: 'PLANEJO ASSISTIR',
  };
  const animeListsByKey = new Map(
    lists.map((animeList) => [animeList.key, animeList]),
  );

  return animeListKeys
    .map((key) => {
      const animeList = animeListsByKey.get(key);
      const animeDocuments = (animeList?.animes ?? []) as unknown as Array<{
        titles?: { en?: string | null };
        canonicalTitle?: string | null;
      } | null>;
      const animeTitles = animeDocuments.flatMap((anime) => {
        if (!anime) return [];

        const title = anime.titles?.en || anime.canonicalTitle;
        return title ? [title] : [];
      });

      return `${titleByKey[key]}\n\n${animeTitles.join('\n')}`;
    })
    .join('\n\n');
}

