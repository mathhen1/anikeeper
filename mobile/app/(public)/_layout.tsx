import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/src/auth/AuthContext';

export default function PublicLayout() {
  const { isAuthenticated, isReady } = useAuth();
  if (isReady && isAuthenticated) return <Redirect href="/(app)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
