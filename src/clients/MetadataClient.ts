import { sortAlbums, sortSongs } from '../helpers';
import type { Album, AlbumSummary, ArtistSummary, SongSummary } from '../types';

const baseUrl: string = 'https://itunes.apple.com';

export async function listAlbums(artistId: string): Promise<AlbumSummary[]> {
  const resp = await fetch(`${baseUrl}/lookup?id=${artistId}&entity=album`);
  const json = await resp.json() as LookupAlbumsResults;
  return sortAlbums(json.results
    .filter(({ wrapperType }) => wrapperType === 'collection')
    .map(result => mapAlbum(result as AlbumResult)));
};

export async function getAlbum(albumId: string): Promise<Album> {
  const resp = await fetch(`${baseUrl}/lookup?id=${albumId}&entity=song`);
  const json = await resp.json() as LookupSongsResults;
  const albumResult = json.results
    .filter(({ wrapperType }) => wrapperType === 'collection')[0] as AlbumResult;
  const artist = mapArtist(albumResult);
  const album = mapAlbum(albumResult);
  const songs = sortSongs(json.results
    .filter(({ wrapperType }) => wrapperType === 'track')
    .map(result => mapSong(result as SongResult)));
  return {
    ...album,
    ...artist,
    songs,
  };
};

export async function searchArtists(name: string): Promise<ArtistSummary[]> {
  const resp = await fetch(`${baseUrl}/search?term=${name}&entity=musicArtist`);
  const json = await resp.json() as SearchMusicArtistsResults;
  return json.results.map(mapArtist);
};

type AlbumResult = ArtistDetails & {
  wrapperType: 'collection';
  collectionId: number;
  releaseDate: string;
  collectionName: string;
  artworkUrl100: string;
}

type ArtistDetails = {
  artistId: number;
  artistName: string;
}

type ArtistResult = ArtistDetails & {
  wrapperType: 'artist';
}

type LookupAlbumsResults = {
  results: (AlbumResult | ArtistResult)[];
}

type LookupSongsResults = {
  results: (AlbumResult | SongResult)[];
}

type SearchMusicArtistsResults = {
  results: ArtistResult[];
}

type SongResult = {
  wrapperType: 'track'
  artistId: number;
  collectionId: number;
  trackId: number;
  trackName: string;
  trackNumber: number;
  trackTimeMillis: number;
}

function mapAlbum({ artistId, collectionId, releaseDate, collectionName, artworkUrl100 }: AlbumResult): AlbumSummary {
  return {
    artistId: artistId.toString(),
    albumId: collectionId.toString(),
    releaseDate,
    albumName: collectionName,
    cover: {
      thumbnail: artworkUrl100.replace('100x100', '200x200'),
      highdef: artworkUrl100.replace('100x100', '800x800'),
    },
  };
};

function mapArtist({ artistId, artistName }: ArtistDetails): ArtistSummary {
  return {
    artistId: artistId.toString(),
    artistName,
  };
};

function mapSong({ artistId, collectionId, trackId, trackName, trackNumber, trackTimeMillis }: SongResult): SongSummary {
  return {
    artistId: artistId.toString(),
    albumId: collectionId.toString(),
    songId: trackId.toString(),
    position: trackNumber,
    songName: trackName,
    durationMs: trackTimeMillis,
  };
};
