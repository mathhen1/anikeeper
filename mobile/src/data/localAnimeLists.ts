import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnimeInfo } from '@/src/types/anime';

export const localAnimeListOptions = [
  {
    key: 'completed',
    label: 'Animes concluídos',
    description: 'Títulos que você já terminou',
    icon: 'checkmark-done-outline' as const,
  },
  {
    key: 'watching',
    label: 'Assistindo atualmente',
    description: 'Animes que você está acompanhando',
    icon: 'play-outline' as const,
  },
  {
    key: 'planned',
    label: 'Planejo assistir',
    description: 'Sua próxima lista para assistir',
    icon: 'bookmark-outline' as const,
  },
] as const;

export type LocalAnimeListKey = (typeof localAnimeListOptions)[number]['key'];
export type LocalAnimeLists = Record<LocalAnimeListKey, AnimeInfo[]>;

export const emptyLocalAnimeLists: LocalAnimeLists = {
  completed: [],
  watching: [],
  planned: [],
};

const storageKey = 'anikeeper-local-anime-lists';

function isAnimeInfo(value: unknown): value is AnimeInfo {
  if (typeof value !== 'object' || value === null) return false;

  const anime = value as Partial<AnimeInfo>;
  return (
    typeof anime.id === 'string' &&
    typeof anime.title === 'string' &&
    typeof anime.originalTitle === 'string' &&
    typeof anime.type === 'string' &&
    typeof anime.year === 'number' &&
    typeof anime.episodes === 'number' &&
    typeof anime.rating === 'string' &&
    typeof anime.studio === 'string' &&
    typeof anime.synopsis === 'string' &&
    Array.isArray(anime.genres) &&
    Array.isArray(anime.colors) &&
    typeof anime.icon === 'string'
  );
}

function getAnimeEntries(value: unknown): AnimeInfo[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isAnimeInfo);
}

export async function getLocalAnimeLists(): Promise<LocalAnimeLists> {
  const storedLists = await AsyncStorage.getItem(storageKey);
  if (!storedLists) return emptyLocalAnimeLists;

  const parsedLists: unknown = JSON.parse(storedLists);
  if (typeof parsedLists !== 'object' || parsedLists === null)
    return emptyLocalAnimeLists;

  const savedLists = parsedLists as Partial<Record<LocalAnimeListKey, unknown>>;
  return {
    completed: getAnimeEntries(savedLists.completed),
    watching: getAnimeEntries(savedLists.watching),
    planned: getAnimeEntries(savedLists.planned),
  };
}

export async function addAnimeToLocalList(
  anime: AnimeInfo,
  listKey: LocalAnimeListKey,
): Promise<LocalAnimeLists> {
  const currentLists = await getLocalAnimeLists();
  const updatedLists: LocalAnimeLists = {
    completed: currentLists.completed.filter(
      (savedAnime) => savedAnime.id !== anime.id,
    ),
    watching: currentLists.watching.filter(
      (savedAnime) => savedAnime.id !== anime.id,
    ),
    planned: currentLists.planned.filter(
      (savedAnime) => savedAnime.id !== anime.id,
    ),
  };

  updatedLists[listKey] = [anime, ...updatedLists[listKey]];
  await AsyncStorage.setItem(storageKey, JSON.stringify(updatedLists));

  return updatedLists;
}

export async function removeAnimeFromLocalLists(
  animeId: string,
): Promise<LocalAnimeLists> {
  const currentLists = await getLocalAnimeLists();
  const updatedLists: LocalAnimeLists = {
    completed: currentLists.completed.filter((anime) => anime.id !== animeId),
    watching: currentLists.watching.filter((anime) => anime.id !== animeId),
    planned: currentLists.planned.filter((anime) => anime.id !== animeId),
  };

  await AsyncStorage.setItem(storageKey, JSON.stringify(updatedLists));
  return updatedLists;
}

export function getAnimeListStatus(
  lists: LocalAnimeLists,
  animeId: string,
): LocalAnimeListKey | null {
  for (const list of localAnimeListOptions) {
    if (lists[list.key].some((anime) => anime.id === animeId)) return list.key;
  }

  return null;
}
