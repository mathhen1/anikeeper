import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';

type Anime = { id: string; title: string; detail: string; rating: string; colors: [string, string]; icon: keyof typeof Ionicons.glyphMap };

export function AnimeCard({ anime, onPress }: { anime: Anime; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.row} accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${anime.title}`}>
      <View style={[styles.poster, { backgroundColor: anime.colors[0] }]}>
        <View style={[styles.posterShape, { backgroundColor: anime.colors[1] }]} />
        <Ionicons name={anime.icon} size={28} color="#FFFFFF" style={styles.posterIcon} />
      </View>
      <View style={styles.details}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{anime.title}</Text>
        <Text style={[styles.detail, { color: colors.muted }]}>{anime.detail}</Text>
        <View style={styles.ratingRow}><Ionicons name="star" size={12} color="#F1C66A" /><Text style={[styles.rating, { color: colors.muted }]}>{anime.rating}</Text></View>
      </View>
      <Ionicons name="ellipsis-horizontal" size={21} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
  poster: { width: 62, height: 76, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  posterShape: { width: 48, height: 62, borderRadius: 24, opacity: 0.4, transform: [{ rotate: '22deg' }], position: 'absolute' },
  posterIcon: { opacity: 0.9 }, details: { flex: 1, gap: 4 }, title: { fontSize: 15, fontWeight: '700' },
  detail: { fontSize: 12 }, ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 }, rating: { fontSize: 11 },
});
