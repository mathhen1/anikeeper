import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';

const storageKeyPrefix = 'anikeeper-local-profile-photo';
const profilePhotoCache = new Map<string, string | null>();
const profilePhotoListeners = new Map<
  string,
  Set<(uri: string | null) => void>
>();

export function clearLocalProfilePhotoMemoryCache(): void {
  profilePhotoCache.clear();
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function getStorageKey(username: string): string {
  return `${storageKeyPrefix}:${encodeURIComponent(normalizeUsername(username))}`;
}

function getFileName(username: string): string {
  return `${encodeURIComponent(normalizeUsername(username))}.jpg`;
}

function notifyProfilePhotoListeners(username: string, uri: string | null): void {
  const listeners = profilePhotoListeners.get(normalizeUsername(username));
  listeners?.forEach((listener) => listener(uri));
}

function cacheProfilePhoto(username: string, uri: string | null): void {
  const normalizedUsername = normalizeUsername(username);
  profilePhotoCache.set(normalizedUsername, uri);
  notifyProfilePhotoListeners(normalizedUsername, uri);
}

export function readLocalProfilePhotoCache(
  username: string,
): string | null | undefined {
  const normalizedUsername = normalizeUsername(username);
  if (!profilePhotoCache.has(normalizedUsername)) return undefined;

  const cachedUri = profilePhotoCache.get(normalizedUsername) ?? null;
  if (cachedUri && !new File(cachedUri).exists) {
    profilePhotoCache.delete(normalizedUsername);
    return undefined;
  }

  return cachedUri;
}

export function subscribeToLocalProfilePhoto(
  username: string,
  listener: (uri: string | null) => void,
): () => void {
  const normalizedUsername = normalizeUsername(username);
  const listeners = profilePhotoListeners.get(normalizedUsername) ?? new Set();
  listeners.add(listener);
  profilePhotoListeners.set(normalizedUsername, listeners);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) profilePhotoListeners.delete(normalizedUsername);
  };
}

export async function getLocalProfilePhoto(
  username: string,
): Promise<string | null> {
  const normalizedUsername = normalizeUsername(username);
  const cachedUri = readLocalProfilePhotoCache(normalizedUsername);
  if (cachedUri !== undefined) return cachedUri;

  const persistentUri = await AsyncStorage.getItem(
    getStorageKey(normalizedUsername),
  );
  if (!persistentUri) {
    cacheProfilePhoto(normalizedUsername, null);
    return null;
  }

  const persistentPhoto = new File(persistentUri);
  if (!persistentPhoto.exists) {
    await AsyncStorage.removeItem(getStorageKey(normalizedUsername));
    cacheProfilePhoto(normalizedUsername, null);
    return null;
  }

  const cachedPhoto = new File(Paths.cache, getFileName(normalizedUsername));
  if (!cachedPhoto.exists) {
    try {
      await persistentPhoto.copy(cachedPhoto, { overwrite: true });
    } catch (error) {
      console.warn('Could not restore the local profile photo cache.', error);
      cacheProfilePhoto(normalizedUsername, persistentPhoto.uri);
      return persistentPhoto.uri;
    }
  }

  const photoUri = cachedPhoto.exists ? cachedPhoto.uri : persistentPhoto.uri;
  cacheProfilePhoto(normalizedUsername, photoUri);
  return photoUri;
}

export async function saveLocalProfilePhoto(
  username: string,
  selectedPhotoUri: string,
): Promise<string> {
  const normalizedUsername = normalizeUsername(username);
  const persistentPhoto = new File(
    Paths.document,
    getFileName(normalizedUsername),
  );
  const selectedPhoto = new File(selectedPhotoUri);

  await selectedPhoto.copy(persistentPhoto, { overwrite: true });
  await AsyncStorage.setItem(
    getStorageKey(normalizedUsername),
    persistentPhoto.uri,
  );

  const cachedPhoto = new File(Paths.cache, getFileName(normalizedUsername));
  let photoUri = persistentPhoto.uri;

  try {
    await persistentPhoto.copy(cachedPhoto, { overwrite: true });
    photoUri = cachedPhoto.uri;
  } catch (error) {
    console.warn('Could not cache the local profile photo.', error);
  }

  cacheProfilePhoto(normalizedUsername, photoUri);
  return photoUri;
}
