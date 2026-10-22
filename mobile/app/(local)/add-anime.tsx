import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AnimeArtwork } from '@/src/components/AnimeArtwork';
import { Screen } from '@/src/components/Screen';
import { AnimeInfo } from '@/src/types/anime';
import { AnimeTypeFilter, searchAnime } from '@/src/data/kitsuApi';
import { useTheme } from '@/src/theme/ThemeContext';

const searchHistoryStorageKey = 'anikeeper-local-anime-search-history';
const typeFilters = ['Todos', 'Séries', 'Filmes'] as const;
type TypeFilter = (typeof typeFilters)[number];
type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

function isAnimeInfo(value: unknown): value is AnimeInfo {
  if (typeof value !== 'object' || value === null) return false;

  const anime = value as Partial<AnimeInfo>;
  return typeof anime.id === 'string'
    && typeof anime.title === 'string'
    && typeof anime.originalTitle === 'string'
    && typeof anime.type === 'string'
    && typeof anime.year === 'number'
    && typeof anime.episodes === 'number'
    && typeof anime.rating === 'string'
    && typeof anime.studio === 'string'
    && typeof anime.synopsis === 'string'
    && Array.isArray(anime.genres)
    && Array.isArray(anime.colors)
    && typeof anime.icon === 'string';
}

function getApiTypeFilter(filter: TypeFilter): AnimeTypeFilter {
  if (filter === 'Séries') return 'tv';
  if (filter === 'Filmes') return 'movie';
  return 'all';
}

