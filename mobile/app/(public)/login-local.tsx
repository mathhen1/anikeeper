import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/auth/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';

export default function LocalLoginScreen() {
  const { colors } = useTheme();
  const { isReady, localName, signInLocal } = useAuth();
  const [name, setName] = useState(localName);

  const continueLocally = async () => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      Alert.alert(
        'Informe seu nome',
        'Digite um nome para identificar seu perfil local.',
      );
      return;
    }

    await signInLocal(normalizedName);
    router.replace('/(local)');
  };

  return (
    <Screen style={styles.screen} safeAreaEdges={['top', 'bottom']}>
      <Pressable
        onPress={() => router.back()}
        style={[styles.backButton, { backgroundColor: colors.surface }]}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </Pressable>

      <View style={styles.heading}>
        <View
          style={[styles.localIcon, { backgroundColor: colors.accentSoft }]}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={22}
            color={colors.accent}
          />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Seu perfil,{'\n'}do seu jeito.
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Crie um perfil local para começar a montar suas listas neste aparelho.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>
          Como podemos te chamar?
        </Text>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.input, borderColor: colors.border },
          ]}
        >
          <Ionicons name="person-outline" size={18} color={colors.muted} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={continueLocally}
            style={[styles.input, { color: colors.text }]}
            accessibilityLabel="Seu nome"
          />
        </View>

        <View
          style={[
            styles.privacyNote,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={colors.accent}
          />
          <Text style={[styles.privacyText, { color: colors.muted }]}>
            Seu perfil e suas listas ficam armazenados somente neste aparelho.
          </Text>
        </View>

        <Pressable
          onPress={continueLocally}
          disabled={!isReady}
          style={[
            styles.primaryButton,
            {
              backgroundColor: colors.accentStrong,
              opacity: isReady ? 1 : 0.6,
            },
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>Continuar localmente</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.muted }]}>
          Prefere uma conta oficial?{' '}
        </Text>
        <Pressable
          onPress={() => router.push('/(public)/register')}
          accessibilityRole="link"
        >
          <Text style={[styles.footerLink, { color: colors.accent }]}>
            Criar conta
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 12, paddingBottom: 20 },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { marginTop: 34, gap: 12 },
  localIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginBottom: 4,
  },
  title: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: { fontSize: 14, lineHeight: 21 },
  form: { marginTop: 32 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 9 },
  inputWrap: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 14,
  },
  input: { flex: 1, fontSize: 14 },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 13,
    borderWidth: 1,
    borderRadius: 13,
    marginTop: 16,
  },
  privacyText: { flex: 1, fontSize: 11, lineHeight: 17 },
  primaryButton: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 15,
    marginTop: 24,
  },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: { fontSize: 12 },
  footerLink: { fontSize: 12, fontWeight: '700' },
});
