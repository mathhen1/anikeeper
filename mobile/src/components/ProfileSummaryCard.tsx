import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AnimeInfo } from '@/src/types/anime';
import { useTheme } from '@/src/theme/ThemeContext';

type ProfileSummaryCardProps = {
  profileName: string;
  description: string;
  completedAnimes: AnimeInfo[];
  topSpacing?: number;
};

export function ProfileSummaryCard({
  profileName,
  description,
  completedAnimes,
  topSpacing = 19,
}: ProfileSummaryCardProps) {
  const { colors } = useTheme();
  const completedAnimeCount = completedAnimes.length;
  const completedEpisodeCount = completedAnimes.reduce(
    (totalEpisodes, anime) => totalEpisodes + anime.episodes,
    0,
  );
  const completedMinutes = completedAnimes.reduce((totalMinutes, anime) => {
    if (anime.episodeLength == null) return totalMinutes;
    return totalMinutes + anime.episodeLength * anime.episodes;
  }, 0);
  const watchedHours = Math.round(completedMinutes / 60);

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
      <View>
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
