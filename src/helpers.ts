export function sortAlbums<T extends { artistName?: string, releaseDate: string }>(albums: T[]): T[] {
  return albums.toSorted((a, b) => a.artistName && b.artistName && a.artistName.localeCompare(b.artistName) || a.releaseDate.localeCompare(b.releaseDate));
};

export function sortArtists<T extends { artistName: string }>(artists: T[]): T[] {
  return artists.toSorted((a, b) => a.artistName.localeCompare(b.artistName));
};

export function sortSongs<T extends { position: number }>(songs: T[]): T[] {
  return songs.toSorted((a, b) => a.position - b.position);
};
