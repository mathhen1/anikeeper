import { Redirect } from 'expo-router';
import { useAuth } from '@/src/auth/AuthContext';
import { Screen } from '@/src/components/Screen';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';

export default function IndexRoute() {
  const { isAuthenticated, isReady } = useAuth();
  const { colors } = useTheme();
  if (!isReady) return <Screen style={{ justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={colors.accent} /></Screen>;
  return <Redirect href={isAuthenticated ? '/(app)' : '/(public)/login'} />;
}
