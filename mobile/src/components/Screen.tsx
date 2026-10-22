import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';

export function Screen({
  children,
  style,
  scroll = false,
}: PropsWithChildren<{ style?: ViewStyle; scroll?: boolean }>) {
  const { colors } = useTheme();
  if (scroll) {
    return (
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scrollContent, style]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <View
      style={[styles.content, { backgroundColor: colors.background }, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 18 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 18 },
});
