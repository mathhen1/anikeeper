import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { useTheme } from '@/src/theme/ThemeContext';

export default function WelcomeScreen() {
  const { colors } = useTheme();

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.brand}>
        <View style={[styles.logo, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="bookmark" size={23} color={colors.accent} />
        </View>
        <Text style={[styles.brandName, { color: colors.text }]}>
          ani<Text style={{ color: colors.accent }}>keeper</Text>
        </Text>
      </View>

      <View style={styles.welcome}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>
          BEM-VINDO AO ANIKEEPER
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>
          Sua próxima{'\n'}história começa aqui.
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Escolha como quer organizar sua jornada pelos animes.
        </Text>
      </View>

      <Pressable
        onPress={() => router.push('/(public)/login-local')}
        style={({ pressed }) => [
          styles.optionCard,
          {
            backgroundColor: colors.surface,
            borderColor: pressed ? colors.accent : colors.border,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Continuar com perfil local"
      >
        <View
          style={[styles.optionIcon, { backgroundColor: colors.accentSoft }]}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={20}
            color={colors.accent}
          />
        </View>
        <View style={styles.optionCopy}>
          <Text style={[styles.optionTitle, { color: colors.text }]}>
            Usar localmente
          </Text>
          <Text style={[styles.optionDescription, { color: colors.muted }]}>
            Sua lista fica salva somente neste aparelho.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>

      <Pressable
        onPress={() => router.push('/(public)/register')}
        style={({ pressed }) => [
          styles.optionCard,
          {
            backgroundColor: colors.surface,
            borderColor: pressed ? colors.accent : colors.border,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Criar conta oficial"
      >
        <View style={[styles.optionIcon, { backgroundColor: colors.elevated }]}>
          <Ionicons name="cloud-outline" size={20} color={colors.accent} />
        </View>
        <View style={styles.optionCopy}>
          <Text style={[styles.optionTitle, { color: colors.text }]}>
            Criar conta oficial
          </Text>
          <Text style={[styles.optionDescription, { color: colors.muted }]}>
            Sua conta oficial permitirá sincronizar dados na nuvem.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.muted }]}>
          Já tem uma conta oficial?{' '}
        </Text>
        <Pressable
          onPress={() => router.push('/(public)/login')}
          accessibilityRole="link"
        >
          <Text style={[styles.footerLink, { color: colors.accent }]}>
            Entrar
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 24, paddingBottom: 28 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 21, fontWeight: '800', letterSpacing: -0.8 },
  welcome: { marginTop: 58, marginBottom: 30, gap: 12 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  title: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: { fontSize: 14, lineHeight: 21 },
  optionCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 15,
    borderWidth: 1,
    borderRadius: 17,
    marginBottom: 12,
  },
  optionIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  optionCopy: { flex: 1, gap: 5 },
  optionTitle: { fontSize: 14, fontWeight: '700' },
  optionDescription: { fontSize: 11, lineHeight: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  footerText: { fontSize: 12 },
  footerLink: { fontSize: 12, fontWeight: '700' },
});
