import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/auth/AuthContext';
import { ThemeMode, useTheme } from '@/src/theme/ThemeContext';

const menuItems: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string }[] = [
  { icon: 'notifications-outline', title: 'Notificações', detail: 'Lembretes e novidades' },
  { icon: 'shield-checkmark-outline', title: 'Privacidade', detail: 'Controle seus dados' },
  { icon: 'help-circle-outline', title: 'Ajuda e suporte', detail: 'Estamos por aqui' },
];

export default function ProfileScreen() {
  const { colors, mode, setMode } = useTheme();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(public)/login');
  };

  const chooseTheme = (selectedMode: ThemeMode) => setMode(selectedMode);

  return (
    <Screen scroll style={styles.screen}>
      <Text style={[styles.pageTitle, { color: colors.text }]}>Perfil</Text>
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}><Text style={[styles.avatarText, { color: colors.accent }]}>M</Text></View>
        <Text style={[styles.name, { color: colors.text }]}>Matheus Oliveira</Text>
        <Text style={[styles.email, { color: colors.muted }]}>matheus@email.com</Text>
        <View style={[styles.memberBadge, { backgroundColor: colors.accentSoft }]}><Ionicons name="sparkles" size={12} color={colors.accent} /><Text style={[styles.memberText, { color: colors.accent }]}>Membro desde 2024</Text></View>
      </View>
      <View style={[styles.collectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.collectionStat}><Text style={[styles.collectionNumber, { color: colors.text }]}>44</Text><Text style={[styles.collectionLabel, { color: colors.muted }]}>na coleção</Text></View>
        <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
        <View style={styles.collectionStat}><Text style={[styles.collectionNumber, { color: colors.text }]}>186</Text><Text style={[styles.collectionLabel, { color: colors.muted }]}>episódios vistos</Text></View>
        <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
        <View style={styles.collectionStat}><Text style={[styles.collectionNumber, { color: colors.text }]}>9.1</Text><Text style={[styles.collectionLabel, { color: colors.muted }]}>nota média</Text></View>
      </View>
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>APARÊNCIA</Text>
      <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.settingRow}><View style={[styles.itemIcon, { backgroundColor: colors.accentSoft }]}><Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={17} color={colors.accent} /></View><View style={styles.settingCopy}><Text style={[styles.itemTitle, { color: colors.text }]}>Modo escuro</Text><Text style={[styles.itemDetail, { color: colors.muted }]}>Ajuste a aparência do aplicativo</Text></View><Switch value={mode === 'dark'} onValueChange={(isDark) => chooseTheme(isDark ? 'dark' : 'light')} trackColor={{ false: colors.border, true: colors.accent }} thumbColor="#FFFFFF" /></View>
        <View style={[styles.themeChoices, { backgroundColor: colors.elevated }]}>
          <Pressable onPress={() => chooseTheme('light')} style={[styles.themeChoice, mode === 'light' && { backgroundColor: colors.surface }]}><Ionicons name="sunny-outline" size={15} color={mode === 'light' ? colors.accent : colors.muted} /><Text style={[styles.themeText, { color: mode === 'light' ? colors.text : colors.muted }]}>Claro</Text></Pressable>
          <Pressable onPress={() => chooseTheme('dark')} style={[styles.themeChoice, mode === 'dark' && { backgroundColor: colors.surface }]}><Ionicons name="moon-outline" size={15} color={mode === 'dark' ? colors.accent : colors.muted} /><Text style={[styles.themeText, { color: mode === 'dark' ? colors.text : colors.muted }]}>Escuro</Text></Pressable>
        </View>
      </View>
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>CONTA</Text>
      <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {menuItems.map((item, index) => <Pressable key={item.title} onPress={() => Alert.alert(item.title, 'Esta opção estará disponível em breve.')} style={[styles.menuRow, index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}><View style={[styles.itemIcon, { backgroundColor: colors.elevated }]}><Ionicons name={item.icon} size={18} color={colors.muted} /></View><View style={styles.settingCopy}><Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text><Text style={[styles.itemDetail, { color: colors.muted }]}>{item.detail}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>)}
      </View>
      <Pressable onPress={handleSignOut} style={[styles.logout, { borderColor: colors.border }]}><Ionicons name="log-out-outline" size={17} color={colors.muted} /><Text style={[styles.logoutText, { color: colors.muted }]}>Sair da conta</Text></Pressable>
      <Text style={[styles.version, { color: colors.muted }]}>ANIKEEPER · VERSÃO 1.0.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { paddingTop: 18, paddingBottom: 18 }, pageTitle: { fontSize: 23, fontWeight: '800', marginBottom: 20 }, profileCard: { alignItems: 'center', paddingVertical: 23, borderWidth: 1, borderRadius: 19 }, avatar: { width: 66, height: 66, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, avatarText: { fontSize: 25, fontWeight: '800' }, name: { fontSize: 17, fontWeight: '700' }, email: { fontSize: 12, marginTop: 5 }, memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, marginTop: 12 }, memberText: { fontSize: 10, fontWeight: '600' }, collectionCard: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 16, borderWidth: 1, borderRadius: 16, marginTop: 13 }, collectionStat: { alignItems: 'center', gap: 4 }, collectionNumber: { fontSize: 16, fontWeight: '800' }, collectionLabel: { fontSize: 9 }, verticalDivider: { width: 1, height: 27 }, sectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.3, marginTop: 25, marginBottom: 10 }, settingsCard: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 5 }, settingRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12 }, itemIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, settingCopy: { flex: 1, gap: 4 }, itemTitle: { fontSize: 12, fontWeight: '600' }, itemDetail: { fontSize: 10 }, themeChoices: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 10, gap: 4 }, themeChoice: { flex: 1, height: 36, borderRadius: 9, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' }, themeText: { fontSize: 11, fontWeight: '600' }, menuRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 11 }, logout: { marginTop: 20, height: 47, borderWidth: 1, borderRadius: 14, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' }, logoutText: { fontSize: 12, fontWeight: '600' }, version: { textAlign: 'center', fontSize: 9, letterSpacing: 1.1, marginTop: 17, marginBottom: 12 },
});
