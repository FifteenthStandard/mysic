import {
  deleteDb,
  getDbState,
  saveDbState,
} from '.';
import { getObjectUrl, sortSongs } from '../helpers';
import type {
  Album,
  Artist,
  LibraryClient,
  Song,
} from '../types';

let rootHandle: FileSystemDirectoryHandle | undefined = undefined;

async function initialize(userRequested: boolean): Promise<boolean> {
  rootHandle = await getDbState<FileSystemDirectoryHandle>('FileSystemClient');
  if (rootHandle !== undefined) {
    if (userRequested) await rootHandle.requestPermission({ mode: 'read' });
    return (await rootHandle.queryPermission({ mode: 'read' })) === 'granted';
  }
  if (!userRequested) return false;
  try {
    rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
  } catch (error) {
    return false;
  }
  await saveDbState('FileSystemClient', rootHandle);
  return true;
};

async function *load(): AsyncGenerator<Artist | Album, void, unknown> {
  if (!rootHandle) return;

  for await (const [ artistName, artistHandle ] of rootHandle.entries()) {
    if (artistHandle.kind !== 'directory') continue;

    const artist = {
      artistId: artistName,
      artistName,
    };
    yield artist;

    for await (const [ albumDirectoryName, albumHandle ] of artistHandle.entries()) {
      if (albumHandle.kind !== 'directory') continue;

      const match = albumDirectoryName.match(/^\((\d+)\) (.+)/);
      if (!match || match.length !== 3) continue;

      const releaseYear = parseInt(match[1]);
      const albumName = match[2];

      let cover: string | undefined = undefined;
      try {
        const coverHandle = await albumHandle.getFileHandle('cover.png');
        cover = await getObjectUrl(coverHandle);
      } catch {
        // ignore
      }

      const songs: Song[] = [];

      for await (const [ songFileName, songHandle ] of albumHandle.entries()) {
        if (songHandle.kind !== 'file') continue;

        const match = songFileName.match(/^(\d+)(?: -)? (.+)\.([^ ]+)/);
        if (!match || match.length !== 4) continue;

        const position = parseInt(match[1]);
        const songName = match[2];

        const song: Song = {
          songId: `${artistName}/${albumName}/${songFileName}`,
          position,
          songName,
          durationMs: 0, // TODO
          handle: songHandle,
        };
        songs.push(song);
      }
      const album: Album = {
        ...artist,
        albumId: `${artistName}/${albumName}`,
        albumName,
        releaseYear,
        cover,
        songs: sortSongs(songs),
      };

      yield album;
    }
  }
};

async function reset(): Promise<void> {
  if (!rootHandle) return;

  for await (const [ _, artistHandle ] of rootHandle.entries()) {
    if (artistHandle.kind !== 'directory') continue;
    try { artistHandle.removeEntry('.metadata'); }
    catch (error) { }

    for await (const [ _, albumHandle ] of artistHandle.entries()) {
      if (albumHandle.kind !== 'directory') continue;
      try { albumHandle.removeEntry('.metadata'); }
      catch (error) { }
    }
  }

  await deleteDb();
};

export const FileSystemClient: LibraryClient = {
  initialize,
  reset,
  load,
};
