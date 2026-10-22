import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AnimeCard } from '@/src/components/AnimeCard';
import { AnimeArtwork } from '@/src/components/AnimeArtwork';
import { Screen } from '@/src/components/Screen';
import { AnimeInfo } from '@/src/data/animeCatalog';
import { getRecommendedAnime } from '@/src/data/kitsuApi';
import { useTheme } from '@/src/theme/ThemeContext';

const collectionLists = [
  { label: 'Assistindo', count: 4, icon: 'play-circle-outline' as const, color: '#B59AF7' },
  { label: 'Quero assistir', count: 12, icon: 'bookmark-outline' as const, color: '#7FB8E8' },
  { label: 'Concluídos', count: 28, icon: 'checkmark-circle-outline' as const, color: '#8DD6B1' },
];

const currentAnime = {
  id: 'frieren',
  title: 'Frieren: Beyond Journey’s End',
  detail: 'Temporada 1 · Ep. 18 de 28',
  rating: '9.4',
  colors: ['#65746B', '#D4AF72'] as [string, string],
  icon: 'leaf-outline' as const,
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [recommendedAnime, setRecommendedAnime] = useState<AnimeInfo[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    getRecommendedAnime(controller.signal)
      .then(setRecommendedAnime)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setRecommendationsError(error instanceof Error ? error.message : 'Não foi possível carregar as recomendações.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingRecommendations(false);
      });

    return () => controller.abort();
  }, []);

  const openSearch = () => {
    const searchQuery = query.trim();
    router.push({ pathname: '/(app)/add-anime', params: searchQuery ? { query: searchQuery } : {} });
  };

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.muted }]}>ANIKEEPER</Text>
          <Text style={[styles.greeting, { color: colors.text }]}>Olá, Matheus <Text style={{ color: colors.accent }}>✦</Text></Text>
        </View>
        <Pressable onPress={() => router.push('/(app)/profile')} style={[styles.avatar, { backgroundColor: colors.accentSoft }]} accessibilityRole="button" accessibilityLabel="Abrir perfil">
          <Text style={[styles.avatarText, { color: colors.accent }]}>M</Text>
        </Pressable>
      </View>

      <Text style={[styles.intro, { color: colors.muted }]}>O que vamos assistir hoje?</Text>
      <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={openSearch}
          placeholder="Buscar anime, gênero..."
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
          accessibilityLabel="Buscar anime"
        />
        <Pressable onPress={openSearch} style={[styles.searchButton, { backgroundColor: colors.accentStrong }]} accessibilityRole="button" accessibilityLabel="Pesquisar">
          <Ionicons name="search" size={17} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.profileCardTop}>
          <View>
            <Text style={[styles.cardEyebrow, { color: colors.muted }]}>SUA JORNADA</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Sua coleção em um só lugar</Text>
          </View>
          <View style={[styles.journeyIcon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="sparkles" size={18} color={colors.accent} />
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>44</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>animes salvos</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>186</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>episódios vistos</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Suas listas</Text>
        <Pressable onPress={() => router.push('/(app)/mylist')} style={styles.linkButton} accessibilityRole="button">
          <Text style={[styles.linkText, { color: colors.accent }]}>Ver coleção</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.accent} />
        </Pressable>
      </View>
      <View style={styles.listGrid}>
        {collectionLists.map((list) => (
          <Pressable key={list.label} onPress={() => router.push('/(app)/mylist')} style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel={`Abrir lista ${list.label}`}>
            <Ionicons name={list.icon} size={19} color={list.color} />
            <Text style={[styles.listCount, { color: colors.text }]}>{list.count}</Text>
            <Text style={[styles.listLabel, { color: colors.muted }]}>{list.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Continue assistindo</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>Retome de onde você parou</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={19} color={colors.muted} />
      </View>
      <AnimeCard anime={currentAnime} onPress={() => router.push({ pathname: '/(app)/anime/[id]', params: { id: currentAnime.id } })} />

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mais bem avaliados</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>Sugestões para sua próxima maratona</Text>
        </View>
        <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
      </View>

      {isLoadingRecommendations ? (
        <View style={[styles.recommendationsStatus, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ActivityIndicator color={colors.accent} />
          <Text style={[styles.recommendationsStatusText, { color: colors.muted }]}>Carregando recomendações...</Text>
        </View>
      ) : recommendationsError ? (
        <View style={[styles.recommendationsStatus, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="cloud-offline-outline" size={19} color={colors.muted} />
          <Text style={[styles.recommendationsStatusText, { color: colors.muted }]}>{recommendationsError}</Text>
        </View>
      ) : recommendedAnime.length === 0 ? (
        <View style={[styles.recommendationsStatus, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.recommendationsStatusText, { color: colors.muted }]}>Nenhuma sugestão disponível agora.</Text>
        </View>
      ) : (
        <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationsRow}>
          {recommendedAnime.map((anime) => (
            <Pressable
              key={anime.id}
              onPress={() => router.push({ pathname: '/(app)/anime/[id]', params: { id: anime.id } })}
              style={styles.recommendationCard}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${anime.title}, nota ${anime.rating}`}
            >
              <AnimeArtwork anime={anime} width={108} height={142} />
              <Text numberOfLines={2} style={[styles.recommendationTitle, { color: colors.text }]}>{anime.title}</Text>
              <View style={styles.recommendationRating}>
                <Ionicons name="star" size={12} color="#F1C66A" />
                <Text style={[styles.recommendationRatingText, { color: colors.muted }]}>{anime.rating}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <View style={{ height: 18 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 14, paddingBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.4, marginBottom: 5 },
  greeting: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  avatar: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', fontSize: 17 },
  intro: { fontSize: 12, marginBottom: 10 },
  searchBox: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 5, paddingLeft: 14, borderWidth: 1, borderRadius: 15 },
  searchInput: { flex: 1, fontSize: 12, paddingVertical: 9 },
  searchButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  profileCard: { borderWidth: 1, borderRadius: 19, padding: 17, marginTop: 19 },
  profileCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardEyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginTop: 5 },
  journeyIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 17 },
  stat: { gap: 3 },
  statNumber: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10 },
  statDivider: { width: 1, height: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionSubtitle: { fontSize: 10, marginTop: 4 },
  recommendationsStatus: { minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 18, borderWidth: 1, borderRadius: 15 },
  recommendationsStatusText: { flexShrink: 1, fontSize: 11, lineHeight: 17 },
  recommendationsRow: { gap: 12, paddingRight: 2 },
  recommendationCard: { width: 108, gap: 7 },
  recommendationTitle: { minHeight: 32, fontSize: 11, lineHeight: 15, fontWeight: '700' },
  recommendationRating: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  recommendationRatingText: { fontSize: 10, fontWeight: '700' },
  linkButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  linkText: { fontSize: 10, fontWeight: '700' },
  listGrid: { flexDirection: 'row', gap: 9 },
  listCard: { flex: 1, minHeight: 94, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 15, borderWidth: 1, paddingHorizontal: 4, paddingVertical: 10 },
  listCount: { fontSize: 16, fontWeight: '800' },
  listLabel: { fontSize: 9, textAlign: 'center' },
});
