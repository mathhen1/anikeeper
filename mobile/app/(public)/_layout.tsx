import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/src/auth/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';

export default function PublicLayout() {
  const { authMode, isAuthenticated, isReady } = useAuth();
  const { colors } = useTheme();

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={colors.accent} /></View>;
  }

  if (isAuthenticated) {
    return <Redirect href={authMode === 'local' ? '/(local)' : '/(app)'} />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
