import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '@/src/components/Screen';
import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/auth/AuthContext';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { registerOfficial } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAccount = async () => {
    const normalizedUsername = username.trim();
    if (normalizedUsername.length < 3 || normalizedUsername.length > 20)
      return Alert.alert(
        'Confira seus dados',
        'O username deve ter entre 3 e 20 caracteres.',
      );
    if (password.length < 8 || password.length > 64)
      return Alert.alert(
        'Confira sua senha',
        'A senha deve ter entre 8 e 64 caracteres.',
      );

    setIsSubmitting(true);
    try {
      await registerOfficial(normalizedUsername, password);
      router.replace('/(main)');
    } catch (error: unknown) {
      Alert.alert(
        'Não foi possível criar a conta',
        error instanceof Error ? error.message : 'Tente novamente em instantes.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scroll safeAreaEdges={['top', 'bottom']}>
      <View style={styles.top}>
        <Link href="/(public)/login" asChild>
          <Pressable
            style={StyleSheet.flatten([
              styles.back,
              { backgroundColor: colors.surface },
            ])}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
        </Link>
        <Text style={[styles.topLabel, { color: colors.muted }]}>
          NOVA CONTA
        </Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        Um lugar para{'\n'}cada história.
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Crie sua conta e organize sua jornada pelos animes.
      </Text>
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>
          Username
        </Text>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.input, borderColor: colors.border },
          ]}
        >
          <Ionicons name="person-outline" size={18} color={colors.muted} />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Escolha um username"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            style={[styles.input, { color: colors.text }]}
          />
        </View>
        <Text style={[styles.label, { color: colors.text, marginTop: 19 }]}>
          Senha
        </Text>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.input, borderColor: colors.border },
          ]}
        >
          <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo de 8 caracteres"
            placeholderTextColor={colors.muted}
            secureTextEntry={!passwordVisible}
            maxLength={64}
            style={[styles.input, { color: colors.text }]}
          />
          <Pressable
            onPress={() => setPasswordVisible((isVisible) => !isVisible)}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={colors.muted}
            />
          </Pressable>
        </View>
        <Pressable
          onPress={createAccount}
          disabled={isSubmitting}
          style={[
            styles.primaryButton,
            {
              backgroundColor: colors.accentStrong,
              opacity: isSubmitting ? 0.7 : 1,
            },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryText}>Criar minha conta</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </Pressable>
      </View>
      <View style={styles.footer}>
        <Text style={{ color: colors.muted }}>Já tem uma conta? </Text>
        <Link href="/(public)/login" asChild>
          <Pressable>
            <Text style={{ color: colors.accent, fontWeight: '700' }}>
              Entrar
            </Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginTop: 12,
    marginBottom: 38,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6 },
  title: {
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 12 },
  form: { marginTop: 32 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 9 },
  inputWrap: {
    height: 54,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  input: { flex: 1, fontSize: 14 },
  primaryButton: {
    height: 54,
    marginTop: 28,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footer: {
    marginTop: 'auto',
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
