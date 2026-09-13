import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useLibrary } from '.';
import type {
  Album,
  NowPlayingDispatch,
  NowPlayingState,
  Song,
} from '../types';

const NowPlayingContext = createContext<NowPlayingState | undefined>(undefined);
const NowPlayingDispatchContext = createContext<NowPlayingDispatch | undefined>(undefined);

type NowPlayingStateInternal = NowPlayingState & {
  objectUrl?: string;
}

const initialState: NowPlayingStateInternal = {
  status: 'stopped',
  albums: [],
  position: undefined,
  song: undefined,
  progress: undefined,
};

type PlayAction = {
  type: 'PLAY';
  albums: Album[];
  position: [ number, number ];
  song: Song;
  objectUrl: string;
}

type AddAction = {
  type: 'ADD';
  album: Album;
}

type JumpToAction = {
  type: 'JUMP_TO';
  position: [ number, number ];
  song: Song;
  objectUrl: string;
}

type PauseAction = {
  type: 'PAUSE';
}

type ResumeAction = {
  type: 'RESUME';
}

type StopAction = {
  type: 'STOP';
}

type SeekAction = {
  type: 'SEEK';
  position: number;
  userRequested: boolean;
}

type NowPlayingAction =
  | PlayAction
  | AddAction
  | JumpToAction
  | PauseAction
  | ResumeAction
  | StopAction
  | SeekAction;

function reduce(state: NowPlayingStateInternal, action: NowPlayingAction): NowPlayingStateInternal {
  switch (action.type) {
    case 'PLAY': {
      const { albums, position, song, objectUrl } = action;
      return {
        ...state,
        status: 'playing',
        albums,
        position,
        song,
        objectUrl,
        progress: { position: 0, duration: song.durationMs / 1000 },
      };
    }

    case 'ADD': {
      const { album } = action;
      return {
        ...state,
        albums: [ ...state.albums, album ],
      };
    }

    case 'JUMP_TO': {
      const { position, song, objectUrl } = action;
      return {
        ...state,
        status: 'playing',
        position,
        song,
        objectUrl,
        progress: { position: 0, duration: song.durationMs / 1000 },
      };
    }

    case 'PAUSE':
      return { ...state, status: 'paused' };

    case 'RESUME':
      return { ...state, status: 'playing' };

    case 'STOP':
      return { ...state, status: 'stopped' };

    case 'SEEK': {
      const { position, userRequested } = action;
      return { ...state, status: userRequested ? 'seeking' : state.status, progress: { ...state.progress!, position } };
    }

    default:
      return state;
  }
};

export function NowPlayingProvider({ children }: { children: React.ReactNode}): React.ReactElement {
  const [ state, dispatch ] = useReducer(reduce, initialState);
  const audioElement = useRef<HTMLAudioElement | null>(null);

  const dispatcher = createNowPlayingDispatch(state, dispatch);

  const library = useLibrary();

  useEffect(() => {
    if (!audioElement.current) return;

    function handleTimeUpdate(): void {
      const position = audioElement.current!.currentTime;
      dispatch({ type: 'SEEK', position, userRequested: false });
    };

    async function handleEnded(): Promise<void> {
      if (!state.position) return;
      const position = getNext(state.albums, state.position!);
      const [ albumPos, songPos ] = position;
      const song = library.getSong(state.albums[albumPos].songs[songPos].songId);
      const objectUrl = await getObjectUrl(song.handle);
      dispatch({ type: 'JUMP_TO', position, song, objectUrl });
    };

    audioElement.current.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.current.addEventListener('ended', handleEnded);
    return () => {
      audioElement.current?.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.current?.removeEventListener('ended', handleEnded);
    };
  }, [ audioElement, library,state.albums, state.position, dispatch ]);

  useEffect(() => {
    if (!audioElement.current) return;
    if (state.objectUrl === audioElement.current.src) return;

    URL.revokeObjectURL(audioElement.current.src);

    if (state.objectUrl && state.status === 'playing') {
      audioElement.current.src = state.objectUrl;
      audioElement.current.currentTime = 0;
      audioElement.current.play();
    }
  }, [ audioElement, state.objectUrl, state.status ]);

  useEffect(() => {
    if (!audioElement.current) return;
    switch (state.status) {
      case 'playing':
        if (audioElement.current.paused) audioElement.current.play();
        break;

      case 'paused':
        if (!audioElement.current.paused) audioElement.current.pause();
        break;

      case 'stopped':
        if (!audioElement.current.paused) audioElement.current.pause();
        audioElement.current.currentTime = 0;
        break;

      case 'seeking':
        audioElement.current.currentTime = state.progress?.position || 0;
        audioElement.current.play();
        dispatch({ type: 'RESUME' });
        break;
    }
  }, [ audioElement, dispatch, state.status, state.progress ]);

  return (
    <NowPlayingContext.Provider value={state}>
      <NowPlayingDispatchContext.Provider value={dispatcher}>
        <audio ref={audioElement} />
        {children}
      </NowPlayingDispatchContext.Provider>
    </NowPlayingContext.Provider>
  )
};

