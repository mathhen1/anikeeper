import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { AnimeInfo } from '@/src/data/animeCatalog';

type AnimeArtworkProps = {
  anime: Pick<AnimeInfo, 'colors' | 'icon'>;
  width: number;
  height: number;
};

export function AnimeArtwork({ anime, width, height }: AnimeArtworkProps) {
  return (
    <View style={[styles.poster, { width, height, backgroundColor: anime.colors[0] }]}>
      <View style={[styles.largeShape, { backgroundColor: anime.colors[1], width: width * 0.72, height: height * 0.72 }]} />
      <View style={[styles.smallShape, { borderColor: anime.colors[1], width: width * 0.52, height: width * 0.52 }]} />
      <Ionicons name={anime.icon} size={Math.min(width, height) * 0.32} color="#FFFFFF" style={styles.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  poster: { borderRadius: 15, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  largeShape: { position: 'absolute', borderRadius: 100, opacity: 0.35, transform: [{ rotate: '24deg' }] },
  smallShape: { position: 'absolute', borderWidth: 1, borderRadius: 100, opacity: 0.55, transform: [{ rotate: '-18deg' }] },
  icon: { opacity: 0.95 },
});
