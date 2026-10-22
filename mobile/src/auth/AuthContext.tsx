import AsyncStorage from '@react-native-async-storage/async-storage';
import { migrateLegacyLocalAnimeLists } from '@/src/data/cache/localAnimeLists';
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
        let mode: AuthMode = null;
        if (savedMode === 'local') {
          mode = 'local';
        } else if (savedMode === 'official' || hasSession) {
          mode = 'official';
        }

        setIsAuthenticated(hasSession);
        setAuthMode(mode);
        setLocalName(
          hasSession && mode === 'local' ? savedLocalName ?? '' : '',
        );

        // Existing prototype sessions had no mode. Keep them on the official route.
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
    await AsyncStorage.setItem('anikeeper-auth-mode', 'official');
    await AsyncStorage.setItem('anikeeper-auth', 'true');
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

    await AsyncStorage.setItem('anikeeper-local-name', normalizedName);
    await AsyncStorage.setItem('anikeeper-auth-mode', 'local');
    await AsyncStorage.setItem('anikeeper-auth', 'true');
    setLocalName(normalizedName);
    setIsAuthenticated(true);
    setAuthMode('local');
  };

  const signOut = async () => {
    if (authMode === 'local' && localName.trim()) {
      await migrateLegacyLocalAnimeLists(localName);
      await AsyncStorage.removeItem('anikeeper-local-name');
    }

    await AsyncStorage.removeItem('anikeeper-auth');
    await AsyncStorage.removeItem('anikeeper-auth-mode');
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
