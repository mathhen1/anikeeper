import { File, Paths } from 'expo-file-system';
import { AnimeInfo } from '@/src/types/anime';

export type ProfileStats = {
  completedAnimeCount: number;
  completedEpisodeCount: number;
  watchedHours: number;
};

type CompletedAnimeLoader = () => Promise<AnimeInfo[]>;
type ProfileStatsListener = (stats: ProfileStats) => void;

const memoryCache = new Map<string, ProfileStats>();
const listeners = new Map<string, Set<ProfileStatsListener>>();

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function getCacheKey(username: string): string {
  return normalizeUsername(username);
}

function getCacheFile(username: string): File {
  const fileName = `anikeeper-profile-stats-${encodeURIComponent(
    getCacheKey(username),
  )}.json`;
  return new File(Paths.cache, fileName);
}

function isProfileStats(value: unknown): value is ProfileStats {
  if (typeof value !== 'object' || value === null) return false;

  const stats = value as Partial<ProfileStats>;
  return (
    typeof stats.completedAnimeCount === 'number' &&
    Number.isInteger(stats.completedAnimeCount) &&
    stats.completedAnimeCount >= 0 &&
    typeof stats.completedEpisodeCount === 'number' &&
    Number.isInteger(stats.completedEpisodeCount) &&
    stats.completedEpisodeCount >= 0 &&
    typeof stats.watchedHours === 'number' &&
    Number.isInteger(stats.watchedHours) &&
    stats.watchedHours >= 0
  );
}

function calculateProfileStats(completedAnimes: AnimeInfo[]): ProfileStats {
  const completedEpisodeCount = completedAnimes.reduce(
    (totalEpisodes, anime) => totalEpisodes + anime.episodes,
    0,
  );
  const completedMinutes = completedAnimes.reduce((totalMinutes, anime) => {
    if (anime.episodeLength == null) return totalMinutes;
    return totalMinutes + anime.episodeLength * anime.episodes;
  }, 0);

  return {
    completedAnimeCount: completedAnimes.length,
    completedEpisodeCount,
    watchedHours: Math.round(completedMinutes / 60),
  };
}

function notifyListeners(username: string, stats: ProfileStats): void {
  const usernameListeners = listeners.get(getCacheKey(username));
  usernameListeners?.forEach((listener) => listener(stats));
}

export function readProfileStatsCache(username: string): ProfileStats | null {
  if (!username.trim()) return null;

  const cacheKey = getCacheKey(username);
  const memoryStats = memoryCache.get(cacheKey);
  if (memoryStats) return memoryStats;

  try {
    const cacheFile = getCacheFile(username);
    if (!cacheFile.exists) return null;

    const cachedStats: unknown = JSON.parse(cacheFile.textSync());
    if (!isProfileStats(cachedStats)) return null;

    memoryCache.set(cacheKey, cachedStats);
    return cachedStats;
  } catch (error: unknown) {
    // The cache can be missing or cleared by the operating system.
    console.warn('Could not read the profile stats cache.', error);
    return null;
  }
}

export function subscribeToProfileStats(
  username: string,
  listener: ProfileStatsListener,
): () => void {
  const cacheKey = getCacheKey(username);
  const usernameListeners = listeners.get(cacheKey) ?? new Set();
  usernameListeners.add(listener);
  listeners.set(cacheKey, usernameListeners);

  return () => {
    usernameListeners.delete(listener);
    if (usernameListeners.size === 0) listeners.delete(cacheKey);
  };
}

export function updateProfileStatsCache(
  username: string,
  completedAnimes: AnimeInfo[],
): ProfileStats {
  const stats = calculateProfileStats(completedAnimes);
  memoryCache.set(getCacheKey(username), stats);

  try {
    const cacheFile = getCacheFile(username);
    if (!cacheFile.exists) cacheFile.create();
    cacheFile.write(JSON.stringify(stats));
  } catch (error: unknown) {
    // List data remains the source of truth if the disposable cache fails.
    console.warn('Could not write the profile stats cache.', error);
  }

  notifyListeners(username, stats);
  return stats;
}

export async function getOrCreateProfileStats(
  username: string,
  loadCompletedAnimes: CompletedAnimeLoader,
): Promise<ProfileStats> {
  const cachedStats = readProfileStatsCache(username);
  if (cachedStats) return cachedStats;

  const completedAnimes = await loadCompletedAnimes();
  return updateProfileStatsCache(username, completedAnimes);
}
