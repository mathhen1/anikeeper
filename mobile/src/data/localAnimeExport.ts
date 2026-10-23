import { Platform } from 'react-native';
import {
  StorageAccessFramework,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import { getLocalAnimeLists } from '@/src/data/cache/localAnimeLists';

function sanitizeFileName(value: string): string {
  return value.trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_');
}

function isDownloadsDirectory(directoryUri: string): boolean {
  return decodeURIComponent(directoryUri).toLowerCase().includes('download');
}

export async function exportLocalAnimeData(username: string): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new Error('A exportação para Downloads está disponível no Android.');
  }

  const downloadsDirectoryUri =
    StorageAccessFramework.getUriForDirectoryInRoot('Download');
  const permission =
    await StorageAccessFramework.requestDirectoryPermissionsAsync(
      downloadsDirectoryUri,
    );

  if (!permission.granted) {
    throw new Error('Acesso à pasta Downloads não autorizado.');
  }

  if (!isDownloadsDirectory(permission.directoryUri)) {
    throw new Error('Selecione a pasta Downloads para salvar o arquivo.');
  }

  const localLists = await getLocalAnimeLists(username);
  const exportData = {
    app: 'AniKeeper',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    username,
    lists: localLists,
  };
  const fileName = sanitizeFileName(username) || 'anikeeper';
  const fileUri = await StorageAccessFramework.createFileAsync(
    permission.directoryUri,
    fileName,
    'application/json',
  );

  await writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));
}
