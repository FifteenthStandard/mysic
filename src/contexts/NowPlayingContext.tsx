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
  song: undefined,
  progress: undefined,
};

type PlayAction = {
  type: 'PLAY';
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
  | PauseAction
  | ResumeAction
  | StopAction
  | SeekAction;

function reduce(state: NowPlayingStateInternal, action: NowPlayingAction): NowPlayingStateInternal {
  switch (action.type) {
    case 'PLAY': {
      const { song, objectUrl } = action;
      return {
        ...state,
        status: 'playing',
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

  const dispatcher = createNowPlayingDispatch(dispatch);

  useEffect(() => {
    if (!audioElement.current) return;

    function handleTimeUpdate(event: Event): void {
      const position = (event.target as HTMLAudioElement).currentTime;
      dispatch({ type: 'SEEK', position, userRequested: false });
    };

    audioElement.current.addEventListener('timeupdate', handleTimeUpdate);
    return () => audioElement.current?.removeEventListener('timeupdate', handleTimeUpdate);
  }, [ audioElement, dispatch ]);

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

function createNowPlayingDispatch(dispatch: React.ActionDispatch<[action: NowPlayingAction]>): NowPlayingDispatch {
  const library = useLibrary();

  const play = useCallback(async function (songId: string): Promise<void> {
    const song = library.getSong(songId);
    const objectUrl = await getObjectUrl(song.handle);
    dispatch({ type: 'PLAY', song, objectUrl });
  }, [ library, dispatch ]);

  const pause = useCallback(function (): void {
    dispatch({ type: 'PAUSE' });
  }, [ dispatch ]);

  const resume = useCallback(function (): void {
    dispatch({ type: 'RESUME' });
  }, [ dispatch ]);

  const restart = useCallback(function (): void {
    dispatch({ type: 'SEEK', position: 0, userRequested: true });
  }, [ dispatch ]);

  const stop = useCallback(function (): void {
    dispatch({ type: 'STOP' });
  }, [ dispatch ]);

  const seek = useCallback(function (position: number): void {
    dispatch({ type: 'SEEK', position, userRequested: true });
  }, [ dispatch ]);

  return useMemo(() => ({
    play,
    pause,
    resume,
    restart,
    stop,
    seek,
  }), [ play, pause, resume, restart, stop ])
};

async function getObjectUrl(songHandle: FileSystemFileHandle): Promise<string> {
  const file = await songHandle.getFile();
  return URL.createObjectURL(file);
};
