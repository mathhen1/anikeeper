import AsyncStorage from 'expo-sqlite/kv-store';
import {
  deleteLocalAnimeLists,
  migrateLegacyLocalAnimeLists,
  renameLocalAnimeLists,
} from '@/src/data/cache/localAnimeLists';
import {
  deleteLocalProfilePhoto,
  renameLocalProfilePhoto,
} from '@/src/data/cache/localProfilePhoto';
import {
  AuthApiError,
  getOfficialAccount,
  loginOfficialAccount,
  registerOfficialAccount,
} from '@/src/auth/authApi';
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  saveAccessToken,
} from '@/src/auth/sessionStorage';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

export type AuthMode = 'official' | 'local' | null;

type AuthContextValue = {
  authMode: AuthMode;
  isAuthenticated: boolean;
  isReady: boolean;
  requiresReauthentication: boolean;
  localName: string;
  officialUsername: string;
  accessToken: string | null;
  updateLocalName: (newName: string) => Promise<void>;
  deleteLocalAccount: () => Promise<void>;
  loginOfficial: (username: string, password: string) => Promise<void>;
  registerOfficial: (username: string, password: string) => Promise<void>;
  signInLocal: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const authStorageKeys = [
  'anikeeper-auth',
  'anikeeper-auth-mode',
  'anikeeper-local-name',
  'anikeeper-official-username',
  'anikeeper-user',
];

function isInvalidAccessToken(error: unknown): boolean {
  return (
    error instanceof AuthApiError &&
    (error.statusCode === 401 || error.statusCode === 404)
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [requiresReauthentication, setRequiresReauthentication] =
    useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [localName, setLocalName] = useState('');
  const [officialUsername, setOfficialUsername] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      try {
        const [savedAuth, savedMode, savedLocalName] = await Promise.all([
          AsyncStorage.getItem('anikeeper-auth'),
          AsyncStorage.getItem('anikeeper-auth-mode'),
          AsyncStorage.getItem('anikeeper-local-name'),
        ]);

        if (savedAuth === 'true' && savedMode === 'local') {
          if (savedLocalName) {
            await migrateLegacyLocalAnimeLists(savedLocalName);
          }

          await clearStoredAccessToken().catch(() => undefined);
          if (isActive) {
            setIsAuthenticated(true);
            setAuthMode('local');
            setLocalName(savedLocalName ?? '');
          }
          return;
        }

        if (savedMode === 'official') {
          const savedToken = await getStoredAccessToken();
          if (!savedToken) {
            await AsyncStorage.multiRemove(authStorageKeys);
            if (isActive) setRequiresReauthentication(true);
            return;
          }

          try {
            const account = await getOfficialAccount(savedToken);
            await AsyncStorage.setItem(
              'anikeeper-official-username',
              account.username,
            );
            if (isActive) {
              setIsAuthenticated(true);
              setAuthMode('official');
              setOfficialUsername(account.username);
              setAccessToken(savedToken);
            }
          } catch (error: unknown) {
            if (isInvalidAccessToken(error)) {
              await clearStoredAccessToken();
              await AsyncStorage.multiRemove(authStorageKeys);
              if (isActive) setRequiresReauthentication(true);
              return;
            }

            const cachedUsername = await AsyncStorage.getItem(
              'anikeeper-official-username',
            );
            console.warn(
              'Could not validate the saved session. Keeping it until the API is available.',
              error,
            );
            if (isActive) {
              setIsAuthenticated(true);
              setAuthMode('official');
              setOfficialUsername(cachedUsername ?? '');
              setAccessToken(savedToken);
            }
          }
          return;
        }

        await clearStoredAccessToken().catch(() => undefined);
        if (savedAuth === 'true' || savedMode === 'official') {
          await AsyncStorage.multiRemove(authStorageKeys);
        }
      } catch (error: unknown) {
        console.warn('Could not restore the saved session.', error);
      } finally {
        if (isActive) setIsReady(true);
      }
    }

    void restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const saveOfficialSession = async (
    username: string,
    password: string,
    action: 'login' | 'register',
  ) => {
    const response =
      action === 'register'
        ? await registerOfficialAccount({ username, password })
        : await loginOfficialAccount({ username, password });

    await saveAccessToken(response.accessToken);

    try {
      await AsyncStorage.multiSet([
        ['anikeeper-auth', 'true'],
        ['anikeeper-auth-mode', 'official'],
        ['anikeeper-official-username', response.user.username],
      ]);
      await AsyncStorage.multiRemove([
        'anikeeper-local-name',
        'anikeeper-user',
      ]);
    } catch (error: unknown) {
      await clearStoredAccessToken().catch(() => undefined);
      throw error;
    }

    setLocalName('');
    setOfficialUsername(response.user.username);
    setAccessToken(response.accessToken);
    setRequiresReauthentication(false);
    setIsAuthenticated(true);
    setAuthMode('official');
  };

  const loginOfficial = (username: string, password: string) =>
    saveOfficialSession(username.trim(), password, 'login');

  const registerOfficial = (username: string, password: string) =>
    saveOfficialSession(username.trim(), password, 'register');

  const signInLocal = async (name: string) => {
    const normalizedName = name.trim();
    const previousLocalName = await AsyncStorage.getItem(
      'anikeeper-local-name',
    );

    if (previousLocalName) {
      await migrateLegacyLocalAnimeLists(previousLocalName);
    }

    await clearStoredAccessToken();
    await AsyncStorage.removeItem('anikeeper-user');
    await AsyncStorage.removeItem('anikeeper-official-username');
    await AsyncStorage.setItem('anikeeper-local-name', normalizedName);
    await AsyncStorage.setItem('anikeeper-auth-mode', 'local');
    await AsyncStorage.setItem('anikeeper-auth', 'true');
    setLocalName(normalizedName);
    setOfficialUsername('');
    setAccessToken(null);
    setRequiresReauthentication(false);
    setIsAuthenticated(true);
    setAuthMode('local');
  };

  const updateLocalName = async (newName: string) => {
    const normalizedName = newName.trim();
    const currentName = localName.trim();

    if (authMode !== 'local' || !currentName) {
      throw new Error('Não foi possível identificar a sessão local atual.');
    }
    if (!normalizedName) {
      throw new Error('Informe um username válido.');
    }
    if (normalizedName === currentName) return;

    let didRenamePhoto = false;
    let didRenameLists = false;

    try {
      await renameLocalProfilePhoto(currentName, normalizedName);
      didRenamePhoto = true;
      await renameLocalAnimeLists(currentName, normalizedName);
      didRenameLists = true;
      await AsyncStorage.setItem('anikeeper-local-name', normalizedName);
    } catch (error) {
      if (didRenameLists) {
        await renameLocalAnimeLists(normalizedName, currentName).catch(
          (rollbackError: unknown) => {
            console.warn('Could not restore local anime lists after rename.', rollbackError);
          },
        );
      }
      if (didRenamePhoto) {
        await renameLocalProfilePhoto(normalizedName, currentName).catch(
          (rollbackError: unknown) => {
            console.warn('Could not restore the profile photo after rename.', rollbackError);
          },
        );
      }
      throw error;
    }

    setLocalName(normalizedName);
  };

  const deleteLocalAccount = async () => {
    const username = localName.trim();
    if (authMode !== 'local' || !username) {
      throw new Error('Não foi possível identificar a sessão local atual.');
    }

    await deleteLocalAnimeLists(username);
    await deleteLocalProfilePhoto(username);
    await AsyncStorage.multiRemove([
      ...authStorageKeys,
    ]);
    await clearStoredAccessToken();
    setIsAuthenticated(false);
    setAuthMode(null);
    setLocalName('');
    setOfficialUsername('');
    setAccessToken(null);
    setRequiresReauthentication(false);
  };

  const signOut = async () => {
    if (authMode === 'local' && localName.trim()) {
      await migrateLegacyLocalAnimeLists(localName);
      await AsyncStorage.removeItem('anikeeper-local-name');
    }

    await clearStoredAccessToken();
    await AsyncStorage.multiRemove(authStorageKeys);
    setIsAuthenticated(false);
    setAuthMode(null);
    setLocalName('');
    setOfficialUsername('');
    setAccessToken(null);
    setRequiresReauthentication(false);
  };

  return (
    <AuthContext.Provider
      value={{
        authMode,
        isAuthenticated,
        isReady,
        requiresReauthentication,
        localName,
        officialUsername,
        accessToken,
        updateLocalName,
        deleteLocalAccount,
        loginOfficial,
        registerOfficial,
        signInLocal,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.');
  return context;
}
