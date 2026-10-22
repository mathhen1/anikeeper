import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  getLocalAnimeLists,
  type LocalAnimeListKey,
} from '@/src/data/localAnimeLists';
import {
  getOrCreateLocalAnimeListCounts,
  readLocalAnimeListCountsCache,
  subscribeToLocalAnimeListCounts,
  type LocalAnimeListCounts,
} from '@/src/data/localAnimeListCountsCache';
import { useTheme } from '@/src/theme/ThemeContext';

export type AnimeListSummaryItem = {
  key: LocalAnimeListKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

type AnimeListSummaryCardProps = {
  items: readonly AnimeListSummaryItem[];
  onPress: () => void;
  username?: string;
};

const emptyListCounts: LocalAnimeListCounts = {
  completed: 0,
  watching: 0,
  planned: 0,
};

export function AnimeListSummaryCard({
  items,
  onPress,
  username,
}: AnimeListSummaryCardProps) {
  const { colors } = useTheme();
  const [loadedCounts, setLoadedCounts] = useState<{
    username: string;
    counts: LocalAnimeListCounts | null;
  }>(() => ({
    username: username ?? '',
    counts: username ? readLocalAnimeListCountsCache(username) : null,
  }));

  const displayedCounts = username
    ? loadedCounts.username === username
      ? loadedCounts.counts
      : readLocalAnimeListCountsCache(username)
    : emptyListCounts;

  useEffect(() => {
    if (!username?.trim()) return;

    setLoadedCounts({
      username,
      counts: readLocalAnimeListCountsCache(username),
    });

    let isActive = true;
    const unsubscribe = subscribeToLocalAnimeListCounts(
      username,
      (updatedCounts) => {
        setLoadedCounts({ username, counts: updatedCounts });
      },
    );

    getOrCreateLocalAnimeListCounts(username, async () => {
      const localLists = await getLocalAnimeLists(username);
      return {
        completed: localLists.completed.length,
        watching: localLists.watching.length,
        planned: localLists.planned.length,
      };
    })
      .then((counts) => {
        if (isActive) setLoadedCounts({ username, counts });
      })
      .catch((error: unknown) => {
        if (isActive) console.warn('Could not load anime list counts.', error);
      });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [username]);

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Suas listas
        </Text>
        <Pressable
          onPress={onPress}
          style={styles.linkButton}
          accessibilityRole="button"
          accessibilityLabel="Ver coleção"
        >
          <Text style={[styles.linkText, { color: colors.accent }]}>
            Ver coleção
          </Text>
          <Ionicons name="arrow-forward" size={14} color={colors.accent} />
        </Pressable>
      </View>

      <View style={styles.listGrid}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={onPress}
            style={({ pressed }) => [
              styles.listCard,
              {
                backgroundColor: colors.surface,
                borderColor: pressed ? colors.accent : colors.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Abrir lista ${item.label}`}
          >
            <Ionicons name={item.icon} size={19} color={item.color} />
            <Text style={[styles.listCount, { color: colors.text }]}>
              {displayedCounts ? displayedCounts[item.key] : '—'}
            </Text>
            <Text style={[styles.listLabel, { color: colors.muted }]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  linkButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  linkText: { fontSize: 10, fontWeight: '700' },
  listGrid: { flexDirection: 'row', gap: 9 },
  listCard: {
    flex: 1,
    minHeight: 94,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  listCount: { fontSize: 16, fontWeight: '800' },
  listLabel: { fontSize: 9, textAlign: 'center' },
});
