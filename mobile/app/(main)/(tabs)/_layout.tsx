import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeContext';

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          height: 62 + insets.bottom,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingLeft: Math.max(insets.left, 8),
          paddingRight: Math.max(insets.right, 8),
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              color={typeof color === 'string' ? color : colors.accent}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mylist"
        options={{
          title: 'Minha lista',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="albums-outline"
              color={typeof color === 'string' ? color : colors.accent}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-anime"
        options={{
          title: 'Adicionar anime',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="search-outline"
              color={typeof color === 'string' ? color : colors.accent}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-circle-outline"
              color={typeof color === 'string' ? color : colors.accent}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
