import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Screen } from '@/src/components/Screen';
import { AccountDetails } from '@/src/components/AccountDetails';
import { useAuth } from '@/src/auth/AuthContext';
import {
  getLocalProfilePhoto,
  saveLocalProfilePhoto,
} from '@/src/data/cache/localProfilePhoto';
import { ThemeMode, useTheme } from '@/src/theme/ThemeContext';
import { getLocalAnimeLists } from '@/src/data/cache/localAnimeLists';
import { exportLocalAnimeData } from '@/src/data/localAnimeExport';
import {
  getOrCreateProfileStats,
  type ProfileStats,
  readProfileStatsCache,
  subscribeToProfileStats,
} from '@/src/data/cache/localProfileStatsCache';

const menuItems: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
}[] = [
  {
    icon: 'code-download-outline',
    title: 'Extrair dados',
    detail: 'Salve suas informações para reuso',
  },
  {
    icon: 'code-slash-outline',
    title: 'Importar dados',
    detail: 'Importe informações de perfis anteriores',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Detalhes da conta',
    detail: 'Faça ajustes no seu perfil',
  },
  {
    icon: 'help-circle-outline',
    title: 'Ajuda e suporte',
    detail: 'Estamos por aqui',
  },
];

export default function ProfileScreen() {
  const { colors, mode, setMode } = useTheme();
  const { authMode, localName, signOut } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const isLocalAccount = authMode === 'local';
  const displayName =
    localName.trim() || (isLocalAccount ? 'Perfil local' : 'Conta oficial');
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [isAccountDetailsVisible, setIsAccountDetailsVisible] = useState(false);
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const photoSize = Math.min(screenWidth - 48, 420);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(() =>
    readProfileStatsCache(localName),
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (!isLocalAccount || !localName.trim()) {
        setProfileStats(null);
        setProfilePhotoUri(null);
        return;
      }

      setProfileStats(readProfileStatsCache(localName));
      const unsubscribeFromProfileStats = subscribeToProfileStats(
        localName,
        (stats) => {
          if (isActive) setProfileStats(stats);
        },
      );
      getOrCreateProfileStats(localName, async () => {
        const localLists = await getLocalAnimeLists(localName);
        return localLists.completed;
      })
        .then((stats) => {
          if (isActive) setProfileStats(stats);
        })
        .catch((error: unknown) => {
          if (isActive)
            Alert.alert(
              'Erro ao carregar estatísticas',
              error instanceof Error
                ? error.message
                : 'Não foi possível calcular os dados do perfil.',
            );
        });
      getLocalProfilePhoto(localName)
        .then((photoUri) => {
          if (isActive) setProfilePhotoUri(photoUri);
        })
        .catch((error: unknown) => {
          if (isActive) {
            Alert.alert(
              'Erro ao carregar foto',
              error instanceof Error
                ? error.message
                : 'Não foi possível carregar sua foto de perfil.',
            );
          }
        });
      return () => {
        isActive = false;
        unsubscribeFromProfileStats();
      };
    }, [isLocalAccount, localName]),
  );

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(public)');
  };

  const exportUserData = async () => {
    if (!isLocalAccount || !localName.trim()) {
      Alert.alert(
        'Exportação indisponível',
        'A exportação local está disponível para perfis locais.',
      );
      return;
    }

    setIsExportingData(true);
    try {
      await exportLocalAnimeData(localName);
      Alert.alert(
        'Dados exportados',
        `O arquivo ${localName}.json foi salvo na pasta Downloads.`,
      );
    } catch (error) {
      Alert.alert(
        'Não foi possível exportar os dados',
        error instanceof Error
          ? error.message
          : 'Tente novamente e selecione a pasta Downloads.',
      );
    } finally {
      setIsExportingData(false);
    }
  };

  const openSupportDocumentation = async () => {
    const documentationUrl =
      'https://github.com/mathhen1/anikeeper/blob/main/mobile/README.md';

    try {
      await Linking.openURL(documentationUrl);
    } catch {
      Alert.alert(
        'Não foi possível abrir o link',
        'Verifique se há um navegador instalado no dispositivo.',
      );
    }
  };

  const handleMenuItemPress = (title: string) => {
    if (title === 'Extrair dados') {
      void exportUserData();
      return;
    }

    if (title === 'Ajuda e suporte') {
      void openSupportDocumentation();
      return;
    }

    if (title === 'Detalhes da conta') {
      setIsAccountDetailsVisible(true);
      return;
    }

    Alert.alert(title, 'Esta opção estará disponível em breve.');
  };

  const chooseTheme = (selectedMode: ThemeMode) => setMode(selectedMode);

  const changeProfilePhoto = async () => {
    setIsChangingPhoto(true);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        const permissionActions = permission.canAskAgain
          ? [{ text: 'Entendi', style: 'cancel' as const }]
          : [
              {
                text: 'Abrir configurações',
                onPress: () => Linking.openSettings(),
              },
              { text: 'Cancelar', style: 'cancel' as const },
            ];

        Alert.alert(
          'Acesso à galeria necessário',
          'Permita o acesso às fotos para escolher uma imagem de perfil.',
          permissionActions,
        );
        return;
      }

      const selection = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (selection.canceled || !selection.assets[0]) return;

      const savedPhotoUri = await saveLocalProfilePhoto(
        localName,
        selection.assets[0].uri,
      );
      setProfilePhotoUri(savedPhotoUri);
    } catch (error) {
      Alert.alert(
        'Não foi possível alterar a foto',
        error instanceof Error
          ? error.message
          : 'Tente selecionar a imagem novamente.',
      );
    } finally {
      setIsChangingPhoto(false);
    }
  };

  const showProfilePhotoOptions = () => {
    const actions = profilePhotoUri
      ? [
          {
            text: 'Ver foto',
            onPress: () => setIsPhotoModalVisible(true),
          },
          { text: 'Alterar foto', onPress: changeProfilePhoto },
          { text: 'Cancelar', style: 'cancel' as const },
        ]
      : [
          { text: 'Alterar foto', onPress: changeProfilePhoto },
          { text: 'Cancelar', style: 'cancel' as const },
        ];

    Alert.alert('Foto de perfil', 'O que você deseja fazer?', actions);
  };

  return (
    <Screen scroll style={styles.screen}>
      <Text style={[styles.pageTitle, { color: colors.text }]}>Perfil</Text>
      <View
        style={[
          styles.profileCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Pressable
          onPress={showProfilePhotoOptions}
          disabled={!isLocalAccount || isChangingPhoto}
          accessibilityRole="button"
          accessibilityLabel="Opções da foto de perfil"
          style={({ pressed }) => [
            styles.avatar,
            { backgroundColor: colors.accentSoft, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          {isChangingPhoto ? (
            <ActivityIndicator color={colors.accent} />
          ) : profilePhotoUri ? (
            <Image
              source={{ uri: profilePhotoUri }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={[styles.avatarText, { color: colors.accent }]}>
              {avatarInitial}
            </Text>
          )}
          {isLocalAccount && (
            <View
              style={[styles.avatarEditBadge, { backgroundColor: colors.accent }]}
            >
              <Ionicons name="camera-outline" size={12} color="#FFFFFF" />
            </View>
          )}
        </Pressable>
        <Text style={[styles.name, { color: colors.accent }]}>
          {displayName.toUpperCase()}
        </Text>
        <Text style={[styles.email, { color: colors.muted }]}>
          {isLocalAccount ? 'Dados salvos neste aparelho' : 'Conta oficial'}
        </Text>
        <View
          style={[styles.memberBadge, { backgroundColor: colors.accentSoft }]}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={12}
            color={colors.accent}
          />
          <Text style={[styles.memberText, { color: colors.accent }]}>
            {isLocalAccount ? 'Perfil local' : 'Conta oficial'}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.collectionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.collectionStat}>
          <Text style={[styles.collectionNumber, { color: colors.text }]}>
            {profileStats?.completedAnimeCount ?? '—'}
          </Text>
          <Text style={[styles.collectionLabel, { color: colors.muted }]}>
            animes concluídos
          </Text>
        </View>
        <View
          style={[styles.verticalDivider, { backgroundColor: colors.border }]}
        />
        <View style={styles.collectionStat}>
          <Text style={[styles.collectionNumber, { color: colors.text }]}>
            {profileStats?.completedEpisodeCount ?? '—'}
          </Text>
          <Text style={[styles.collectionLabel, { color: colors.muted }]}>
            total de episódios
          </Text>
        </View>
        <View
          style={[styles.verticalDivider, { backgroundColor: colors.border }]}
        />
        <View style={styles.collectionStat}>
          <Text style={[styles.collectionNumber, { color: colors.text }]}>
            {profileStats?.watchedHours ?? '—'}
          </Text>
          <Text style={[styles.collectionLabel, { color: colors.muted }]}>
            horas assistidas
          </Text>
        </View>
      </View>
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>
        APARÊNCIA
      </Text>
      <View
        style={[
          styles.settingsCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.settingRow}>
          <View
            style={[styles.itemIcon, { backgroundColor: colors.accentSoft }]}
          >
            <Ionicons
              name={mode === 'dark' ? 'moon' : 'sunny'}
              size={17}
              color={colors.accent}
            />
          </View>
          <View style={styles.settingCopy}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              Modo escuro
            </Text>
            <Text style={[styles.itemDetail, { color: colors.muted }]}>
              Ajuste a aparência do aplicativo
            </Text>
          </View>
          <Switch
            value={mode === 'dark'}
            onValueChange={(isDark) => chooseTheme(isDark ? 'dark' : 'light')}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View
          style={[styles.themeChoices, { backgroundColor: colors.elevated }]}
        >
          <Pressable
            onPress={() => chooseTheme('light')}
            style={[
              styles.themeChoice,
              mode === 'light' && { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="sunny-outline"
              size={15}
              color={mode === 'light' ? colors.accent : colors.muted}
            />
            <Text
              style={[
                styles.themeText,
                { color: mode === 'light' ? colors.text : colors.muted },
              ]}
            >
              Claro
            </Text>
          </Pressable>
          <Pressable
            onPress={() => chooseTheme('dark')}
            style={[
              styles.themeChoice,
              mode === 'dark' && { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="moon-outline"
              size={15}
              color={mode === 'dark' ? colors.accent : colors.muted}
            />
            <Text
              style={[
                styles.themeText,
                { color: mode === 'dark' ? colors.text : colors.muted },
              ]}
            >
              Escuro
            </Text>
          </Pressable>
        </View>
      </View>
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>SESSÃO</Text>
      <View
        style={[
          styles.settingsCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {menuItems.map((item, index) => (
          <Pressable
            key={item.title}
            onPress={() => handleMenuItemPress(item.title)}
            disabled={item.title === 'Extrair dados' && isExportingData}
            style={[
              styles.menuRow,
              index < menuItems.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View
              style={[styles.itemIcon, { backgroundColor: colors.elevated }]}
            >
              {item.title === 'Extrair dados' && isExportingData ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Ionicons name={item.icon} size={18} color={colors.muted} />
              )}
            </View>
            <View style={styles.settingCopy}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.itemDetail, { color: colors.muted }]}>
                {item.detail}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={handleSignOut}
        style={[styles.logout, { borderColor: colors.border }]}
      >
        <Ionicons name="log-out-outline" size={17} color={colors.muted} />
        <Text style={[styles.logoutText, { color: colors.muted }]}>
          Encerrar sessão
        </Text>
      </Pressable>
      <Text style={[styles.version, { color: colors.muted }]}>
        ANIKEEPER · VERSÃO 1.0.0
      </Text>
      <Modal
        visible={isPhotoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <View style={styles.photoModalBackdrop}>
          <Pressable
            onPress={() => setIsPhotoModalVisible(false)}
            style={styles.photoModalClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar foto"
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
          {profilePhotoUri ? (
            <Image
              source={{ uri: profilePhotoUri }}
              resizeMode="contain"
              style={{ width: photoSize, height: photoSize, borderRadius: 20 }}
            />
          ) : null}
        </View>
      </Modal>
      <AccountDetails
        visible={isAccountDetailsVisible}
        username={displayName}
        photoUri={profilePhotoUri}
        onClose={() => setIsAccountDetailsVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 18, paddingBottom: 18 },
  pageTitle: { fontSize: 23, fontWeight: '800', marginBottom: 20 },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 23,
    borderWidth: 1,
    borderRadius: 19,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'visible',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 23 },
  avatarEditBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: { fontSize: 25, fontWeight: '800' },
  photoModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  photoModalClose: {
    position: 'absolute',
    top: 56,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    zIndex: 1,
  },
  name: { fontSize: 17, fontWeight: '700' },
  email: { fontSize: 12, marginTop: 5 },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: 12,
  },
  memberText: { fontSize: 10, fontWeight: '600' },
  collectionCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 13,
  },
  collectionStat: { alignItems: 'center', gap: 4 },
  collectionNumber: { fontSize: 16, fontWeight: '800' },
  collectionLabel: { fontSize: 9 },
  verticalDivider: { width: 1, height: 27 },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginTop: 25,
    marginBottom: 10,
  },
  settingsCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 12,
  },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingCopy: { flex: 1, gap: 4 },
  itemTitle: { fontSize: 12, fontWeight: '600' },
  itemDetail: { fontSize: 10 },
  themeChoices: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
    gap: 4,
  },
  themeChoice: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeText: { fontSize: 11, fontWeight: '600' },
  menuRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  logout: {
    marginTop: 20,
    height: 47,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { fontSize: 12, fontWeight: '600' },
  version: {
    textAlign: 'center',
    fontSize: 9,
    letterSpacing: 1.1,
    marginTop: 17,
    marginBottom: 12,
  },
});
