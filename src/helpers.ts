export function sortAlbums<T extends { artistName?: string, releaseDate: string }>(albums: T[]): T[] {
  return albums.toSorted((a, b) => a.artistName && b.artistName && a.artistName.localeCompare(b.artistName) || a.releaseDate.localeCompare(b.releaseDate));
};

export function sortArtists<T extends { artistName: string }>(artists: T[]): T[] {
  return artists.toSorted((a, b) => a.artistName.localeCompare(b.artistName));
};

export function sortSongs<T extends { position: number }>(songs: T[]): T[] {
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
