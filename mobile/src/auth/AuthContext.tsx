import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

type AuthContextValue = { isAuthenticated: boolean; isReady: boolean; signIn: (email: string) => Promise<void>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('anikeeper-auth').then((value) => setIsAuthenticated(value === 'true')).catch(() => undefined).finally(() => setIsReady(true));
  }, []);

  const signIn = async (email: string) => {
    await AsyncStorage.setItem('anikeeper-user', email);
    await AsyncStorage.setItem('anikeeper-auth', 'true');
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('anikeeper-auth');
    setIsAuthenticated(false);
  };

  return <AuthContext.Provider value={{ isAuthenticated, isReady, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa ser usado dentro de AuthProvider.');
  return context;
}
