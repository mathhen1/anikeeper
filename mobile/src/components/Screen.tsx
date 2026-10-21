import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';

export function Screen({ children, style, scroll = false }: PropsWithChildren<{ style?: ViewStyle; scroll?: boolean }>) {
  const { colors } = useTheme();
  if (scroll) {
    return <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.content, style]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
  }
  return <View style={[styles.content, { backgroundColor: colors.background }, style]}>{children}</View>;
}

const styles = StyleSheet.create({ content: { flex: 1, paddingHorizontal: 24, paddingTop: 18 } });
