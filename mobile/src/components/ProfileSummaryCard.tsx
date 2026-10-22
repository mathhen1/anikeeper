import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  getLocalProfilePhoto,
  readLocalProfilePhotoCache,
  subscribeToLocalProfilePhoto,
} from '@/src/data/cache/localProfilePhoto';
import { getLocalAnimeLists } from '@/src/data/cache/localAnimeLists';
import {
  getOrCreateProfileStats,
  ProfileStats,
  readProfileStatsCache,
  subscribeToProfileStats,
} from '@/src/data/cache/localProfileStatsCache';
import { useTheme } from '@/src/theme/ThemeContext';

type ProfileSummaryCardProps = {
  profileName: string;
  username: string;
  description: string;
  topSpacing?: number;
};

export function ProfileSummaryCard({
  profileName,
  username,
  description,
  topSpacing = 19,
}: ProfileSummaryCardProps) {
  const { colors } = useTheme();
  const [loadedStats, setLoadedStats] = useState<{
    username: string;
    stats: ProfileStats | null;
  }>(() => ({ username, stats: readProfileStatsCache(username) }));
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(
    () => readLocalProfilePhotoCache(username) ?? null,
  );
  const stats =
    loadedStats.username === username
      ? loadedStats.stats
      : readProfileStatsCache(username);

  useEffect(() => {
    setLoadedStats({ username, stats: readProfileStatsCache(username) });
    if (!username.trim()) return;

    let isActive = true;
    const unsubscribe = subscribeToProfileStats(username, (updatedStats) => {
      setLoadedStats({ username, stats: updatedStats });
    });

    getOrCreateProfileStats(username, async () => {
      const localLists = await getLocalAnimeLists(username);
      return localLists.completed;
    })
      .then((profileStats) => {
        if (isActive) setLoadedStats({ username, stats: profileStats });
      })
      .catch((error: unknown) => {
        if (isActive) console.warn('Could not load profile stats.', error);
      });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [username]);

  useEffect(() => {
    setProfilePhotoUri(readLocalProfilePhotoCache(username) ?? null);
    if (!username.trim()) return;

    let isActive = true;
    const unsubscribe = subscribeToLocalProfilePhoto(username, (uri) => {
      setProfilePhotoUri(uri);
    });

    getLocalProfilePhoto(username)
      .then((uri) => {
        if (isActive) setProfilePhotoUri(uri);
      })
      .catch((error: unknown) => {
        if (isActive) console.warn('Could not load local profile photo.', error);
      });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [username]);

  const completedAnimeCount = stats?.completedAnimeCount ?? '—';
  const completedEpisodeCount = stats?.completedEpisodeCount ?? '—';
  const watchedHours = stats?.watchedHours ?? '—';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          marginTop: topSpacing,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.profileCopy}>
          <Text
            style={[
              styles.eyebrow,
              { color: colors.accent },
              { textTransform: 'uppercase' },
            ]}
          >
            {profileName}'S PROFILE
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {description}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(local)/profile')}
          style={({ pressed }) => [
            styles.avatar,
            {
              backgroundColor: colors.accentSoft,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
          accessibilityHint="Abre as configurações do seu perfil local"
        >
          {profilePhotoUri ? (
            <Image
              source={{ uri: profilePhotoUri }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={[styles.avatarText, { color: colors.accent }]}>
              {profileName.trim().charAt(0).toUpperCase() || 'A'}
            </Text>
          )}
        </Pressable>
      </View>
      <View style={styles.statsSection}>
        <Text style={[styles.statsHeading, { color: colors.text }]}>
          Informações do Perfil:
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {completedAnimeCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              animes concluídos
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {completedEpisodeCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              total de episódios
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {watchedHours}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              horas assistidas
            </Text>
          </View>
        </View>
        <View
          style={[styles.estimateNote, { backgroundColor: colors.elevated }]}
        >
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.accent}
          />
          <Text style={[styles.estimateText, { color: colors.muted }]}>
            Cálculo aproximado: alguns animes podem não ter episódios ou
            duração informados.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 19, padding: 17 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  profileCopy: { flex: 1, minWidth: 0, paddingTop: 3 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 17, fontWeight: '800' },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  title: { fontSize: 14, fontWeight: '700', marginTop: 5 },
  statsSection: { marginTop: 16, gap: 11 },
  statsHeading: { fontSize: 11, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stat: { flex: 1, gap: 3 },
  statNumber: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10 },
  statDivider: { width: 1, height: 30 },
  estimateNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 11,
  },
  estimateText: { flex: 1, fontSize: 10, lineHeight: 15 },
});
