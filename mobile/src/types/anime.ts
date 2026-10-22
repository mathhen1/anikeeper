import { Ionicons } from '@expo/vector-icons';

export type AnimeInfo = {
  id: string;
  title: string;
  originalTitle: string;
  type: 'Série' | 'Filme';
  year: number;
  episodes: number;
  rating: string;
  studio: string;
  synopsis: string;
  genres: string[];
  colors: [string, string];
  icon: keyof typeof Ionicons.glyphMap;
  imageUrl?: string | null;
};
