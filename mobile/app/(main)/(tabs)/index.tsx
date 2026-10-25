import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AnimeArtwork } from '@/src/components/AnimeArtwork';
import {
  AnimeListSummaryCard,
  type AnimeListSummaryItem,
} from '@/src/components/AnimeListSummaryCard';
import { Screen } from '@/src/components/Screen';
import { ProfileSummaryCard } from '@/src/components/ProfileSummaryCard';
import { AnimeInfo } from '@/src/types/anime';
import {
  getMostFavoritedAnime,
  getMostPopularAnime,
  getTopRatedAnime,
} from '@/src/data/kitsuApi';
import { useAuth } from '@/src/auth/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';

const collectionLists = [
  {
    label: 'Animes concluídos',
    key: 'completed',
    icon: 'checkmark-circle-outline' as const,
    color: '#8DD6B1',
  }, {
    label: 'Planejo assistir',
    key: 'planned',
    icon: 'bookmark-outline' as const,
    color: '#7FB8E8',
  },
  {
    label: 'Assistindo agora',
    key: 'watching',
    icon: 'play-circle-outline' as const,
    color: '#B59AF7',
  },

] satisfies readonly AnimeListSummaryItem[];

type AnimeRecommendationState = {
  items: AnimeInfo[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string;
  loadMoreError: string;
};

async function loadNextRecommendationPage(
  recommendation: AnimeRecommendationState,
  setRecommendation: Dispatch<SetStateAction<AnimeRecommendationState>>,
  fetchPage: (signal: AbortSignal, offset: number) => Promise<AnimeInfo[]>,
) {
  if (recommendation.isLoadingMore || !recommendation.hasMore) return;

  setRecommendation((current) => ({
    ...current,
    isLoadingMore: true,
    loadMoreError: '',
  }));

  try {
    const nextItems = await fetchPage(
      new AbortController().signal,
      recommendation.items.length,
    );

    setRecommendation((current) => ({
      ...current,
      items: [...current.items, ...nextItems],
      isLoadingMore: false,
      hasMore: nextItems.length === 8,
    }));
  } catch (error: unknown) {
    setRecommendation((current) => ({
      ...current,
      isLoadingMore: false,
      loadMoreError:
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar mais animes.',
    }));
  }
}

function AnimeRecommendationSection({
  title,
  subtitle,
  icon,
  recommendation,
  onLoadMore,
}: {
  title: string;
  subtitle: string;
  icon: 'heart-outline' | 'star-outline' | 'trending-up-outline';
  recommendation: AnimeRecommendationState;
  onLoadMore: () => void;
}) {
  const { colors } = useTheme();

  return (
    <>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>

      {recommendation.isLoading ? (
        <View
          style={[
            styles.recommendationsStatus,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <ActivityIndicator color={colors.accent} />
          <Text
            style={[styles.recommendationsStatusText, { color: colors.muted }]}
          >
            Carregando animes...
          </Text>
        </View>
      ) : recommendation.error ? (
        <View
          style={[
            styles.recommendationsStatus,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="cloud-offline-outline"
            size={19}
            color={colors.muted}
          />
          <Text
            style={[styles.recommendationsStatusText, { color: colors.muted }]}
          >
            {recommendation.error}
          </Text>
        </View>
      ) : recommendation.items.length === 0 ? (
        <View
          style={[
            styles.recommendationsStatus,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text
            style={[styles.recommendationsStatusText, { color: colors.muted }]}
          >
            Nenhum anime disponível agora.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendationsRow}
        >
          {recommendation.items.map((anime) => (
            <Pressable
              key={anime.id}
              onPress={() =>
                router.push({
                  pathname: '/(main)/anime/[id]',
                  params: { id: anime.id },
                })
              }
              style={styles.recommendationCard}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${anime.title}, nota ${anime.rating}`}
            >
              <AnimeArtwork anime={anime} width={108} height={142} />
              <Text
                numberOfLines={2}
                style={[styles.recommendationTitle, { color: colors.text }]}
              >
                {anime.title}
              </Text>
              <View style={styles.recommendationRating}>
                <Ionicons name="star" size={12} color="#F1C66A" />
                <Text
                  style={[
                    styles.recommendationRatingText,
                    { color: colors.muted },
                  ]}
                >
                  {anime.rating}
                </Text>
              </View>
            </Pressable>
          ))}
          {recommendation.hasMore && (
            <Pressable
              onPress={onLoadMore}
              disabled={recommendation.isLoadingMore}
              style={({ pressed }) => [
                styles.loadMoreButton,
                {
                  opacity: pressed || recommendation.isLoadingMore ? 0.55 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                recommendation.isLoadingMore
                  ? 'Carregando mais animes'
                  : recommendation.loadMoreError
                    ? 'Tentar carregar mais animes novamente'
                    : 'Carregar mais animes'
              }
            >
              {recommendation.isLoadingMore ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={25}
                  color={colors.accent}
                />
              )}
            </Pressable>
          )}
        </ScrollView>
      )}
      {recommendation.loadMoreError ? (
        <Text style={[styles.loadMoreError, { color: colors.muted }]}>
          {recommendation.loadMoreError}
        </Text>
      ) : null}
    </>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { authMode, localName, officialUsername } = useAuth();
  const profileName =
    authMode === 'official' ? officialUsername : localName;
  const [mostFavorited, setMostFavorited] = useState<AnimeRecommendationState>({
    items: [],
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    error: '',
    loadMoreError: '',
  });
  const [topRated, setTopRated] = useState<AnimeRecommendationState>({
    items: [],
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    error: '',
    loadMoreError: '',
  });
  const [mostPopular, setMostPopular] = useState<AnimeRecommendationState>({
    items: [],
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    error: '',
    loadMoreError: '',
  });
  useEffect(() => {
    const controller = new AbortController();

    getMostFavoritedAnime(controller.signal)
      .then((items) => setMostFavorited((current) => ({
        ...current,
        items,
        isLoading: false,
        hasMore: items.length === 8,
        error: '',
      })))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setMostFavorited({
          items: [],
          isLoading: false,
          isLoadingMore: false,
          hasMore: false,
          error:
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os favoritos.',
          loadMoreError: '',
        });
      });

    getTopRatedAnime(controller.signal)
      .then((items) => setTopRated((current) => ({
        ...current,
        items,
        isLoading: false,
        hasMore: items.length === 8,
        error: '',
      })))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setTopRated({
          items: [],
          isLoading: false,
          isLoadingMore: false,
          hasMore: false,
          error:
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os mais bem avaliados.',
          loadMoreError: '',
        });
      });

    getMostPopularAnime(controller.signal)
      .then((items) => setMostPopular((current) => ({
        ...current,
        items,
        isLoading: false,
        hasMore: items.length === 8,
        error: '',
      })))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setMostPopular({
          items: [],
          isLoading: false,
          isLoadingMore: false,
          hasMore: false,
          error:
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os populares.',
          loadMoreError: '',
        });
      });

    return () => controller.abort();
  }, []);

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.muted }]}>ANIKEEPER</Text>
      </View>

      <Pressable
        onPress={() => router.push('/(main)/add-anime')}
        style={({ pressed }) => [
          styles.searchCard,
          {
            backgroundColor: colors.input,
            borderColor: pressed ? colors.accent : colors.border,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Buscar anime"
        accessibilityHint="Abre a tela de pesquisa de animes"
      >
        <Text style={[styles.searchCardText, { color: colors.muted }]}>
          Buscar anime
        </Text>
        <View
          style={[styles.searchIcon, { backgroundColor: colors.accentSoft }]}
        >
          <Ionicons name="search" size={18} color={colors.accent} />
        </View>
      </Pressable>

      <ProfileSummaryCard
        profileName={profileName.trim() || 'Animeiro'}
        username={localName}
        description="Sua coleção em um só lugar"
      />

      <AnimeListSummaryCard
        username={localName}
        items={collectionLists}
        onPress={() => router.push('/(main)/mylist')}
      />
      <AnimeRecommendationSection
        title="Favoritos da galera"
        subtitle="Os mais favoritados na Kitsu"
        icon="heart-outline"
        recommendation={mostFavorited}
        onLoadMore={() =>
          loadNextRecommendationPage(
            mostFavorited,
            setMostFavorited,
            getMostFavoritedAnime,
          )
        }
      />
      <View
        style={[styles.sectionDivider, { backgroundColor: colors.border }]}
      />
      <AnimeRecommendationSection
        title="Mais bem avaliados"
        subtitle="As maiores notas na Kitsu"
        icon="star-outline"
        recommendation={topRated}
        onLoadMore={() =>
          loadNextRecommendationPage(topRated, setTopRated, getTopRatedAnime)
        }
      />
      <View
        style={[styles.sectionDivider, { backgroundColor: colors.border }]}
      />
      <AnimeRecommendationSection
        title="Mais populares"
        subtitle="Os animes mais acompanhados"
        icon="trending-up-outline"
        recommendation={mostPopular}
        onLoadMore={() =>
          loadNextRecommendationPage(
            mostPopular,
            setMostPopular,
            getMostPopularAnime,
          )
        }
      />
      <View style={{ height: 18 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 14, paddingBottom: 18 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  searchCard: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 13,
  },
  searchCardText: { fontSize: 13, fontWeight: '500' },
  searchIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionSubtitle: { fontSize: 10, marginTop: 4 },
  recommendationsStatus: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 15,
  },
  recommendationsStatusText: { flexShrink: 1, fontSize: 11, lineHeight: 17 },
  recommendationsRow: { gap: 12, paddingRight: 2 },
  recommendationCard: { width: 108, gap: 7 },
  sectionDivider: {
    height: 1,
    marginTop: 24,
    opacity: 0.45,
  },
  loadMoreButton: {
    width: 42,
    height: 44,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  loadMoreError: { fontSize: 10, marginTop: 7 },
  recommendationTitle: {
    minHeight: 32,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  recommendationRating: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  recommendationRatingText: { fontSize: 10, fontWeight: '700' },
});
