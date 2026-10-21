import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

const palettes = {
  dark: {
    background: '#101014', surface: '#19191F', elevated: '#22222A', text: '#F4F3F7', muted: '#92919D',
    border: '#2B2A33', accent: '#B59AF7', accentStrong: '#9D7DF0', accentSoft: '#282239', success: '#8DD6B1',
    input: '#19191F', tabBar: '#17171D', poster: '#252430',
  },
  light: {
    background: '#F7F6FA', surface: '#FFFFFF', elevated: '#F0EEF5', text: '#211F29', muted: '#777482',
    border: '#E5E2EB', accent: '#7354C8', accentStrong: '#6242B8', accentSoft: '#EEE9FA', success: '#31845B',
    input: '#FFFFFF', tabBar: '#FFFFFF', poster: '#E9E6EF',
  },
};

type ThemeContextValue = {
  mode: ThemeMode;
  colors: (typeof palettes)['dark'];
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem('anikeeper-theme').then((savedMode) => {
      if (savedMode === 'light' || savedMode === 'dark') setModeState(savedMode);
    }).catch(() => undefined);
  }, []);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
    AsyncStorage.setItem('anikeeper-theme', nextMode).catch(() => undefined);
  };

  const value = useMemo(() => ({
    mode,
    colors: palettes[mode],
    setMode,
    toggleMode: () => setMode(mode === 'dark' ? 'light' : 'dark'),
  }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme precisa ser usado dentro de ThemeProvider.');
  return context;
}
