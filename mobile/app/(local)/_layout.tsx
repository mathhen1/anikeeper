import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/src/auth/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';

export default function LocalLayout() {
  const { authMode, isAuthenticated, isReady } = useAuth();
  const { colors } = useTheme();

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={colors.accent} /></View>;
  }

  if (isAuthenticated && authMode === 'official') return <Redirect href="/(app)" />;
  if (!isAuthenticated || authMode !== 'local') return <Redirect href="/(public)" />;

  return (
    <Tabs initialRouteName="index" screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border, height: 86, paddingTop: 10, paddingBottom: 24 }, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontSize: 10, fontWeight: '600' } }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="mylist" options={{ title: 'Minha lista', tabBarIcon: ({ color, size }) => <Ionicons name="albums-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="add-anime" options={{ title: 'Adicionar anime', tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="anime/[id]" options={{ href: null }} />
    </Tabs>
  );
}
