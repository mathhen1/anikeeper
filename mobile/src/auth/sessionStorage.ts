import * as SecureStore from 'expo-secure-store';

const accessTokenStorageKey = 'anikeeper-official-access-token';

export function getStoredAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(accessTokenStorageKey);
}

export function saveAccessToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(accessTokenStorageKey, token);
}

export function clearStoredAccessToken(): Promise<void> {
  return SecureStore.deleteItemAsync(accessTokenStorageKey);
}
