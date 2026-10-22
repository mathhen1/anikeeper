import { AnimeInfo } from '@/src/types/anime';

const apiBaseUrl = 'https://kitsu.io/api/edge';
const requestTimeoutMs = 15_000;

export type AnimeTypeFilter = 'all' | 'tv' | 'movie';

type KitsuAnime = {
  id: string;
  attributes: {
    titles?: {
      en?: string | null;
      en_jp?: string | null;
      ja_jp?: string | null;
    };
    canonicalTitle?: string | null;
    subtype?: string | null;
    episodeCount?: number | null;
    averageRating?: string | null;
    startDate?: string | null;
    posterImage?: {
      original?: string | null;
      large?: string | null;
      small?: string | null;
    } | null;
    synopsis?: string | null;
  };
};

type KitsuSearchResponse = {
  data: KitsuAnime[];
};

function toAnimeInfo(anime: KitsuAnime): AnimeInfo {
  const attributes = anime.attributes;
  const title = attributes.titles?.en || attributes.canonicalTitle || 'Título indisponível';
  const originalTitle = attributes.titles?.ja_jp || attributes.titles?.en_jp || title;
  const score = attributes.averageRating ? Number(attributes.averageRating) / 10 : null;

  return {
    id: anime.id,
    title,
    originalTitle,
    type: attributes.subtype?.toLowerCase() === 'movie' ? 'Filme' : 'Série',
    year: attributes.startDate ? new Date(attributes.startDate).getFullYear() : 0,
    episodes: attributes.episodeCount ?? 0,
    rating: score && Number.isFinite(score) ? score.toFixed(1) : '—',
    studio: 'Desconhecido',
    synopsis: attributes.synopsis || 'Sinopse indisponível.',
    genres: [],
    colors: ['#4E5368', '#B59AF7'],
    icon: 'sparkles-outline',
    imageUrl: attributes.posterImage?.original ?? attributes.posterImage?.large ?? attributes.posterImage?.small ?? null,
  };
}

async function requestKitsu<T>(path: string, signal: AbortSignal): Promise<T> {
  const requestController = new AbortController();
  const abortRequest = () => requestController.abort();
  const timeout = setTimeout(abortRequest, requestTimeoutMs);
  signal.addEventListener('abort', abortRequest, { once: true });

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      signal: requestController.signal,
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Muitas buscas em sequência. Aguarde um instante e tente novamente.');
      }

      throw new Error(`A Kitsu respondeu com erro (${response.status}). Tente novamente em instantes.`);
    }

    return await response.json() as T;
  } catch (error) {
    if (signal.aborted) throw error;
    if (requestController.signal.aborted) {
      throw new Error('A API demorou para responder. Verifique sua conexão e tente novamente.');
    }
    if (error instanceof TypeError) {
      throw new Error('Não foi possível conectar à Kitsu. Verifique sua conexão com a internet.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', abortRequest);
  }
}

export async function searchAnime(
  query: string,
  type: AnimeTypeFilter,
  signal: AbortSignal,
): Promise<AnimeInfo[]> {
  const searchParams = new URLSearchParams({
    'filter[text]': query,
    'page[limit]': '5',
  });

  if (type !== 'all') {
    searchParams.set('filter[subtype]', type === 'tv' ? 'TV' : 'movie');
  }

  const response = await requestKitsu<KitsuSearchResponse>(`/anime?${searchParams.toString()}`, signal);
  return response.data.map(toAnimeInfo);
}

async function getTopAnime(sort: string, signal: AbortSignal): Promise<AnimeInfo[]> {
  const searchParams = new URLSearchParams({
    sort,
    'page[limit]': '8',
  });

  const response = await requestKitsu<KitsuSearchResponse>(`/anime?${searchParams.toString()}`, signal);
  return response.data.map(toAnimeInfo);
}

export function getMostFavoritedAnime(signal: AbortSignal): Promise<AnimeInfo[]> {
  return getTopAnime('-favoritesCount', signal);
}

export function getTopRatedAnime(signal: AbortSignal): Promise<AnimeInfo[]> {
  return getTopAnime('-averageRating', signal);
}

export function getMostPopularAnime(signal: AbortSignal): Promise<AnimeInfo[]> {
  return getTopAnime('popularityRank', signal);
}

export async function getAnimeById(id: string, signal: AbortSignal): Promise<AnimeInfo> {
  const response = await requestKitsu<{ data: KitsuAnime }>(`/anime/${encodeURIComponent(id)}`, signal);
  return toAnimeInfo(response.data);
}
