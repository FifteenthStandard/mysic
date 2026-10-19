export type Artist = {
  artistId: string;
  artistName: string;
}

export type Album = Artist & {
  albumId: string;
  albumName: string;
  releaseYear: number;
  cover?: string;
  songs: Song[];
}

export type Song = {
  songId: string;
  position: number;
  songName: string;
  durationMs: number;
  handle: FileSystemFileHandle;
}

export interface LibraryClient {
  initialize(userRequested: boolean): Promise<boolean>;
  reset(): Promise<void>;
  load(): AsyncGenerator<Artist | Album, void, unknown>;
}

export interface LibraryInitializer {
  initialize(userRequested: boolean): void;
  reset(): void;
}

export interface LibraryAccessor {
  status: 'uninitialized' | 'initializing' | 'initialized';
  artists: Artist[];
  albums: Album[];
  getAlbums(artistId: string): Album[];
  getAlbum(albumId: string): Album;
}

export interface NowPlayingDispatch {
  play(albums: Album[], position?: [ number, number ]): void;
  add(album: Album): void;
  jumpTo(position: [ number, number ]): void;
  jumpTo(songId: string): void;
  pause(): void;
  resume(): void;
  restart(): void;
  next(): void;
  previous(): void;
  stop(): void;
  seek(position: number): void;
}

export type NowPlayingState = {
  status: PlayStatus;
  albums: Album[];
  position?: [ number, number ];
  album?: Album;
  song?: Song;
  progress?: Progress;
}

export type PlayStatus =
  | 'playing'
  | 'paused'
  | 'stopped'
  | 'seeking';

export type Progress = {
  position: number;
  duration: number;
}
