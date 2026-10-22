import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { useTheme } from '@/src/theme/ThemeContext';

const lists = [
  { key: 'watching', label: 'Assistindo', count: 4 },
  { key: 'planned', label: 'Quero ver', count: 12 },
  { key: 'completed', label: 'Concluídos', count: 28 },
] as const;


export default function MyListScreen() {
  const { colors } = useTheme();
  const [selectedList, setSelectedList] = useState<(typeof lists)[number]['key']>('watching');
  const currentList = lists.find((list) => list.key === selectedList)!;

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <View><Text style={[styles.eyebrow, { color: colors.muted }]}>QUARTA-FEIRA, 20 OUT</Text><Text style={[styles.greeting, { color: colors.text }]}>Olá, Matheus <Text>✦</Text></Text></View>
        <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}><Text style={[styles.avatarText, { color: colors.accent }]}>M</Text></View>
      </View>
      <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.summaryTop}><View><Text style={[styles.summaryLabel, { color: colors.muted }]}>SUA JORNADA</Text><Text style={[styles.summaryTitle, { color: colors.text }]}>No seu ritmo.</Text></View><View style={[styles.summaryIcon, { backgroundColor: colors.accentSoft }]}><Ionicons name="sparkles" size={19} color={colors.accent} /></View></View>
        <View style={styles.statsRow}>
          <View><Text style={[styles.statNumber, { color: colors.text }]}>44</Text><Text style={[styles.statLabel, { color: colors.muted }]}>animes salvos</Text></View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View><Text style={[styles.statNumber, { color: colors.text }]}>186</Text><Text style={[styles.statLabel, { color: colors.muted }]}>episódios vistos</Text></View>
          <View style={styles.weekStat}><Ionicons name="trending-up" size={14} color={colors.success} /><Text style={[styles.weekLabel, { color: colors.success }]}>+6 esta semana</Text></View>
        </View>
      </View>
      <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.text }]}>Sua coleção</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {lists.map((list) => {
          const isSelected = selectedList === list.key;
          return <Pressable key={list.key} onPress={() => setSelectedList(list.key)} style={[styles.listTab, { backgroundColor: isSelected ? colors.accentSoft : colors.surface, borderColor: isSelected ? colors.accent : colors.border }]}><Text style={[styles.listTabText, { color: isSelected ? colors.accent : colors.muted }]}>{list.label}</Text><Text style={[styles.listCount, { color: isSelected ? colors.accent : colors.muted }]}>{list.count}</Text></Pressable>;
        })}
      </ScrollView>
      <View style={styles.listHeading}><Text style={[styles.listTitle, { color: colors.text }]}>{currentList.label}</Text><Pressable style={styles.sort}><Ionicons name="swap-vertical" size={15} color={colors.muted} /><Text style={[styles.sortText, { color: colors.muted }]}>Recentes</Text></Pressable></View>
      <View style={[styles.emptyList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="albums-outline" size={22} color={colors.muted} />
        <Text style={[styles.emptyListText, { color: colors.muted }]}>Ainda não há animes nesta lista.</Text>
      </View>
      <View style={{ height: 18 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { paddingTop: 14, paddingBottom: 12 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }, eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.3, marginBottom: 6 }, greeting: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }, avatar: { width: 42, height: 42, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }, avatarText: { fontWeight: '800', fontSize: 17 }, summary: { borderRadius: 20, padding: 18, borderWidth: 1 }, summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, summaryLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2 }, summaryTitle: { fontSize: 18, fontWeight: '700', marginTop: 4 }, summaryIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, statsRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 18 }, statNumber: { fontSize: 19, fontWeight: '800' }, statLabel: { fontSize: 10, marginTop: 3 }, statDivider: { height: 31, width: 1 }, weekStat: { marginLeft: 'auto', alignItems: 'flex-end', gap: 5 }, weekLabel: { fontSize: 10, fontWeight: '600' }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 29, marginBottom: 15 }, sectionTitle: { fontSize: 18, fontWeight: '700' }, tabs: { gap: 8 }, listTab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12, borderWidth: 1 }, listTabText: { fontSize: 11, fontWeight: '600' }, listCount: { fontSize: 10, fontWeight: '700' }, listHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 8 }, listTitle: { fontSize: 15, fontWeight: '700' }, sort: { flexDirection: 'row', alignItems: 'center', gap: 4 }, sortText: { fontSize: 11 }, emptyList: { minHeight: 112, alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderRadius: 15 }, emptyListText: { fontSize: 11 },
});
