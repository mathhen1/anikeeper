import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AnimeArtwork } from '@/src/components/AnimeArtwork';
import { Screen } from '@/src/components/Screen';
import { animeCatalog, AnimeInfo } from '@/src/data/animeCatalog';
import { useTheme } from '@/src/theme/ThemeContext';

const searchHistoryStorageKey = 'anikeeper-anime-search-history';
const typeFilters = ['Todos', 'Séries', 'Filmes'] as const;
type TypeFilter = (typeof typeFilters)[number];

export default function AddAnimeScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TypeFilter>('Todos');
  const [history, setHistory] = useState<AnimeInfo[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(searchHistoryStorageKey)
      .then((storedIds) => {
        if (!storedIds) return;
        const historyIds = JSON.parse(storedIds) as string[];
        setHistory(historyIds.map((id) => animeCatalog.find((anime) => anime.id === id)).filter((anime): anime is AnimeInfo => Boolean(anime)));
      })
      .catch(() => setHistory([]));
  }, []);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return [];

    return animeCatalog.filter((anime) => {
      const matchesQuery = [anime.title, anime.originalTitle, ...anime.genres]
        .some((field) => field.toLocaleLowerCase().includes(normalizedQuery));
      const matchesType = selectedFilter === 'Todos'
        || (selectedFilter === 'Filmes' && anime.type === 'Filme')
        || (selectedFilter === 'Séries' && anime.type === 'Série');
      return matchesQuery && matchesType;
    });
  }, [query, selectedFilter]);

  const openAnime = async (anime: AnimeInfo) => {
    const nextHistory = [anime, ...history.filter((recentAnime) => recentAnime.id !== anime.id)].slice(0, 6);
    setHistory(nextHistory);
    await AsyncStorage.setItem(searchHistoryStorageKey, JSON.stringify(nextHistory.map((recentAnime) => recentAnime.id))).catch(() => undefined);
    router.push({ pathname: '/(app)/anime/[id]', params: { id: anime.id } });
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem(searchHistoryStorageKey).catch(() => undefined);
  };

  const visibleAnime = query.trim() ? searchResults : history;
  const sectionTitle = query.trim() ? 'Resultados' : 'Pesquisados recentemente';

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface }]} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: colors.muted }]}>SUA PRÓXIMA HISTÓRIA</Text>
          <Text style={[styles.title, { color: colors.text }]}>Adicionar anime</Text>
        </View>
        <View style={{ width: 38 }} />
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
        {query.length > 0 && <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Limpar busca"><Ionicons name="close-circle" size={18} color={colors.muted} /></Pressable>}
      </View>
      <Text style={[styles.helperText, { color: colors.muted }]}>Pesquise por título, gênero ou nome original.</Text>

      <View style={styles.filterRow}>
        {typeFilters.map((filter) => {
          const isSelected = selectedFilter === filter;
          return <Pressable key={filter} onPress={() => setSelectedFilter(filter)} style={[styles.filterChip, { backgroundColor: isSelected ? colors.accentSoft : colors.surface, borderColor: isSelected ? colors.accent : colors.border }]}><Text style={[styles.filterText, { color: isSelected ? colors.accent : colors.muted }]}>{filter}</Text></Pressable>;
        })}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{sectionTitle}</Text>
        {!query.trim() && history.length > 0 && <Pressable onPress={clearHistory} style={styles.clearHistory} accessibilityRole="button" accessibilityLabel="Limpar histórico"><Ionicons name="trash-outline" size={15} color={colors.muted} /><Text style={[styles.clearHistoryText, { color: colors.muted }]}>Limpar</Text></Pressable>}
      </View>

      {visibleAnime.length > 0 ? visibleAnime.map((anime) => (
        <Pressable key={anime.id} onPress={() => openAnime(anime)} style={styles.resultRow} accessibilityRole="button" accessibilityLabel={`Abrir ${anime.title}`}>
          <AnimeArtwork anime={anime} width={55} height={72} />
          <View style={styles.resultCopy}>
            <Text numberOfLines={1} style={[styles.resultTitle, { color: colors.text }]}>{anime.title}</Text>
            <Text numberOfLines={1} style={[styles.resultOriginal, { color: colors.muted }]}>{anime.originalTitle}</Text>
            <View style={styles.resultMetadata}>
              <Text style={[styles.resultMetadataText, { color: colors.muted }]}>{anime.year} · {anime.type} · {anime.episodes} {anime.type === 'Filme' ? 'filme' : 'eps.'}</Text>
              <Ionicons name="star" size={11} color="#F1C66A" />
              <Text style={[styles.resultRating, { color: colors.text }]}>{anime.rating}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={17} color={colors.muted} />
        </Pressable>
      )) : (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}><Ionicons name={query.trim() ? 'search-outline' : 'time-outline'} size={20} color={colors.accent} /></View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{query.trim() ? 'Nenhum anime encontrado' : 'Seu histórico aparecerá aqui'}</Text>
          <Text style={[styles.emptyCopy, { color: colors.muted }]}>{query.trim() ? 'Tente outro título ou gênero.' : 'Pesquise e abra um anime para guardar no histórico.'}</Text>
        </View>
      )}

      {!query.trim() && (
        <View style={[styles.catalogNote, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
          <Text style={[styles.catalogNoteText, { color: colors.accent }]}>Catálogo de demonstração com busca local.</Text>
        </View>
      )}
      <View style={{ height: 18 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 12, paddingBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 21 },
  backButton: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { alignItems: 'center' },
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
  emptyIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  emptyTitle: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  emptyCopy: { fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 5 },
  catalogNote: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, marginTop: 20 },
  catalogNoteText: { fontSize: 10, fontWeight: '600' },
});
