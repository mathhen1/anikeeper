import { Platform } from 'react-native';
import {
  StorageAccessFramework,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import {
  getLocalAnimeLists,
  localAnimeListOptions,
} from '@/src/data/cache/localAnimeLists';

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
  const exportSections = localAnimeListOptions.map((list) => {
    const animeTitles = localLists[list.key]
      .map((anime) => anime.title.trim())
      .filter(Boolean);
    const heading = list.label.toUpperCase();

    return `${heading}\n\n${animeTitles.join('\n')}`;
  });
  const exportContent = exportSections.join('\n\n');
  const fileUri = await StorageAccessFramework.createFileAsync(
    permission.directoryUri,
    'anikeeper-listas.txt',
    'text/plain',
  );

  await writeAsStringAsync(fileUri, exportContent);
}
