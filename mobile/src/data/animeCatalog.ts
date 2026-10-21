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
};

export const animeCatalog: AnimeInfo[] = [
  {
    id: 'frieren',
    title: 'Frieren: Beyond Journey’s End',
    originalTitle: 'Sousou no Frieren',
    type: 'Série',
    year: 2023,
    episodes: 28,
    rating: '9.4',
    studio: 'Madhouse',
    synopsis: 'Depois de uma jornada que derrotou o Rei Demônio, a maga élfica Frieren encara o tempo de outra forma. Em uma nova viagem, ela busca compreender melhor as pessoas que conheceu pelo caminho.',
    genres: ['Aventura', 'Drama', 'Fantasia'],
    colors: ['#65746B', '#D4AF72'],
    icon: 'leaf-outline',
  },
  {
    id: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    originalTitle: 'Jujutsu Kaisen',
    type: 'Série',
    year: 2020,
    episodes: 24,
    rating: '8.8',
    studio: 'MAPPA',
    synopsis: 'Yuji Itadori entra no mundo das maldições depois de um encontro inesperado. Ao lado de outros feiticeiros, ele tenta proteger pessoas enquanto aprende a controlar uma força perigosa.',
    genres: ['Ação', 'Sobrenatural', 'Fantasia'],
    colors: ['#513C5D', '#D46D84'],
    icon: 'flash-outline',
  },
  {
    id: 'dungeon-meshi',
    title: 'Dungeon Meshi',
    originalTitle: 'Delicious in Dungeon',
    type: 'Série',
    year: 2024,
    episodes: 24,
    rating: '8.6',
    studio: 'Studio Trigger',
    synopsis: 'Sem provisões e com uma amiga para resgatar, Laios e seu grupo atravessam uma masmorra preparando refeições com os monstros que encontram.',
    genres: ['Aventura', 'Comédia', 'Fantasia'],
    colors: ['#526457', '#C4844E'],
    icon: 'flame-outline',
  },
  {
    id: 'kusuriya',
    title: 'The Apothecary Diaries',
    originalTitle: 'Kusuriya no Hitorigoto',
    type: 'Série',
    year: 2023,
    episodes: 24,
    rating: '8.9',
    studio: 'TOHO animation',
    synopsis: 'Maomao, uma jovem com grande conhecimento de ervas e venenos, começa a trabalhar no palácio imperial e passa a desvendar mistérios que cercam seus moradores.',
    genres: ['Drama', 'Mistério', 'Histórico'],
    colors: ['#52615C', '#D39355'],
    icon: 'flask-outline',
  },
  {
    id: 'mob-psycho-100',
    title: 'Mob Psycho 100',
    originalTitle: 'Mob Psycho 100',
    type: 'Série',
    year: 2016,
    episodes: 12,
    rating: '8.5',
    studio: 'Bones',
    synopsis: 'Shigeo Kageyama é um estudante com poderes psíquicos extraordinários. Enquanto tenta levar uma vida comum, ele aprende a lidar com as próprias emoções e com quem está ao seu redor.',
    genres: ['Ação', 'Comédia', 'Sobrenatural'],
    colors: ['#4E5368', '#C2B4DA'],
    icon: 'sparkles-outline',
  },
  {
    id: 'vinland-saga',
    title: 'Vinland Saga',
    originalTitle: 'Vinland Saga',
    type: 'Série',
    year: 2019,
    episodes: 24,
    rating: '8.8',
    studio: 'Wit Studio',
    synopsis: 'Em meio a conflitos entre vikings, Thorfinn segue um caminho marcado pela busca de vingança e pela tentativa de encontrar um lugar onde possa viver em paz.',
    genres: ['Ação', 'Aventura', 'Drama'],
    colors: ['#635447', '#BD9B6C'],
    icon: 'compass-outline',
  },
  {
    id: 'your-name',
    title: 'Your Name',
    originalTitle: 'Kimi no Na wa.',
    type: 'Filme',
    year: 2016,
    episodes: 1,
    rating: '9.0',
    studio: 'CoMix Wave Films',
    synopsis: 'Mitsuha e Taki começam a trocar de corpo em momentos inesperados. A conexão entre os dois cresce enquanto tentam entender o que os une.',
    genres: ['Drama', 'Romance', 'Sobrenatural'],
    colors: ['#45617A', '#E7A5AA'],
    icon: 'cloud-outline',
  },
  {
    id: 'fullmetal-alchemist',
    title: 'Fullmetal Alchemist: Brotherhood',
    originalTitle: 'Hagane no Renkinjutsushi',
    type: 'Série',
    year: 2009,
    episodes: 64,
    rating: '9.5',
    studio: 'Bones',
    synopsis: 'Depois de uma tentativa de alquimia que termina em tragédia, os irmãos Edward e Alphonse Elric partem em busca da Pedra Filosofal para recuperar o que perderam.',
    genres: ['Ação', 'Aventura', 'Fantasia'],
    colors: ['#785B43', '#DBB77A'],
    icon: 'flame-outline',
  },
  {
    id: 'demon-slayer',
    title: 'Demon Slayer',
    originalTitle: 'Kimetsu no Yaiba',
    type: 'Série',
    year: 2019,
    episodes: 26,
    rating: '8.7',
    studio: 'ufotable',
    synopsis: 'Após uma tragédia atingir sua família, Tanjiro inicia uma jornada para proteger sua irmã e enfrentar os demônios que ameaçam a humanidade.',
    genres: ['Ação', 'Fantasia', 'Histórico'],
    colors: ['#526A60', '#DA766E'],
    icon: 'water-outline',
  },
];

export function findAnimeById(id: string | undefined) {
  return animeCatalog.find((anime) => anime.id === id);
}
