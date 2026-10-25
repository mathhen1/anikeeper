import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/src/auth/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';

export default function PublicLayout() {
  const { isAuthenticated, isReady, requiresReauthentication } = useAuth();
  const segments = useSegments();
  const { colors } = useTheme();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const currentPublicRoute = segments[segments.length - 1];
  const isAuthFormRoute =
    currentPublicRoute === 'login' || currentPublicRoute === 'register';
  if (requiresReauthentication && !isAuthFormRoute) {
    return <Redirect href="/(public)/login" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(main)" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
