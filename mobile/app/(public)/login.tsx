import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '@/src/components/Screen';
import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/auth/AuthContext';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { loginOfficial } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const normalizedUsername = username.trim();
    if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
      return Alert.alert(
        'Confira seu username',
        'O username deve ter entre 3 e 20 caracteres.',
      );
    }
    if (password.length < 8 || password.length > 64) {
      return Alert.alert(
        'Confira sua senha',
        'A senha deve ter entre 8 e 64 caracteres.',
      );
    }

    setIsSubmitting(true);
    try {
      await loginOfficial(normalizedUsername, password);
      router.replace('/(main)');
    } catch (error: unknown) {
      Alert.alert(
        'Não foi possível entrar',
        error instanceof Error ? error.message : 'Tente novamente em instantes.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scroll safeAreaEdges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="bookmark" size={24} color={colors.accent} />
          </View>
          <Text style={[styles.brandName, { color: colors.text }]}>
            ani<Text style={{ color: colors.accent }}>keeper</Text>
          </Text>
        </View>
        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.text }]}>
            Seu próximo episódio{'\n'}começa aqui.
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Entre na sua conta e continue de onde parou.
          </Text>
        </View>
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Username</Text>
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
              placeholder="Seu username"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              returnKeyType="next"
              style={[styles.input, { color: colors.text }]}
            />
          </View>
          <Text style={[styles.label, { color: colors.text, marginTop: 18 }]}>
            Senha
          </Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.input, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={colors.muted}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Sua senha"
              placeholderTextColor={colors.muted}
              secureTextEntry={!passwordVisible}
              style={[styles.input, { color: colors.text }]}
            />
            <Pressable onPress={() => setPasswordVisible(!passwordVisible)}>
              <Ionicons
                name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={19}
                color={colors.muted}
              />
            </Pressable>
          </View>
          <Pressable style={styles.forgot}>
            <Text style={[styles.forgotText, { color: colors.accent }]}>
              Esqueceu a senha?
            </Text>
          </Pressable>
          <Pressable
            onPress={handleLogin}
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
                <Text style={styles.primaryText}>Entrar</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Text style={{ color: colors.muted }}>Ainda não tem uma conta? </Text>
          <Link href="/(public)/register" asChild>
            <Pressable>
              <Text style={{ color: colors.accent, fontWeight: '700' }}>
                Criar conta
              </Text>
            </Pressable>
          </Link>
        </View>
        <Text style={[styles.terms, { color: colors.muted }]}>
          Ao continuar, você concorda com nossos Termos de uso e Política de
          privacidade.
        </Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 21, fontWeight: '800', letterSpacing: -0.8 },
  heading: { marginTop: 52, gap: 12 },
  title: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: { fontSize: 14, lineHeight: 21 },
  form: { marginTop: 36 },
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
  forgot: { alignSelf: 'flex-end', marginTop: 14 },
  forgotText: { fontSize: 12, fontWeight: '600' },
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
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  terms: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 14,
  },
});
