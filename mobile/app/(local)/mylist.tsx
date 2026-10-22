import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { AnimeArtwork } from '@/src/components/AnimeArtwork';
import { Screen } from '@/src/components/Screen';
import { ProfileSummaryCard } from '@/src/components/ProfileSummaryCard';
import { useAuth } from '@/src/auth/AuthContext';
import {
  emptyLocalAnimeLists,
  getLocalAnimeLists,
  LocalAnimeLists,
  localAnimeListOptions,
} from '@/src/data/localAnimeLists';
import { useTheme } from '@/src/theme/ThemeContext';

export default function MyListScreen() {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const { localName } = useAuth();
  const [selectedList, setSelectedList] =
    useState<(typeof localAnimeListOptions)[number]['key']>('completed');
  const [animeLists, setAnimeLists] =
    useState<LocalAnimeLists>(emptyLocalAnimeLists);
  const currentList = localAnimeListOptions.find(
    (list) => list.key === selectedList,
  )!;
  const currentAnime = animeLists[selectedList];
  const gridGap = 8;
  const cardPadding = 8;
  const cardWidth = (windowWidth - 48 - gridGap * 2) / 3;
  const artworkWidth = cardWidth - cardPadding * 2;
  const artworkHeight = artworkWidth * 1.35;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setAnimeLists(emptyLocalAnimeLists);
      getLocalAnimeLists(localName)
        .then((savedLists) => {
          if (isActive) setAnimeLists(savedLists);
        })
        .catch((error: unknown) => {
          if (isActive)
            Alert.alert(
              'Erro ao carregar listas',
              error instanceof Error
                ? error.message
                : 'Não foi possível ler seus animes salvos.',
            );
        });
      return () => {
        isActive = false;
      };
    }, [localName]),
  );

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.muted }]}>
          QUARTA-FEIRA, 20 OUT
        </Text>
      </View>
      <ProfileSummaryCard
        profileName={localName.trim() || 'Animeiro'}
        username={localName}
        description="No seu ritmo."
        topSpacing={0}
      />
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sua coleção
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
          Escolha uma lista para filtrar seus animes.
        </Text>
      </View>
      <View style={styles.tabs}>
        {localAnimeListOptions.map((list) => {
          const isSelected = selectedList === list.key;
          return (
            <Pressable
              key={list.key}
              onPress={() => setSelectedList(list.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.listTab,
                {
                  backgroundColor: isSelected
                    ? colors.accentSoft
                    : colors.surface,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.listIcon,
                  {
                    backgroundColor: isSelected
                      ? colors.accent
                      : colors.elevated,
                  },
                ]}
              >
                <Ionicons
                  name={list.icon}
                  size={18}
                  color={isSelected ? '#FFFFFF' : colors.muted}
                />
              </View>
              <View style={styles.listCopy}>
                <Text style={[styles.listTabText, { color: colors.text }]}>
                  {list.label}
                </Text>
                <Text style={[styles.listDescription, { color: colors.muted }]}>
                  {list.description}
                </Text>
              </View>
              <View
                style={[
                  styles.listCountBadge,
                  {
                    backgroundColor: isSelected
                      ? colors.accent
                      : colors.elevated,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.listCount,
                    { color: isSelected ? '#FFFFFF' : colors.muted },
                  ]}
                >
                  {animeLists[list.key].length}
                </Text>
              </View>
              {isSelected ? (
                <Ionicons
                  name="checkmark-circle"
                  size={19}
                  color={colors.accent}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.listHeading}>
        <Text style={[styles.listTitle, { color: colors.text }]}>
          {currentList.label}
        </Text>
        <Pressable style={styles.sort}>
          <Ionicons name="swap-vertical" size={15} color={colors.muted} />
          <Text style={[styles.sortText, { color: colors.muted }]}>
            Recentes
          </Text>
        </Pressable>
      </View>
      {currentAnime.length === 0 ? (
        <View
          style={[
            styles.emptyList,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="albums-outline" size={22} color={colors.muted} />
          <Text style={[styles.emptyListText, { color: colors.muted }]}>
            Ainda não há animes nesta lista.
          </Text>
        </View>
      ) : (
        <View style={styles.animeGrid}>
          {currentAnime.map((anime) => (
            <Pressable
              key={anime.id}
              onPress={() =>
                router.push({
                  pathname: '/(local)/anime/[id]',
                  params: { id: anime.id },
                })
              }
              style={[
                styles.animeCard,
                {
                  width: cardWidth,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  padding: cardPadding,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${anime.title}`}
            >
              <AnimeArtwork
                anime={anime}
                width={artworkWidth}
                height={artworkHeight}
              />
              <Text
                numberOfLines={2}
                style={[styles.animeTitle, { color: colors.text }]}
              >
                {anime.title}
              </Text>
              <View style={styles.animeRating}>
                <Ionicons name="star" size={12} color="#F1C66A" />
                <Text style={[styles.animeRatingText, { color: colors.muted }]}>
                  {anime.rating}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
      <View style={{ height: 18 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 14, paddingBottom: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 6,
  },
  sectionHeader: { marginTop: 29, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionSubtitle: { fontSize: 11, marginTop: 4 },
  tabs: { gap: 9 },
  listTab: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
  },
  listIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCopy: { flex: 1, gap: 4 },
  listTabText: { fontSize: 13, fontWeight: '700' },
  listDescription: { fontSize: 10 },
  listCountBadge: {
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 7,
  },
  listCount: { fontSize: 11, fontWeight: '700' },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
  },
  listTitle: { fontSize: 15, fontWeight: '700' },
  sort: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontSize: 11 },
  emptyList: {
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 15,
  },
  emptyListText: { fontSize: 11 },
  animeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  animeCard: {
    alignItems: 'stretch',
    gap: 7,
    borderWidth: 1,
    borderRadius: 14,
  },
  animeTitle: { fontSize: 11, lineHeight: 15, fontWeight: '700' },
  animeRating: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  animeRatingText: { fontSize: 10, fontWeight: '600' },
});
