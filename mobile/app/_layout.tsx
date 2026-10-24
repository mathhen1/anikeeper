import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DeviceOrientationProvider } from '@/src/orientation/DeviceOrientationProvider';
import { ThemeProvider, useTheme } from '@/src/theme/ThemeContext';
import { AuthProvider } from '@/src/auth/AuthContext';

function RootNavigator() {
  const { colors, mode } = useTheme();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DeviceOrientationProvider>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </DeviceOrientationProvider>
    </SafeAreaProvider>
  );
}
