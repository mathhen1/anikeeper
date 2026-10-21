import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AnimeCard } from '@/src/components/AnimeCard';
import { Screen } from '@/src/components/Screen';
import { useTheme } from '@/src/theme/ThemeContext';

const collectionLists = [
  { label: 'Assistindo', count: 4, icon: 'play-circle-outline' as const, color: '#B59AF7' },
  { label: 'Quero assistir', count: 12, icon: 'bookmark-outline' as const, color: '#7FB8E8' },
  { label: 'Concluídos', count: 28, icon: 'checkmark-circle-outline' as const, color: '#8DD6B1' },
];

const currentAnime = {
  id: 'frieren',
  title: 'Frieren: Beyond Journey’s End',
  detail: 'Temporada 1 · Ep. 18 de 28',
  rating: '9.4',
  colors: ['#65746B', '#D4AF72'] as [string, string],
  icon: 'leaf-outline' as const,
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const openSearch = () => {
    const searchQuery = query.trim();
    router.push({ pathname: '/(app)/add-anime', params: searchQuery ? { query: searchQuery } : {} });
  };

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.muted }]}>ANIKEEPER</Text>
          <Text style={[styles.greeting, { color: colors.text }]}>Olá, Matheus <Text style={{ color: colors.accent }}>✦</Text></Text>
        </View>
        <Pressable onPress={() => router.push('/(app)/profile')} style={[styles.avatar, { backgroundColor: colors.accentSoft }]} accessibilityRole="button" accessibilityLabel="Abrir perfil">
          <Text style={[styles.avatarText, { color: colors.accent }]}>M</Text>
        </Pressable>
      </View>

      <Text style={[styles.intro, { color: colors.muted }]}>O que vamos assistir hoje?</Text>
      <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={openSearch}
          placeholder="Buscar anime, gênero..."
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
          accessibilityLabel="Buscar anime"
        />
        <Pressable onPress={openSearch} style={[styles.searchButton, { backgroundColor: colors.accentStrong }]} accessibilityRole="button" accessibilityLabel="Pesquisar">
          <Ionicons name="search" size={17} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.profileCardTop}>
          <View>
            <Text style={[styles.cardEyebrow, { color: colors.muted }]}>SUA JORNADA</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Sua coleção em um só lugar</Text>
          </View>
          <View style={[styles.journeyIcon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="sparkles" size={18} color={colors.accent} />
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>44</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>animes salvos</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>186</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>episódios vistos</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Suas listas</Text>
        <Pressable onPress={() => router.push('/(app)/mylist')} style={styles.linkButton} accessibilityRole="button">
          <Text style={[styles.linkText, { color: colors.accent }]}>Ver coleção</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.accent} />
        </Pressable>
      </View>
      <View style={styles.listGrid}>
        {collectionLists.map((list) => (
          <Pressable key={list.label} onPress={() => router.push('/(app)/mylist')} style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel={`Abrir lista ${list.label}`}>
            <Ionicons name={list.icon} size={19} color={list.color} />
            <Text style={[styles.listCount, { color: colors.text }]}>{list.count}</Text>
            <Text style={[styles.listLabel, { color: colors.muted }]}>{list.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Continue assistindo</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>Retome de onde você parou</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={19} color={colors.muted} />
      </View>
      <AnimeCard anime={currentAnime} onPress={() => router.push({ pathname: '/(app)/anime/[id]', params: { id: currentAnime.id } })} />
      <View style={{ height: 18 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 14, paddingBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.4, marginBottom: 5 },
  greeting: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  avatar: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', fontSize: 17 },
  intro: { fontSize: 12, marginBottom: 10 },
  searchBox: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 5, paddingLeft: 14, borderWidth: 1, borderRadius: 15 },
  searchInput: { flex: 1, fontSize: 12, paddingVertical: 9 },
  searchButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  profileCard: { borderWidth: 1, borderRadius: 19, padding: 17, marginTop: 19 },
  profileCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardEyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginTop: 5 },
  journeyIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 17 },
  stat: { gap: 3 },
  statNumber: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10 },
  statDivider: { width: 1, height: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionSubtitle: { fontSize: 10, marginTop: 4 },
  linkButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  linkText: { fontSize: 10, fontWeight: '700' },
  listGrid: { flexDirection: 'row', gap: 9 },
  listCard: { flex: 1, minHeight: 94, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 15, borderWidth: 1, paddingHorizontal: 4, paddingVertical: 10 },
  listCount: { fontSize: 16, fontWeight: '800' },
  listLabel: { fontSize: 9, textAlign: 'center' },
});