export default function AddAnimeScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ query?: string | string[] }>();
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TypeFilter>('Todos');
  const [history, setHistory] = useState<AnimeInfo[]>([]);
  const [searchResults, setSearchResults] = useState<AnimeInfo[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const initialQuery = Array.isArray(params.query) ? params.query[0] : params.query;
    setQuery(initialQuery ?? '');
  }, [params.query]);

  useEffect(() => {
    AsyncStorage.getItem(searchHistoryStorageKey)
      .then((storedHistoryJson) => {
        if (!storedHistoryJson) return;

        const storedHistory: unknown = JSON.parse(storedHistoryJson);
        if (!Array.isArray(storedHistory)) return;

        const restoredHistory = storedHistory.filter(isAnimeInfo).slice(0, 6);
        setHistory(restoredHistory);
      })
      .catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setSearchResults([]);
      setSearchStatus('idle');
      setSearchError('');
      return;
    }

    const controller = new AbortController();
    setSearchStatus('loading');
    setSearchError('');

    const searchTimeout = setTimeout(() => {
      searchAnime(normalizedQuery, getApiTypeFilter(selectedFilter), controller.signal)
        .then((results) => {
          setSearchResults(results);
          setSearchStatus('success');
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setSearchError(error instanceof Error ? error.message : 'Ocorreu um erro ao pesquisar.');
          setSearchStatus('error');
        });
    }, 500);

    return () => {
      clearTimeout(searchTimeout);
      controller.abort();
    };
  }, [query, selectedFilter]);

  const openAnime = async (anime: AnimeInfo) => {
    const nextHistory = [anime, ...history.filter((recentAnime) => recentAnime.id !== anime.id)].slice(0, 6);
    setHistory(nextHistory);
    await AsyncStorage.setItem(searchHistoryStorageKey, JSON.stringify(nextHistory)).catch(() => undefined);
    router.push({ pathname: '/(local)/anime/[id]', params: { id: anime.id } });
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem(searchHistoryStorageKey).catch(() => undefined);
  };

  const normalizedQuery = query.trim();
  const hasSearchQuery = normalizedQuery.length >= 2;
  const visibleAnime = hasSearchQuery ? searchResults : normalizedQuery ? [] : history;
  const sectionTitle = normalizedQuery ? 'Resultados' : 'Pesquisados recentemente';

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.muted }]}>SUA PRÓXIMA HISTÓRIA</Text>
        <Text style={[styles.title, { color: colors.text }]}>Adicionar anime</Text>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={19} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Título, gênero ou nome original"
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
          accessibilityLabel="Pesquisar anime"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Limpar busca">
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>
      <Text style={[styles.helperText, { color: colors.muted }]}>
        {normalizedQuery.length === 1 ? 'Digite mais uma letra para pesquisar.' : 'Pesquise por título, gênero ou nome original.'}
      </Text>

      <View style={styles.filterRow}>
        {typeFilters.map((filter) => {
          const isSelected = selectedFilter === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[styles.filterChip, { backgroundColor: isSelected ? colors.accentSoft : colors.surface, borderColor: isSelected ? colors.accent : colors.border }]}
            >
              <Text style={[styles.filterText, { color: isSelected ? colors.accent : colors.muted }]}>{filter}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{sectionTitle}</Text>
        {!normalizedQuery && history.length > 0 && (
          <Pressable onPress={clearHistory} style={styles.clearHistory} accessibilityRole="button" accessibilityLabel="Limpar histórico">
            <Ionicons name="trash-outline" size={15} color={colors.muted} />
            <Text style={[styles.clearHistoryText, { color: colors.muted }]}>Limpar</Text>
          </Pressable>
        )}
      </View>

      {hasSearchQuery && searchStatus === 'loading' ? (
        <View style={[styles.statusState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ActivityIndicator color={colors.accent} />
          <Text style={[styles.emptyCopy, { color: colors.muted }]}>Buscando animes na Kitsu...</Text>
        </View>
      ) : hasSearchQuery && searchStatus === 'error' ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}><Ionicons name="cloud-offline-outline" size={20} color={colors.accent} /></View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Não foi possível pesquisar</Text>
          <Text style={[styles.emptyCopy, { color: colors.muted }]}>{searchError}</Text>
        </View>
      ) : hasSearchQuery && searchStatus === 'success' && searchResults.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}><Ionicons name="search-outline" size={20} color={colors.accent} /></View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum anime encontrado</Text>
          <Text style={[styles.emptyCopy, { color: colors.muted }]}>Tente pesquisar por outro título.</Text>
        </View>
      ) : visibleAnime.length > 0 ? visibleAnime.map((anime) => (
        <Pressable key={anime.id} onPress={() => openAnime(anime)} style={styles.resultRow} accessibilityRole="button" accessibilityLabel={`Abrir ${anime.title}`}>
          <AnimeArtwork anime={anime} width={55} height={72} />
          <View style={styles.resultCopy}>
            <Text numberOfLines={1} style={[styles.resultTitle, { color: colors.text }]}>{anime.title}</Text>
            <Text numberOfLines={1} style={[styles.resultOriginal, { color: colors.muted }]}>{anime.originalTitle}</Text>
            <View style={styles.resultMetadata}>
              <Text style={[styles.resultMetadataText, { color: colors.muted }]}>{anime.year || '—'} · {anime.type} · {anime.episodes || '—'} {anime.type === 'Filme' ? 'filme' : 'eps.'}</Text>
              <Ionicons name="star" size={11} color="#F1C66A" />
              <Text style={[styles.resultRating, { color: colors.text }]}>{anime.rating}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={17} color={colors.muted} />
        </Pressable>
      )) : (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft}]}><Ionicons name={normalizedQuery ? 'search-outline' : 'time-outline'} size={20} color={colors.accent} /></View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{normalizedQuery ? 'Digite ao menos 2 letras' : 'Seu histórico aparecerá aqui'}</Text>
          <Text style={[styles.emptyCopy, { color: colors.muted }]}>{normalizedQuery ? 'A busca na Kitsu começa após dois caracteres.' : 'Pesquise e abra um anime para guardar no histórico.'}</Text>
        </View>
      )}

      {!normalizedQuery && (
        <View style={[styles.catalogNote, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
          <Text style={[styles.catalogNoteText, { color: colors.accent }]}>Resultados e capas fornecidos pela Kitsu API.</Text>
        </View>
      )}
      <View style={{ height: 18 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 12, paddingBottom: 18 },
  header: { marginBottom: 21 },
  eyebrow: { fontSize: 8, fontWeight: '700', letterSpacing: 1.1, marginBottom: 4 },
  title: { fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
  searchBox: { minHeight: 52, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 12, paddingVertical: 13 },
  helperText: { fontSize: 10, marginTop: 8 },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 17 },
  filterChip: { paddingHorizontal: 13, paddingVertical: 9, borderWidth: 1, borderRadius: 11 },
  filterText: { fontSize: 10, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  clearHistory: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5 },
  clearHistoryText: { fontSize: 10, fontWeight: '600' },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  resultCopy: { flex: 1, gap: 4 },
  resultTitle: { fontSize: 12, fontWeight: '700' },
  resultOriginal: { fontSize: 10 },
  resultMetadata: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  resultMetadataText: { fontSize: 9, marginRight: 3 },
  resultRating: { fontSize: 9, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingHorizontal: 22, paddingVertical: 24, borderWidth: 1, borderRadius: 16, marginTop: 4 },
  statusState: { alignItems: 'center', paddingHorizontal: 22, paddingVertical: 24, borderWidth: 1, borderRadius: 16, marginTop: 4, gap: 12 },
  emptyIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  emptyTitle: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  emptyCopy: { fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 5 },
  catalogNote: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, marginTop: 20 },
  catalogNoteText: { fontSize: 10, fontWeight: '600' },
});
