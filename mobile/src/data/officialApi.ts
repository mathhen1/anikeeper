import type { AnimeInfo } from '@/src/types/anime';
import type { LocalAnimeListKey } from '@/src/data/cache/localAnimeLists';
import { updateLocalAnimeListCountsCache } from '@/src/data/cache/localAnimeListCountsCache';
import {
  updateProfileStatsValueCache,
  type ProfileStats,
} from '@/src/data/cache/localProfileStatsCache';
import { apiRequest, apiUploadFile } from '@/src/data/apiClient';

export type OfficialAnimeListCounts = {
  completed: number;
  watching: number;
  planned: number;
};

export type OfficialAnimeListPage = {
  animes: AnimeInfo[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export type OfficialProfile = {
  id: string;
  username: string;
  hasProfilePhoto: boolean;
  animeLists: OfficialAnimeListCounts;
};

type StoredAnime = {
  kitsuId: string;
  titles?: {
    en?: string | null;
    en_jp?: string | null;
    ja_jp?: string | null;
  };
  canonicalTitle?: string | null;
  subtype?: string | null;
  episodeCount?: number | null;
  episodeLength?: number | null;
  averageRating?: string | null;
  startDate?: string | null;
  posterImage?: {
    original?: string | null;
    large?: string | null;
    small?: string | null;
  };
  synopsis?: string | null;
};

type AnimeListResponse = {
  data: StoredAnime[];
  pagination: OfficialAnimeListPage['pagination'];
};

function toAnimeInfo(anime: StoredAnime): AnimeInfo {
  const title = anime.titles?.en || anime.canonicalTitle || 'Título indisponível';
  const score = anime.averageRating ? Number(anime.averageRating) / 10 : null;
  const year = anime.startDate ? Number(anime.startDate.slice(0, 4)) : 0;

  return {
    id: anime.kitsuId,
    title,
    originalTitle: anime.titles?.ja_jp || anime.titles?.en_jp || title,
    type: anime.subtype?.toLowerCase() === 'movie' ? 'Filme' : 'Série',
    year: Number.isFinite(year) ? year : 0,
    episodes: anime.episodeCount ?? 0,
    episodeLength: anime.episodeLength ?? null,
    rating: score !== null && Number.isFinite(score) ? score.toFixed(1) : '—',
    studio: 'Desconhecido',
    synopsis: anime.synopsis || 'Sinopse indisponível.',
    genres: [],
    colors: ['#4E5368', '#B59AF7'],
    icon: 'sparkles-outline',
    imageUrl:
      anime.posterImage?.original ??
      anime.posterImage?.large ??
      anime.posterImage?.small ??
      null,
  };
}

function toKitsuAnimePayload(anime: AnimeInfo) {
  const numericRating = Number(anime.rating);
  const rating = Number.isFinite(numericRating)
    ? String(Math.round(numericRating * 10))
    : null;
  const image = anime.imageUrl ?? null;

  return {
    id: anime.id,
    attributes: {
      titles: {
        en: anime.title,
        en_jp: anime.originalTitle,
        ja_jp: anime.originalTitle,
      },
      canonicalTitle: anime.title,
      subtype: anime.type === 'Filme' ? 'movie' : 'TV',
      episodeCount: anime.episodes,
      episodeLength: anime.episodeLength ?? null,
      averageRating: rating,
      startDate: anime.year > 0 ? `${anime.year}-01-01` : null,
      posterImage: { original: image, large: image, small: image },
      synopsis: anime.synopsis,
    },
  };
}

export async function getOfficialProfile(token: string): Promise<OfficialProfile> {
  const response = await apiRequest<{ data: OfficialProfile }>('/users/me', {
    token,
  });
  return response.data;
}

export async function updateOfficialUsername(
  token: string,
  username: string,
): Promise<{ id: string; username: string }> {
  const response = await apiRequest<{
    data: { id: string; username: string };
  }>('/users/me', {
    method: 'PATCH',
    token,
    jsonBody: { username },
  });

  return response.data;
}

export async function deleteOfficialAccount(token: string): Promise<void> {
  await apiRequest<void>('/users/me', { method: 'DELETE', token });
}

export async function clearOfficialAnimeData(token: string): Promise<void> {
  await apiRequest<void>('/users/me/anime-lists', { method: 'DELETE', token });
}

export async function getOfficialAnimeListCounts(
  token: string,
): Promise<OfficialAnimeListCounts> {
  const response = await apiRequest<{ data: OfficialAnimeListCounts }>(
    '/anime-lists/counts',
    { token },
  );
  return response.data;
}

export async function getOfficialProfileStats(
  token: string,
): Promise<ProfileStats> {
  const response = await apiRequest<{ data: ProfileStats }>('/users/me/stats', {
    token,
  });
  return response.data;
}

export async function getOfficialAnimeList(
  token: string,
  listKey: LocalAnimeListKey,
  options: { page?: number; limit?: number; query?: string; signal?: AbortSignal } = {},
): Promise<OfficialAnimeListPage> {
  const searchParams = new URLSearchParams({
    page: String(options.page ?? 1),
    limit: String(options.limit ?? 20),
  });
  if (options.query?.trim()) searchParams.set('q', options.query.trim());

  const response = await apiRequest<AnimeListResponse>(
    `/anime-lists/${listKey}/animes?${searchParams.toString()}`,
    { token, signal: options.signal },
  );

  return {
    animes: response.data.map(toAnimeInfo),
    pagination: response.pagination,
  };
}

export async function getOfficialAnimeListStatus(
  token: string,
  animeId: string,
): Promise<LocalAnimeListKey | null> {
  const response = await apiRequest<{
    data: { listKey: LocalAnimeListKey | null };
  }>(`/anime-lists/animes/${encodeURIComponent(animeId)}`, { token });
  return response.data.listKey;
}

export async function addOfficialAnimeToList(
  token: string,
  anime: AnimeInfo,
  listKey: LocalAnimeListKey,
): Promise<void> {
  await apiRequest(`/anime-lists/${listKey}/animes`, {
    method: 'POST',
    token,
    jsonBody: toKitsuAnimePayload(anime),
  });
}

export async function removeOfficialAnimeFromLists(
  token: string,
  animeId: string,
): Promise<void> {
  await apiRequest(`/anime-lists/animes/${encodeURIComponent(animeId)}`, {
    method: 'DELETE',
    token,
  });
}

export async function uploadOfficialProfilePhoto(
  token: string,
  photoUri: string,
  mimeType = 'image/jpeg',
): Promise<void> {
  await apiUploadFile('/users/me/profile-photo', {
    token,
    fileUri: photoUri,
    fieldName: 'photo',
    mimeType,
  });
}

export async function getOfficialProfilePhotoBytes(
  token: string,
): Promise<Uint8Array> {
  const photoBytes = await apiRequest<ArrayBuffer>('/users/me/profile-photo', {
    token,
    responseType: 'arrayBuffer',
  });
  return new Uint8Array(photoBytes);
}

export async function deleteOfficialProfilePhoto(token: string): Promise<void> {
  await apiRequest<void>('/users/me/profile-photo', {
    method: 'DELETE',
    token,
  });
}

export async function exportOfficialAnimeLists(token: string): Promise<string> {
  return apiRequest<string>('/users/me/anime-lists/export', {
    token,
    responseType: 'text',
  });
}

export async function refreshOfficialSummaryCaches(
  token: string,
  cacheKey: string,
): Promise<void> {
  const [counts, stats] = await Promise.all([
    getOfficialAnimeListCounts(token),
    getOfficialProfileStats(token),
  ]);

  updateLocalAnimeListCountsCache(cacheKey, counts);
  updateProfileStatsValueCache(cacheKey, stats);
}
