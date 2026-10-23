import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '@/src/auth/AuthContext';
import { clearLocalAnimeLists } from '@/src/data/cache/localAnimeLists';
import { useTheme } from '@/src/theme/ThemeContext';

type AccountDetailsProps = {
  visible: boolean;
  username: string;
  photoUri: string | null;
  onClose: () => void;
};

const saveColor = '#35C98A';
const dangerColor = '#F06474';

export function AccountDetails({
  visible,
  username,
  photoUri,
  onClose,
}: AccountDetailsProps) {
  const { colors } = useTheme();
  const {
    authMode,
    deleteLocalAccount,
    isAuthenticated,
    isReady,
    localName,
    updateLocalName,
  } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const [isModalVisible, setIsModalVisible] = useState(visible);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState(username);
  const slideAnimation = useRef(new Animated.Value(screenWidth)).current;
  const backdropAnimation = useRef(new Animated.Value(0)).current;
  const isLocalAccount = authMode === 'local';
  const hasValidSession =
    isAuthenticated && (authMode === 'local' || authMode === 'official');
  const panelWidth = Math.min(screenWidth * 0.88, 420);
  const profileLabel =
    username.trim() || (isLocalAccount ? 'Perfil local' : 'Conta oficial');

  useEffect(() => {
    setEditedUsername(username);
  }, [username]);

  useEffect(() => {
    if (!visible || !isReady || hasValidSession) return;

    Alert.alert(
      'Sessão inválida',
      'Entre novamente para acessar os detalhes da conta.',
    );
    onClose();
  }, [hasValidSession, isReady, onClose, visible]);

  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnimation, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!isModalVisible) return;

    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: screenWidth,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnimation, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setIsModalVisible(false);
    });
  }, [
    backdropAnimation,
    isModalVisible,
    screenWidth,
    slideAnimation,
    visible,
  ]);

  const closeDrawer = () => onClose();

  const saveUpdates = async () => {
    if (!isLocalAccount) {
      Alert.alert(
        'Indisponível no protótipo',
        'As alterações da conta oficial estarão disponíveis quando o login oficial estiver implementado.',
      );
      return;
    }

    if (!editedUsername.trim()) {
      Alert.alert('Nome inválido', 'Informe um username para continuar.');
      return;
    }

    try {
      await updateLocalName(editedUsername);
      setIsEditingUsername(false);
      Alert.alert('Username atualizado', 'Seu novo username foi salvo.');
    } catch (error) {
      Alert.alert(
        'Não foi possível atualizar o username',
        error instanceof Error ? error.message : 'Tente novamente.',
      );
    }
  };

  const showDeleteDataConfirmation = () => {
    if (!isLocalAccount) {
      Alert.alert(
        'Indisponível no protótipo',
        'A exclusão dos dados oficiais estará disponível quando o backend for implementado.',
      );
      return;
    }
    if (!localName.trim()) {
      Alert.alert('Sessão inválida', 'Entre novamente para continuar.');
      return;
    }

    Alert.alert(
      'Excluir dados da conta?',
      'Somente as listas de animes serão apagadas. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir listas',
          style: 'destructive',
          onPress: () => {
            void clearLocalAnimeLists(localName)
              .then(() => {
                Alert.alert('Listas excluídas', 'Suas listas foram apagadas.');
              })
              .catch((error: unknown) => {
                Alert.alert(
                  'Não foi possível excluir as listas',
                  error instanceof Error ? error.message : 'Tente novamente.',
                );
              });
          },
        },
      ],
    );
  };

  const showDeleteAccountConfirmation = () => {
    if (!isLocalAccount) {
      Alert.alert(
        'Indisponível no protótipo',
        'A exclusão da conta oficial estará disponível quando o backend for implementado.',
      );
      return;
    }

    Alert.alert(
      'Excluir conta local?',
      'Sua conta, suas listas e sua foto de perfil serão apagadas deste aparelho. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir conta',
          style: 'destructive',
          onPress: () => {
            void deleteLocalAccount()
              .then(() => router.replace('/(public)'))
              .catch((error: unknown) => {
                Alert.alert(
                  'Não foi possível excluir a conta',
                  error instanceof Error ? error.message : 'Tente novamente.',
                );
              });
          },
        },
      ],
    );
  };

  if (!isModalVisible || !hasValidSession) return null;

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeDrawer}
    >
      <View style={styles.modalRoot}>
        <Animated.View
          pointerEvents="none"
          style={[styles.backdrop, { opacity: backdropAnimation }]}
        />
        <Pressable
          onPress={closeDrawer}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Fechar detalhes da conta"
        />
        <Animated.View
          style={[
            styles.drawer,
            {
              width: panelWidth,
              backgroundColor: colors.background,
              borderLeftColor: colors.border,
              transform: [{ translateX: slideAnimation }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Minha conta</Text>
            <Pressable
              onPress={closeDrawer}
              style={[styles.closeButton, { backgroundColor: colors.elevated }]}
              accessibilityRole="button"
              accessibilityLabel="Fechar drawer"
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.profileSection}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.accentSoft },
              ]}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarInitial, { color: colors.accent }]}>
                  {profileLabel.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <Text style={[styles.accountType, { color: colors.muted }]}>
              {isLocalAccount ? 'SESSÃO LOCAL' : 'CONTA OFICIAL'}
            </Text>
          </View>

          <Text style={[styles.fieldLabel, { color: colors.muted }]}>
            {isLocalAccount ? 'USERNAME' : 'PERFIL'}
          </Text>
          <View
            style={[
              styles.usernameField,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TextInput
              value={isLocalAccount ? editedUsername : profileLabel}
              onChangeText={setEditedUsername}
              editable={isLocalAccount && isEditingUsername}
              selectTextOnFocus={isLocalAccount && isEditingUsername}
              style={[styles.usernameInput, { color: colors.text }]}
              placeholder="Seu username"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              accessibilityLabel="Username do perfil"
            />
            {isLocalAccount && (
              <Pressable
                onPress={() => setIsEditingUsername((isEditing) => !isEditing)}
                accessibilityRole="button"
                accessibilityLabel="Editar username"
                hitSlop={8}
              >
                <Ionicons name="pencil" size={17} color={colors.accent} />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={saveUpdates}
            style={({ pressed }) => [
              styles.actionButton,
              styles.saveButton,
              { borderColor: saveColor, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <Text style={[styles.actionText, { color: saveColor }]}>
              Salvar atualizações
            </Text>
          </Pressable>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          <Pressable
            onPress={showDeleteDataConfirmation}
            style={({ pressed }) => [
              styles.actionButton,
              styles.dangerButton,
              { opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <Text style={[styles.actionText, { color: dangerColor }]}>
              Excluir dados da minha conta
            </Text>
          </Pressable>

          <Pressable
            onPress={showDeleteAccountConfirmation}
            style={({ pressed }) => [
              styles.actionButton,
              styles.dangerButton,
              { opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <Text style={[styles.actionText, { color: dangerColor }]}>
              {isLocalAccount
                ? 'Excluir minha conta local'
                : 'Excluir minha conta oficial'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
  },
  drawer: {
    height: '100%',
    borderLeftWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 58,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 21, fontWeight: '800' },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: { alignItems: 'center', marginTop: 35, marginBottom: 30 },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: { fontSize: 30, fontWeight: '800' },
  accountType: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  usernameField: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  usernameInput: { flex: 1, fontSize: 14, paddingVertical: 12 },
  actionButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  saveButton: { borderWidth: 1, marginTop: 16 },
  actionText: { textAlign: 'center', fontSize: 13, fontWeight: '700' },
  separator: { height: 1, marginVertical: 26 },
  dangerButton: { marginBottom: 8 },
});
