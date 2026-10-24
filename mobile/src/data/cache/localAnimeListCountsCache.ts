import { File, Paths } from 'expo-file-system';

export type LocalAnimeListCounts = {
  completed: number;
  watching: number;
  planned: number;
};

type LocalAnimeListCountsLoader = () => Promise<LocalAnimeListCounts>;
type LocalAnimeListCountsListener = (counts: LocalAnimeListCounts) => void;

const memoryCache = new Map<string, LocalAnimeListCounts>();
const listeners = new Map<string, Set<LocalAnimeListCountsListener>>();

export function clearLocalAnimeListCountsMemoryCache(): void {
  memoryCache.clear();
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function getCacheFile(username: string): File {
  const fileName = `anikeeper-anime-list-counts-${encodeURIComponent(
    normalizeUsername(username),
  )}.json`;
  return new File(Paths.cache, fileName);
}

function isLocalAnimeListCounts(value: unknown): value is LocalAnimeListCounts {
  if (typeof value !== 'object' || value === null) return false;

  const counts = value as Partial<LocalAnimeListCounts>;
  return (
    typeof counts.completed === 'number' &&
    Number.isInteger(counts.completed) &&
    counts.completed >= 0 &&
    typeof counts.watching === 'number' &&
    Number.isInteger(counts.watching) &&
    counts.watching >= 0 &&
    typeof counts.planned === 'number' &&
    Number.isInteger(counts.planned) &&
    counts.planned >= 0
  );
}

function notifyListeners(username: string, counts: LocalAnimeListCounts): void {
  const usernameListeners = listeners.get(normalizeUsername(username));
  usernameListeners?.forEach((listener) => listener(counts));
}

export function readLocalAnimeListCountsCache(
  username: string,
): LocalAnimeListCounts | null {
  if (!username.trim()) return null;

  const cacheKey = normalizeUsername(username);
  const memoryCounts = memoryCache.get(cacheKey);
  if (memoryCounts) return memoryCounts;

  try {
    const cacheFile = getCacheFile(username);
    if (!cacheFile.exists) return null;

    const cachedCounts: unknown = JSON.parse(cacheFile.textSync());
    if (!isLocalAnimeListCounts(cachedCounts)) return null;

    memoryCache.set(cacheKey, cachedCounts);
    return cachedCounts;
  } catch (error: unknown) {
    console.warn('Could not read the anime list counts cache.', error);
    return null;
  }
}

export function subscribeToLocalAnimeListCounts(
  username: string,
  listener: LocalAnimeListCountsListener,
): () => void {
  const cacheKey = normalizeUsername(username);
  const usernameListeners = listeners.get(cacheKey) ?? new Set();
  usernameListeners.add(listener);
  listeners.set(cacheKey, usernameListeners);

  return () => {
    usernameListeners.delete(listener);
    if (usernameListeners.size === 0) listeners.delete(cacheKey);
  };
}

export function updateLocalAnimeListCountsCache(
  username: string,
  counts: LocalAnimeListCounts,
): LocalAnimeListCounts {
  const cacheKey = normalizeUsername(username);
  memoryCache.set(cacheKey, counts);

  try {
    const cacheFile = getCacheFile(username);
    if (!cacheFile.exists) cacheFile.create();
    cacheFile.writeSync(JSON.stringify(counts));
  } catch (error: unknown) {
    console.warn('Could not write the anime list counts cache.', error);
  }

  notifyListeners(username, counts);
  return counts;
}

export async function getOrCreateLocalAnimeListCounts(
  username: string,
  loadCounts: LocalAnimeListCountsLoader,
): Promise<LocalAnimeListCounts> {
  const cachedCounts = readLocalAnimeListCountsCache(username);
  if (cachedCounts) return cachedCounts;

  const counts = await loadCounts();
  const updatedCounts = memoryCache.get(normalizeUsername(username));
  if (updatedCounts) return updatedCounts;

  return updateLocalAnimeListCountsCache(username, counts);
}
