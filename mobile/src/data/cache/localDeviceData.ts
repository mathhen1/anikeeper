import AsyncStorage from 'expo-sqlite/kv-store';
import { Directory, File, Paths } from 'expo-file-system';
import { clearLocalAnimeListCountsMemoryCache } from '@/src/data/cache/localAnimeListCountsCache';
import { clearLocalProfilePhotoMemoryCache } from '@/src/data/cache/localProfilePhoto';
import { clearProfileStatsMemoryCache } from '@/src/data/cache/localProfileStatsCache';

function deleteManagedFiles(
  directory: Directory,
  isManagedFile: (fileName: string) => boolean,
): void {
  for (const entry of directory.list()) {
    if (entry instanceof File && isManagedFile(entry.name)) {
      entry.delete();
    }
  }
}

function isLocalProfilePhoto(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.jpg');
}

function isLocalCacheFile(fileName: string): boolean {
  return (
    isLocalProfilePhoto(fileName) ||
    fileName.startsWith('anikeeper-profile-stats-') ||
    fileName.startsWith('anikeeper-anime-list-counts-')
  );
}

export async function deleteAllLocalDeviceData(): Promise<void> {
  clearLocalAnimeListCountsMemoryCache();
  clearLocalProfilePhotoMemoryCache();
  clearProfileStatsMemoryCache();

  await AsyncStorage.clear();
  deleteManagedFiles(Paths.document, isLocalProfilePhoto);
  deleteManagedFiles(Paths.cache, isLocalCacheFile);
}
