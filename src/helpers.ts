import type { Album, Artist, Song } from './types';

export function sortAlbums(albums: Album[]): Album[] {
  return albums.toSorted((a, b) => a.artistName && b.artistName && a.artistName.localeCompare(b.artistName) || a.releaseYear - b.releaseYear);
};

export function sortArtists(artists: Artist[]): Artist[] {
  return artists.toSorted((a, b) => a.artistName.localeCompare(b.artistName));
};

export function sortSongs(songs: Song[]): Song[] {
  return songs.toSorted((a, b) => a.position - b.position);
};

export function formatTime(timeMs: number): string {
  const timeS = Math.floor(timeMs / 1000);
  const seconds = (timeS % 60).toString().padStart(2, '0');
  const timeM = Math.floor(timeS / 60);
  const minutes = (timeM % 60).toString().padStart(2, '0');
  const timeH = Math.floor(timeM / 60);
  return timeH > 0
    ? `${timeH}:${minutes}:${seconds}`
    : `${minutes}:${seconds}`;
};


export async function getObjectUrl(fileHandle: FileSystemFileHandle): Promise<string> {
  const file = await fileHandle.getFile();
  return URL.createObjectURL(file);
};