export function useNowPlaying(): NowPlayingState {
  const context = useContext(NowPlayingContext);
  if (context === undefined) {
    throw new Error('useNowPlaying must be used within a NowPlayingProvider');
  }
  return context;
};

export function useNowPlayingDispatch(): NowPlayingDispatch {
  const context = useContext(NowPlayingDispatchContext);
  if (context === undefined) {
    throw new Error('useNowPlayingDispatch must be used within a NowPlayingContext');
  }
  return context;
};

function createNowPlayingDispatch(state: NowPlayingStateInternal, dispatch: React.ActionDispatch<[action: NowPlayingAction]>): NowPlayingDispatch {
  const library = useLibrary();

  const play = useCallback(async function (albums: Album[], position: [ number, number ] = [ 0, 0 ]): Promise<void> {
    const [ albumPos, songPos ] = position;
    const song = library.getSong(albums[albumPos].songs[songPos].songId);
    const objectUrl = await getObjectUrl(song.handle);
    dispatch({ type: 'PLAY', albums, position, song, objectUrl });
  }, [ library, dispatch ]);

  const add = useCallback(function (album: Album): void {
    dispatch({ type: 'ADD', album });
  }, [ dispatch ]);

  const jumpTo = useCallback(async function (position: [ number, number ]): Promise<void> {
    const [ albumPos, songPos ] = position;
    const song = library.getSong(state.albums[albumPos].songs[songPos].songId);
    const objectUrl = await getObjectUrl(song.handle);
    dispatch({ type: 'JUMP_TO', position, song, objectUrl });
  }, [ library, state.albums, dispatch ]);

  const pause = useCallback(function (): void {
    dispatch({ type: 'PAUSE' });
  }, [ dispatch ]);

  const resume = useCallback(function (): void {
    dispatch({ type: 'RESUME' });
  }, [ dispatch ]);

  const restart = useCallback(function (): void {
    dispatch({ type: 'SEEK', position: 0, userRequested: true });
  }, [ dispatch ]);

  const next = useCallback(async function (): Promise<void> {
    const position: [ number, number ] = state.position === undefined
      ? [ 0, 0 ]
      : getNext(state.albums, state.position);
    const [ albumPos, songPos ] = position;
    const song = library.getSong(state.albums[albumPos].songs[songPos].songId);
    const objectUrl = await getObjectUrl(song.handle);
    dispatch({ type: 'JUMP_TO', position, song, objectUrl });
  }, [ state.albums, state.position, dispatch ]);

  const previous = useCallback(async function (): Promise<void> {
    const position: [ number, number ] = state.position === undefined
      ? [ 0, 0 ]
      : getPrevious(state.albums, state.position);
    const [ albumPos, songPos ] = position;
    const song = library.getSong(state.albums[albumPos].songs[songPos].songId);
    const objectUrl = await getObjectUrl(song.handle);
    dispatch({ type: 'JUMP_TO', position, song, objectUrl });
  }, [ state.albums, state.position, dispatch ]);

  const stop = useCallback(function (): void {
    dispatch({ type: 'STOP' });
  }, [ dispatch ]);

  const seek = useCallback(function (position: number): void {
    dispatch({ type: 'SEEK', position, userRequested: true });
  }, [ dispatch ]);

  return useMemo(() => ({
    play,
    add,
    jumpTo,
    pause,
    resume,
    restart,
    next,
    previous,
    stop,
    seek,
  }), [ play, add, jumpTo, pause, resume, restart, next, previous, stop ])
};

function getNext(albums: Album[], position: [ number, number ]): [ number, number ] {
  const [ albumPos, songPos ] = position;
  return songPos+1 < albums[albumPos].songs.length
    ? [ albumPos, songPos+1]
    : [ (albumPos+1) % albums.length, 0 ];
};

function getPrevious(albums: Album[], position: [ number, number ]): [ number, number ] {
  const [ albumPos, songPos ] = position;
  const prevAlbumPos = (albumPos-1+albums.length) % albums.length;
  return songPos-1 >= 0
    ? [ albumPos, songPos-1]
    : [ prevAlbumPos, albums[prevAlbumPos].songs.length - 1 ];
};

async function getObjectUrl(songHandle: FileSystemFileHandle): Promise<string> {
  const file = await songHandle.getFile();
  return URL.createObjectURL(file);
};
