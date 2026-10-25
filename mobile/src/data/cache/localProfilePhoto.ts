import AsyncStorage from 'expo-sqlite/kv-store';
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

function getCachedWebpFileName(username: string): string {
  return `${encodeURIComponent(normalizeUsername(username))}.webp`;
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

export async function cacheProfilePhotoFile(
  username: string,
  sourceUri: string,
): Promise<string> {
  const cachedPhoto = new File(Paths.cache, getCachedWebpFileName(username));
  await new File(sourceUri).copy(cachedPhoto, { overwrite: true });
  cacheProfilePhoto(username, cachedPhoto.uri);
  return cachedPhoto.uri;
}

export async function writeProfilePhotoCache(
  username: string,
  imageBytes: Uint8Array,
): Promise<string> {
  const cachedPhoto = new File(Paths.cache, getCachedWebpFileName(username));
  await cachedPhoto.write(imageBytes);
  cacheProfilePhoto(username, cachedPhoto.uri);
  return cachedPhoto.uri;
}

export function clearProfilePhotoCache(username: string): void {
  const cachedPhoto = new File(Paths.cache, getCachedWebpFileName(username));
  if (cachedPhoto.exists) cachedPhoto.delete();
  cacheProfilePhoto(username, null);
}

export function readLocalProfilePhotoCache(
  username: string,
): string | null | undefined {
  const normalizedUsername = normalizeUsername(username);
  if (!profilePhotoCache.has(normalizedUsername)) {
    const cachedPhoto = new File(
      Paths.cache,
      getCachedWebpFileName(normalizedUsername),
    );
    if (!cachedPhoto.exists) return undefined;

    profilePhotoCache.set(normalizedUsername, cachedPhoto.uri);
    return cachedPhoto.uri;
  }

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

export async function renameLocalProfilePhoto(
  currentUsername: string,
  newUsername: string,
): Promise<void> {
  const currentKey = getStorageKey(currentUsername);
  const newKey = getStorageKey(newUsername);
  if (currentKey === newKey) return;

  const currentPhotoUri = await AsyncStorage.getItem(currentKey);
  if (!currentPhotoUri) return;

  if (await AsyncStorage.getItem(newKey)) {
    throw new Error('Este username já possui uma foto de perfil local.');
  }

  const currentPhoto = new File(currentPhotoUri);
  if (!currentPhoto.exists) {
    await AsyncStorage.removeItem(currentKey);
    cacheProfilePhoto(currentUsername, null);
    return;
  }

  const newPhoto = new File(Paths.document, getFileName(newUsername));
  await currentPhoto.copy(newPhoto, { overwrite: false });
  await AsyncStorage.setItem(newKey, newPhoto.uri);
  await AsyncStorage.removeItem(currentKey);

  const oldCachedPhoto = new File(Paths.cache, getFileName(currentUsername));
  if (oldCachedPhoto.exists) oldCachedPhoto.delete();

  const newCachedPhoto = new File(Paths.cache, getFileName(newUsername));
  let displayedPhotoUri = newPhoto.uri;
  try {
    await newPhoto.copy(newCachedPhoto, { overwrite: true });
    displayedPhotoUri = newCachedPhoto.uri;
  } catch (error) {
    console.warn('Could not cache the renamed profile photo.', error);
  }

  const oldPersistentPhoto = new File(currentPhotoUri);
  if (oldPersistentPhoto.exists) oldPersistentPhoto.delete();
  cacheProfilePhoto(currentUsername, null);
  cacheProfilePhoto(newUsername, displayedPhotoUri);
}

export async function deleteLocalProfilePhoto(username: string): Promise<void> {
  const photoUri = await AsyncStorage.getItem(getStorageKey(username));
  if (photoUri) {
    const persistentPhoto = new File(photoUri);
    if (persistentPhoto.exists) persistentPhoto.delete();
    await AsyncStorage.removeItem(getStorageKey(username));
  }

  const storedPhoto = new File(Paths.document, getFileName(username));
  if (storedPhoto.exists) storedPhoto.delete();

  const cachedPhoto = new File(Paths.cache, getFileName(username));
  if (cachedPhoto.exists) cachedPhoto.delete();
  cacheProfilePhoto(username, null);
}
