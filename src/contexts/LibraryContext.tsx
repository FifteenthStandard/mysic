import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { FileSystemClient } from '../clients';
import { sortAlbums, sortArtists } from '../helpers';
import type {
  Album,
  Artist,
  LibraryAccessor,
  LibraryDispatch,
  LibraryInitializer,
  LibraryState,
  LibraryAction,
  Song,
} from '../types';

type LibraryStateInternal = LibraryState & {
  initialized: boolean;
}

const LibraryContext = createContext<LibraryStateInternal | undefined>(undefined);
const LibraryAccessorContext = createContext<LibraryAccessor | undefined>(undefined);
const LibraryDispatchContext = createContext<LibraryDispatch | undefined>(undefined);
const LibraryInitializerContext = createContext<LibraryInitializer | undefined>(undefined);

const initialState: LibraryStateInternal = {
  initialized: false,
  albums: {},
  artists: {},
  songs: {},
};

function reduce(state: LibraryStateInternal, action: LibraryAction): LibraryStateInternal {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...action.state, initialized: true };

    case 'RESET':
      return { ...initialState };

    case 'SET_ALBUM':
      const { album } = action;
      return {
        ...state,
        albums: { ...state.albums, [album.albumId]: album },
      };

    case 'SET_ARTIST':
      const { artist } = action;
      return {
        ...state,
        artists: { ...state.artists, [artist.artistId]: artist },
      };

    default:
      return state;
  }
};

export function LibraryProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [ state, dispatch ] = useReducer(reduce, initialState);

  const persistentDispatch = useCallback(function (action: LibraryAction): void {
    FileSystemClient.dispatch(action);
    dispatch(action);
  }, [ dispatch ]);

  const initializer = createLibraryInitializer(dispatch);
  const accessor = createLibraryAccessor(state);
  const dispatcher = createLibraryDispatch(state, persistentDispatch);

  useEffect(() => {
    initializer.initialize(false);
  }, []);

  return (
    <LibraryContext.Provider value={state}>
      <LibraryInitializerContext.Provider value={initializer}>
        <LibraryAccessorContext.Provider value={accessor}>
          <LibraryDispatchContext.Provider value={dispatcher}>
            {children}
          </LibraryDispatchContext.Provider>
        </LibraryAccessorContext.Provider>
      </LibraryInitializerContext.Provider>
    </LibraryContext.Provider>
  );
};

export function useLibrary(): LibraryAccessor {
  const context = useContext(LibraryAccessorContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

export function useLibraryDispatch(): LibraryDispatch {
  const context = useContext(LibraryDispatchContext);
  if (context === undefined) {
    throw new Error('useLibraryDispatch must be used within a LibraryProvider');
  }
  return context;
};

export function useLibraryInitializer(): LibraryInitializer {
  const context = useContext(LibraryInitializerContext);
  if (context === undefined) {
    throw new Error('useLibraryInitializer must be used within a LibraryProvider');
  }
  return context;
};

function createLibraryInitializer(dispatch: React.ActionDispatch<[action: LibraryAction]>): LibraryInitializer {
  const initialize = useCallback(function (userRequested: boolean): void {
    (async function () {
      if (!await FileSystemClient.initialize(userRequested)) return;
      let state;
      state = await FileSystemClient.state();
      dispatch({
        type: 'INITIALIZE',
        state,
      });
    }());
  }, [ dispatch ]);

  const reset = useCallback(function (): void {
    (async function () {
      await FileSystemClient.reset();
      dispatch({ type: 'RESET' });
    }());
  }, [ dispatch ]);
  return {
    initialize,
    reset,
  };
};

function createLibraryAccessor(state: LibraryStateInternal): LibraryAccessor {
  const initialized = state.initialized;

  const albums = useMemo(() => sortAlbums(Object.values(state.albums)), [ state.albums ]);

  const artists = useMemo(() => sortArtists(Object.values(state.artists)), [ state.artists ]);

  const getAlbum = useCallback(function (albumId: string): Album {
    return state.albums[albumId];
  }, [ state.albums ]);

  const getArtist = useCallback(function (artistId: string): Artist {
    return {
      ...state.artists[artistId],
      albums: sortAlbums(Object.values(state.albums).filter(a => a.artistId === artistId)),
    };
  }, [ state.artists ]);

  const getSong = useCallback(function (songId: string): Song {
    const song = state.songs[songId];
    return {
      ...song,
      album: state.albums[song.albumId],
    };
  }, [ state.albums, state.songs ]);

  return useMemo(() => ({
    initialized,
    albums,
    artists,
    getAlbum,
    getArtist,
    getSong,
  }), [ initialized, albums, artists, getAlbum, getArtist, getSong ]);
};

function createLibraryDispatch(state: LibraryState, dispatch: React.ActionDispatch<[action: LibraryAction]>): LibraryDispatch {
  const addAlbum = useCallback(function (album: Album): void {
    if (!(album.artistId in state.artists)) {
      dispatch({
        type: 'SET_ARTIST',
        artist: { artistId: album.artistId, artistName: album.artistName },
      });
    }
    dispatch({
      type: 'SET_ALBUM',
      album,
    });
  }, [ state, dispatch ]);

  return useMemo(() => ({
    addAlbum,
  }), [ addAlbum ]);
};
