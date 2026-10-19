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
  LibraryInitializer,
} from '../types';

type LibraryState = {
  status: 'uninitialized' | 'initializing' | 'initialized';
  artists: Record<string, Artist>;
  albumsByArtistId: Record<string, Album[]>;
  albumsByAlbumId: Record<string, Album>;
}

const LibraryContext = createContext<LibraryState | undefined>(undefined);
const LibraryAccessorContext = createContext<LibraryAccessor | undefined>(undefined);
const LibraryInitializerContext = createContext<LibraryInitializer | undefined>(undefined);

const initialState: LibraryState = {
  status: 'uninitialized',
  artists: {},
  albumsByArtistId: {},
  albumsByAlbumId: {},
};

type InitializingAction = {
  type: 'INITIALIZING';
}

type InitializedAction = {
  type: 'INITIALIZED';
}

type ResetAction = {
  type: 'RESET';
}

type ArtistAddedAction = {
  type: 'ARTIST_ADDED';
  artist: Artist;
}

type AlbumAddedAction = {
  type: 'ALBUM_ADDED';
  album: Album;
}

type LibraryAction =
  | InitializingAction
  | InitializedAction
  | ResetAction
  | ArtistAddedAction
  | AlbumAddedAction;

function reduce(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    case 'INITIALIZING':
      return {
        ...state,
        status: 'initializing',
      };

    case 'INITIALIZED':
      return {
        ...state,
        status: 'initialized',
      };

    case 'RESET':
      return { ...initialState };

    case 'ARTIST_ADDED':
      const { artist } = action;
      return {
        ...state,
        artists: {
          ...state.artists,
          [artist.artistId]: artist,
        },
      };

    case 'ALBUM_ADDED':
      const { album } = action;
      return {
        ...state,
        albumsByArtistId: {
          ...state.albumsByArtistId,
          [album.artistId]: [
            ...(state.albumsByArtistId[album.artistId] ?? []),
            album,
          ],
        },
        albumsByAlbumId: {
          ...state.albumsByAlbumId,
          [album.albumId]: album,
        },
      };

    default:
      return state;
  }
};

export function LibraryProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [ state, dispatch ] = useReducer(reduce, initialState);

  const initializer = createLibraryInitializer(dispatch);
  const accessor = createLibraryAccessor(state);

  useEffect(() => {
    initializer.initialize(false);
  }, []);

  return (
    <LibraryContext.Provider value={state}>
      <LibraryInitializerContext.Provider value={initializer}>
        <LibraryAccessorContext.Provider value={accessor}>
          {children}
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
      dispatch({ type: 'INITIALIZING' });
      for await (const item of FileSystemClient.load()) {
        if ('albumId' in item) {
          dispatch({ type: 'ALBUM_ADDED', album: item });
        } else {
          dispatch({ type: 'ARTIST_ADDED', artist: item });
        }
      }
      dispatch({ type: 'INITIALIZED' });
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

function createLibraryAccessor(state: LibraryState): LibraryAccessor {
  const status = state.status;
  const artists = useMemo(() => sortArtists(Object.values(state.artists)), [ state.artists ]);
  const albums = useMemo(() => sortAlbums(Object.values(state.albumsByAlbumId)), [ state.albumsByAlbumId ]);


  const getAlbums = useCallback(function (artistId: string): Album[] {
    return sortAlbums(state.albumsByArtistId[artistId]);
  }, [ state.albumsByArtistId ]);


  const getAlbum = useCallback(function (albumId: string): Album {
    return state.albumsByAlbumId[albumId];
  }, [ state.albumsByAlbumId ]);

  return useMemo(() => ({
    status,
    artists,
    albums,
    getAlbums,
    getAlbum,
  }), [ status, artists, albums, getAlbums, getAlbum ]);
};
