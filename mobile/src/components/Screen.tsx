import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';
import type { ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import { useDeviceOrientation } from '@/src/orientation/DeviceOrientationProvider';

const defaultSafeAreaEdges: Edge[] = ['top'];

export function Screen({
  children,
  style,
  scroll = false,
  safeAreaEdges = defaultSafeAreaEdges,
}: PropsWithChildren<{
  style?: ViewStyle;
  scroll?: boolean;
  safeAreaEdges?: Edge[];
}>) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const deviceIsLandscape = useDeviceOrientation();
  const isLandscape = deviceIsLandscape || width > height;
  const screenSafeAreaEdges = isLandscape
    ? [...new Set([...safeAreaEdges, 'left', 'right'] as Edge[])]
    : safeAreaEdges;

  if (scroll) {
    return (
      <SafeAreaView
        edges={screenSafeAreaEdges}
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isLandscape && styles.landscapeScrollContent,
            style,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView
      edges={screenSafeAreaEdges}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View
        style={[styles.content, isLandscape && styles.landscapeContent, style]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 18 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 18 },
  landscapeContent: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingTop: 12,
  },
  landscapeScrollContent: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingTop: 12,
  },
});
