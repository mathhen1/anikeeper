import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AnimeArtwork } from '@/src/components/AnimeArtwork';
import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/auth/AuthContext';
import { emptyLocalAnimeLists, getLocalAnimeLists, LocalAnimeLists, localAnimeListOptions } from '@/src/data/localAnimeLists';
import { useTheme } from '@/src/theme/ThemeContext';

export default function MyListScreen() {
  const { colors } = useTheme();
  const { localName } = useAuth();
  const displayName = localName.trim().split(/\s+/)[0] || 'Animeiro';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const [selectedList, setSelectedList] = useState<(typeof localAnimeListOptions)[number]['key']>('watching');
  const [animeLists, setAnimeLists] = useState<LocalAnimeLists>(emptyLocalAnimeLists);
  const currentList = localAnimeListOptions.find((list) => list.key === selectedList)!;
  const currentAnime = animeLists[selectedList];
  const savedAnimeCount = animeLists.completed.length + animeLists.watching.length + animeLists.planned.length;

  useFocusEffect(useCallback(() => {
    let isActive = true;
    getLocalAnimeLists().then((savedLists) => {
      if (isActive) setAnimeLists(savedLists);
    }).catch((error: unknown) => {
      if (isActive) Alert.alert('Erro ao carregar listas', error instanceof Error ? error.message : 'Não foi possível ler seus animes salvos.');
    });
    return () => { isActive = false; };
  }, []));

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <View><Text style={[styles.eyebrow, { color: colors.muted }]}>QUARTA-FEIRA, 20 OUT</Text><Text style={[styles.greeting, { color: colors.text }]}>Olá, {displayName} <Text>✦</Text></Text></View>
        <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}><Text style={[styles.avatarText, { color: colors.accent }]}>{avatarInitial}</Text></View>
      </View>
      <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.summaryTop}><View><Text style={[styles.summaryLabel, { color: colors.accent }]}>PROFILE</Text><Text style={[styles.summaryTitle, { color: colors.text }]}>No seu ritmo.</Text></View></View>
        <View style={styles.statsRow}>
          <View><Text style={[styles.statNumber, { color: colors.text }]}>{savedAnimeCount}</Text><Text style={[styles.statLabel, { color: colors.muted }]}>animes salvos</Text></View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View><Text style={[styles.statNumber, { color: colors.text }]}>0</Text><Text style={[styles.statLabel, { color: colors.muted }]}>total de episódios</Text></View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View><Text style={[styles.statNumber, { color: colors.text }]}>—</Text><Text style={[styles.statLabel, { color: colors.muted }]}>horas assistidas</Text></View>
        </View>
      </View>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sua coleção</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>Escolha uma lista para filtrar seus animes.</Text>
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
              style={[styles.listTab, { backgroundColor: isSelected ? colors.accentSoft : colors.surface, borderColor: isSelected ? colors.accent : colors.border }]}
            >
              <View style={[styles.listIcon, { backgroundColor: isSelected ? colors.accent : colors.elevated }]}>
                <Ionicons name={list.icon} size={18} color={isSelected ? '#FFFFFF' : colors.muted} />
              </View>
              <View style={styles.listCopy}>
                <Text style={[styles.listTabText, { color: colors.text }]}>{list.label}</Text>
                <Text style={[styles.listDescription, { color: colors.muted }]}>{list.description}</Text>
              </View>
              <View style={[styles.listCountBadge, { backgroundColor: isSelected ? colors.accent : colors.elevated }]}>
                <Text style={[styles.listCount, { color: isSelected ? '#FFFFFF' : colors.muted }]}>{animeLists[list.key].length}</Text>
              </View>
              {isSelected ? <Ionicons name="checkmark-circle" size={19} color={colors.accent} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.listHeading}><Text style={[styles.listTitle, { color: colors.text }]}>{currentList.label}</Text><Pressable style={styles.sort}><Ionicons name="swap-vertical" size={15} color={colors.muted} /><Text style={[styles.sortText, { color: colors.muted }]}>Recentes</Text></Pressable></View>
      {currentAnime.length === 0 ? (
        <View style={[styles.emptyList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="albums-outline" size={22} color={colors.muted} />
          <Text style={[styles.emptyListText, { color: colors.muted }]}>Ainda não há animes nesta lista.</Text>
        </View>
      ) : (
        <View style={styles.animeList}>
          {currentAnime.map((anime) => (
            <Pressable
              key={anime.id}
              onPress={() => router.push({ pathname: '/(local)/anime/[id]', params: { id: anime.id } })}
              style={[styles.animeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${anime.title}`}
            >
              <AnimeArtwork anime={anime} width={58} height={76} />
              <View style={styles.animeCopy}>
                <Text numberOfLines={2} style={[styles.animeTitle, { color: colors.text }]}>{anime.title}</Text>
                <Text numberOfLines={1} style={[styles.animeDetails, { color: colors.muted }]}>{anime.year} · {anime.type} · {anime.episodes} eps.</Text>
                <View style={styles.animeRating}><Ionicons name="star" size={12} color="#F1C66A" /><Text style={[styles.animeRatingText, { color: colors.muted }]}>{anime.rating}</Text></View>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      )}
      <View style={{ height: 18 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { paddingTop: 14, paddingBottom: 12 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }, eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.3, marginBottom: 6 }, greeting: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }, avatar: { width: 42, height: 42, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }, avatarText: { fontWeight: '800', fontSize: 17 }, summary: { borderRadius: 20, padding: 18, borderWidth: 1 }, summaryTop: { flexDirection: 'row', alignItems: 'center' }, summaryLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2 }, summaryTitle: { fontSize: 18, fontWeight: '700', marginTop: 4 }, statsRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 18 }, statNumber: { fontSize: 19, fontWeight: '800' }, statLabel: { fontSize: 10, marginTop: 3 }, statDivider: { height: 31, width: 1 }, sectionHeader: { marginTop: 29, marginBottom: 12 }, sectionTitle: { fontSize: 18, fontWeight: '700' }, sectionSubtitle: { fontSize: 11, marginTop: 4 }, tabs: { gap: 9 }, listTab: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 15, borderWidth: 1 }, listIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, listCopy: { flex: 1, gap: 4 }, listTabText: { fontSize: 13, fontWeight: '700' }, listDescription: { fontSize: 10 }, listCountBadge: { minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingHorizontal: 7 }, listCount: { fontSize: 11, fontWeight: '700' }, listHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 }, listTitle: { fontSize: 15, fontWeight: '700' }, sort: { flexDirection: 'row', alignItems: 'center', gap: 4 }, sortText: { fontSize: 11 }, emptyList: { minHeight: 112, alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderRadius: 15 }, emptyListText: { fontSize: 11 }, animeList: { gap: 9 }, animeCard: { minHeight: 94, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 9, borderWidth: 1, borderRadius: 15 }, animeCopy: { flex: 1, gap: 6 }, animeTitle: { fontSize: 13, fontWeight: '700' }, animeDetails: { fontSize: 10 }, animeRating: { flexDirection: 'row', alignItems: 'center', gap: 5 }, animeRatingText: { fontSize: 10, fontWeight: '600' },
});
