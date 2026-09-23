export type Album = AlbumSummary & {
  artistName: string;
  songs: SongSummary[];
}

export type AlbumCover = {
  thumbnail: string;
  highdef: string;
}

export type AlbumSummary = {
  artistId: string;
  albumId: string;
  releaseDate: string;
  albumName: string;
  cover: AlbumCover;
}

export type Artist = ArtistSummary & {
  albums: Album[];
}

export type ArtistSummary = {
  artistId: string;
  artistName: string;
}

export type SongSummary = {
  artistId: string;
  albumId: string;
  songId: string;
  position: number;
  songName: string;
  durationMs: number;
}

export type SongFile = SongSummary & {
  handle: FileSystemFileHandle;
}

export type Song = SongFile & {
  album: Album;
}

export interface LibraryAccessor {
  initialized: boolean;
  albums: AlbumSummary[];
  artists: ArtistSummary[];
  getAlbum(albumId: string): Album;
  getArtist(artistId: string): Artist;
  getSong(songId: string): Song;
}

export interface LibraryDispatch {
  addAlbum(album: Album): void;
}

export interface LibraryInitializer {
  initialize(userRequested: boolean): void;
  reset(): void;
}

type InitializeAction = {
  type: 'INITIALIZE';
  state: LibraryState;
}

type ResetAction = {
  type: 'RESET';
}

type SetAlbumAction = {
  type: 'SET_ALBUM';
  album: Album;
}

type SetArtistAction = {
  type: 'SET_ARTIST';
  artist: ArtistSummary;
}

export type LibraryAction =
  | InitializeAction
  | ResetAction
  | SetAlbumAction
  | SetArtistAction;

export type LibraryState = {
  albums: Record<string, Album>;
  artists: Record<string, ArtistSummary>;
  songs: Record<string, SongFile>;
}

export interface LibraryClient {
  initialize(userRequested: boolean): Promise<boolean>;
  state(): Promise<LibraryState>;
  dispatch(action: LibraryAction): Promise<void>;
  reset(): Promise<void>;
}

export interface NowPlayingDispatch {
  play(albums: Album[], position?: [ number, number ]): void;
  add(album: Album): void;
  jumpTo(position: [ number, number ]): void;
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