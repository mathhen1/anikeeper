import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AnimeArtwork } from '@/src/components/AnimeArtwork';
import { Screen } from '@/src/components/Screen';
import { AnimeInfo, findAnimeById } from '@/src/data/animeCatalog';
import { getAnimeById } from '@/src/data/kitsuApi';
import { useTheme } from '@/src/theme/ThemeContext';

const listOptions = [
  { id: 'watched', label: 'Assistidos', icon: 'checkmark-done-outline' as const },
  { id: 'watching', label: 'Assistindo', icon: 'play-circle-outline' as const },
  { id: 'planned', label: 'Pretendo assistir', icon: 'time-outline' as const },
];

export default function AnimeDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const localAnime = findAnimeById(id);
  const { colors } = useTheme();
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [remoteAnime, setRemoteAnime] = useState<AnimeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!id || localAnime) {
      setRemoteAnime(null);
      setIsLoading(false);
      setLoadError('');
      return;
    }

    const controller = new AbortController();
    setRemoteAnime(null);
    setIsLoading(true);
    setLoadError('');

    getAnimeById(id, controller.signal)
      .then(setRemoteAnime)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar este anime.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, localAnime]);

  const anime = localAnime ?? remoteAnime;

  if (!anime && isLoading) {
    return <Screen style={styles.notFound}><ActivityIndicator color={colors.accent} /></Screen>;
  }

  if (!anime) {
    return (
      <Screen style={styles.notFound}>
        <Ionicons name={loadError ? 'cloud-offline-outline' : 'search-outline'} size={32} color={colors.muted} />
        <Text style={[styles.notFoundText, { color: colors.text }]}>Anime não encontrado</Text>
        {loadError ? <Text style={[styles.notFoundText, { color: colors.muted }]}>{loadError}</Text> : null}
        <Pressable onPress={() => router.back()}><Text style={{ color: colors.accent }}>Voltar</Text></Pressable>
      </Screen>
    );
  }

  const selectedOption = listOptions.find((option) => option.id === selectedList);

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.navigationRow}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface }]} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.navigationTitle, { color: colors.muted }]}>DETALHES DO ANIME</Text>
        <Pressable style={[styles.moreButton, { backgroundColor: colors.surface }]} accessibilityRole="button" accessibilityLabel="Mais opções">
          <Ionicons name="ellipsis-horizontal" size={19} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <AnimeArtwork anime={anime} width={118} height={158} />
        <View style={styles.heroCopy}>
          <View style={[styles.typeBadge, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.typeText, { color: colors.accent }]}>{anime.type.toUpperCase()}</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{anime.title}</Text>
          <Text style={[styles.originalTitle, { color: colors.muted }]}>{anime.originalTitle}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={15} color="#F1C66A" />
            <Text style={[styles.rating, { color: colors.text }]}>{anime.rating}</Text>
            <Text style={[styles.ratingCaption, { color: colors.muted }]}>nota da comunidade</Text>
          </View>
        </View>
      </View>

      <View style={[styles.metadataCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.metadataItem}><Text style={[styles.metadataValue, { color: colors.text }]}>{anime.year}</Text><Text style={[styles.metadataLabel, { color: colors.muted }]}>ANO</Text></View>
        <View style={[styles.metadataDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metadataItem}><Text style={[styles.metadataValue, { color: colors.text }]}>{anime.episodes}</Text><Text style={[styles.metadataLabel, { color: colors.muted }]}>{anime.type === 'Filme' ? 'FILME' : 'EPISÓDIOS'}</Text></View>
        <View style={[styles.metadataDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metadataItem}><Text style={[styles.metadataValue, { color: colors.text }]} numberOfLines={1}>{anime.studio}</Text><Text style={[styles.metadataLabel, { color: colors.muted }]}>ESTÚDIO</Text></View>
      </View>

      <Pressable
        onPress={() => setIsListMenuOpen((isOpen) => !isOpen)}
        style={[styles.addToListButton, { backgroundColor: colors.accentStrong }]}
        accessibilityRole="button"
        accessibilityLabel={selectedOption ? `Na lista ${selectedOption.label}` : 'Adicionar à lista'}
      >
        <Ionicons name={selectedOption ? 'checkmark-circle-outline' : 'add-circle-outline'} size={20} color="#FFFFFF" />
        <Text style={styles.addToListText}>{selectedOption ? `Na lista: ${selectedOption.label}` : 'Adicionar à lista'}</Text>
        <Ionicons name={isListMenuOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#FFFFFF" />
      </Pressable>

      {isListMenuOpen && (
        <View style={[styles.listMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {listOptions.map((option, index) => (
            <Pressable
              key={option.id}
              onPress={() => { setSelectedList(option.id); setIsListMenuOpen(false); }}
              style={[styles.listOption, index < listOptions.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
            >
              <View style={[styles.optionIcon, { backgroundColor: colors.accentSoft }]}><Ionicons name={option.icon} size={17} color={colors.accent} /></View>
              <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
              {selectedList === option.id && <Ionicons name="checkmark" size={18} color={colors.accent} />}
            </Pressable>
          ))}
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Sinopse</Text>
      <Text style={[styles.synopsis, { color: colors.muted }]}>{anime.synopsis}</Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Gêneros</Text>
      <View style={styles.genreRow}>
        {anime.genres.map((genre) => <View key={genre} style={[styles.genreChip, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.genreText, { color: colors.muted }]}>{genre}</Text></View>)}
      </View>
      <View style={{ height: 18 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 12, paddingBottom: 18 },
  navigationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  backButton: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  navigationTitle: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  moreButton: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroCopy: { flex: 1, alignItems: 'flex-start' },
  typeBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, marginBottom: 9 },
  typeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  title: { fontSize: 19, lineHeight: 24, fontWeight: '800', letterSpacing: -0.4 },
  originalTitle: { fontSize: 11, marginTop: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12 },
  rating: { fontSize: 14, fontWeight: '800' },
  ratingCaption: { fontSize: 10, marginLeft: 2 },
  metadataCard: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 20, paddingVertical: 15, borderWidth: 1, borderRadius: 16 },
  metadataItem: { flex: 1, alignItems: 'center', gap: 5 },
  metadataValue: { fontSize: 12, fontWeight: '700' },
  metadataLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  metadataDivider: { height: 30, width: 1 },
  addToListButton: { minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 14, borderRadius: 14, marginTop: 16 },
  addToListText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', flex: 1 },
  listMenu: { borderWidth: 1, borderRadius: 15, paddingHorizontal: 13, marginTop: 9 },
  listOption: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 11 },
  optionIcon: { width: 31, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  optionLabel: { flex: 1, fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 9 },
  synopsis: { fontSize: 12, lineHeight: 19 },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genreChip: { paddingHorizontal: 11, paddingVertical: 8, borderWidth: 1, borderRadius: 11 },
  genreText: { fontSize: 10, fontWeight: '600' },
  notFound: { alignItems: 'center', justifyContent: 'center', gap: 14 },
  notFoundText: { fontSize: 16, fontWeight: '700' },
});
