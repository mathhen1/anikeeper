import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/src/auth/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';

export default function PublicLayout() {
  const { isAuthenticated, isReady } = useAuth();
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

  if (isAuthenticated) {
    return <Redirect href="/(main)" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
