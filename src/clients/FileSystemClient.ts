import {
  getDbState,
  saveDbState,
  deleteDb,
  getAlbum,
  listAlbums,
  searchArtists,
} from '.';
import type {
  Album,
  AlbumSummary,
  ArtistSummary,
  LibraryAction,
  LibraryClient,
  LibraryState,
  SongFile,
} from '../types';

let rootHandle: FileSystemDirectoryHandle | undefined = undefined;

async function initialize(userRequested: boolean): Promise<boolean> {
  rootHandle = await getDbState<FileSystemDirectoryHandle>('FileSystemClient');
  if (rootHandle !== undefined) return true;
  if (!userRequested) return false;
  try {
    rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
  } catch (error) {
    return false;
  }
  await saveDbState('FileSystemClient', rootHandle);
  return true;
};

async function state(): Promise<LibraryState> {
  if (!rootHandle) return { albums: {}, artists: {}, songs: {} };

  const albums: Record<string, Album> = {};
  const artists: Record<string, ArtistSummary> = {};
  const songs: Record<string, SongFile> = {};

  for await (const [ artistName, artistHandle ] of rootHandle.entries()) {
    if (artistHandle.kind !== 'directory') continue;

    let artist: ArtistSummary | null = await getMetadata(artistHandle);
    if (artist === null) {
      const results = await searchArtists(artistName);
      [ artist ] = results;
      await saveMetadata(artistHandle, artist);
    }

    artists[artist.artistId] = artist;

    let artistAlbums: AlbumSummary[] | null;
    for await (const [ albumName, albumHandle ] of artistHandle.entries()) {
      if (albumHandle.kind !== 'directory') continue;

      let album: Album | null = await getMetadata<Album>(albumHandle);
      if (album === null) {
        artistAlbums ||= await listAlbums(artist.artistId);
        const albumSummary = artistAlbums.find(a => `(${a.releaseDate.substring(0, 4)}) ${a.albumName}` === albumName);
        if (!albumSummary) continue;
        album = await getAlbum(albumSummary.albumId);
        await saveMetadata(albumHandle, album);
      }

      albums[album.albumId] = album;

      for await (const [ songName, songHandle ] of albumHandle.entries()) {
        if (songHandle.kind !== 'file') continue;

        const match = songName.match(/^\d+/);
        if (!match || match.length !== 1) continue;

        const position = parseInt(match[0]);
        const song = album.songs[position - 1];
        songs[song.songId] = { ...song, handle: songHandle };
      }
    }
  }

  return {
    albums,
    artists,
    songs,
  };
};

async function dispatch(action: LibraryAction): Promise<void> {
  if (!rootHandle) return;

  switch (action.type) {
    default: return Promise.resolve();
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
  state,
  dispatch,
  reset,
};

async function getMetadata<T>(directory: FileSystemDirectoryHandle): Promise<T | null> {
  try {
    const fileHandle = await directory.getFileHandle('.metadata', { create: false });
    const file = await fileHandle.getFile();
    const text = await file.text();
    const json = await JSON.parse(text);
    return json as T;
  } catch (error) {
    return null;
  }
};

async function saveMetadata(directory: FileSystemDirectoryHandle, metadata: Album | ArtistSummary): Promise<void> {
  const fileHandle = await directory.getFileHandle('.metadata', { create: true });
  const stream = await fileHandle.createWritable({ keepExistingData: false });
  await stream.write(JSON.stringify(metadata));
  await stream.close();
};
