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
  localName: string;
  updateLocalName: (newName: string) => Promise<void>;
  deleteLocalAccount: () => Promise<void>;
  signInOfficial: (email: string) => Promise<void>;
  signInLocal: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [localName, setLocalName] = useState('');

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('anikeeper-auth'),
      AsyncStorage.getItem('anikeeper-auth-mode'),
      AsyncStorage.getItem('anikeeper-local-name'),
    ])
      .then(([savedAuth, savedMode, savedLocalName]) => {
        const hasSession = savedAuth === 'true';
        const mode: AuthMode = hasSession
          ? savedMode === 'local'
            ? 'local'
            : 'official'
          : null;

        setIsAuthenticated(hasSession);
        setAuthMode(mode);
        setLocalName(
          hasSession && mode === 'local' ? savedLocalName ?? '' : '',
        );

        // Treat existing prototype sessions without a mode as official accounts.
        if (hasSession && savedMode !== 'local' && savedMode !== 'official') {
          AsyncStorage.setItem('anikeeper-auth-mode', 'official').catch(
            () => undefined,
          );
        }
      })
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, []);

  const signInOfficial = async (email: string) => {
    await AsyncStorage.setItem('anikeeper-user', email);
    await AsyncStorage.removeItem('anikeeper-local-name');
    await AsyncStorage.setItem('anikeeper-auth-mode', 'official');
    await AsyncStorage.setItem('anikeeper-auth', 'true');
    setLocalName('');
    setIsAuthenticated(true);
    setAuthMode('official');
  };

  const signInLocal = async (name: string) => {
    const normalizedName = name.trim();
    const previousLocalName = await AsyncStorage.getItem(
      'anikeeper-local-name',
    );

    if (previousLocalName) {
      await migrateLegacyLocalAnimeLists(previousLocalName);
    }

    await AsyncStorage.removeItem('anikeeper-user');
    await AsyncStorage.setItem('anikeeper-local-name', normalizedName);
    await AsyncStorage.setItem('anikeeper-auth-mode', 'local');
    await AsyncStorage.setItem('anikeeper-auth', 'true');
    setLocalName(normalizedName);
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
      'anikeeper-auth',
      'anikeeper-auth-mode',
      'anikeeper-local-name',
      'anikeeper-user',
    ]);
    setIsAuthenticated(false);
    setAuthMode(null);
    setLocalName('');
  };

  const signOut = async () => {
    if (authMode === 'local' && localName.trim()) {
      await migrateLegacyLocalAnimeLists(localName);
      await AsyncStorage.removeItem('anikeeper-local-name');
    }

    await AsyncStorage.removeItem('anikeeper-auth');
    await AsyncStorage.removeItem('anikeeper-auth-mode');
    await AsyncStorage.removeItem('anikeeper-user');
    setIsAuthenticated(false);
    setAuthMode(null);
    setLocalName('');
  };

  return (
    <AuthContext.Provider
      value={{
        authMode,
        isAuthenticated,
        isReady,
        localName,
        updateLocalName,
        deleteLocalAccount,
        signInOfficial,
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
