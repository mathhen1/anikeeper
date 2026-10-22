import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
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
import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/auth/AuthContext';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { signInOfficial } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const createAccount = async () => {
    if (!name.trim() || !email.trim() || password.trim().length < 6)
      return Alert.alert(
        'Confira seus dados',
        'Preencha todos os campos e use uma senha com pelo menos 6 caracteres.',
      );
    await signInOfficial(email.trim());
    router.replace('/(app)');
  };

  return (
    <Screen scroll safeAreaEdges={['top', 'bottom']}>
      <View style={styles.top}>
        <Link href="/(public)/login" asChild>
          <Pressable style={[styles.back, { backgroundColor: colors.surface }]}>
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
            style={[styles.input, { color: colors.text }]}
          />
        </View>
        <Text style={[styles.label, { color: colors.text, marginTop: 19 }]}>
          E-mail
        </Text>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.input, borderColor: colors.border },
          ]}
        >
          <Ionicons name="mail-outline" size={18} color={colors.muted} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
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
            placeholder="Mínimo de 6 caracteres"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={[styles.input, { color: colors.text }]}
          />
        </View>
        <Pressable
          onPress={createAccount}
          style={[
            styles.primaryButton,
            { backgroundColor: colors.accentStrong },
          ]}
        >
          <Text style={styles.primaryText}>Criar minha conta</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
