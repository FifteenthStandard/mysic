import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate as useNavigatePrim, useSearchParams } from 'react-router-dom';
import { useLibrary } from '../contexts';
import type { Album, AlbumSummary, Artist, ArtistSummary } from '../types';

type NavigateFunction = (target: AlbumSummary | ArtistSummary | undefined) => void;

export function useNavigate(): NavigateFunction {
  const navigate = useNavigatePrim();
  return useCallback(function (target: AlbumSummary | ArtistSummary | undefined): void {
    if (target === undefined) {
      navigate('/');
    } else  if ('albumId' in target) {
      navigate(`/album?albumId=${target.albumId}`);
    } else if ('artistId' in target) {
      navigate(`/artist?artistId=${target.artistId}`);
    }
  }, [ navigate ]);
};

export function useViewedAlbum(): Album | undefined {
  const { pathname } = useLocation();
  if (pathname !== '/album') return undefined;
  const [ params ] = useSearchParams();
  const albumId = params.get('albumId');
  const library = useLibrary();

  return useMemo(() => (albumId !== null
    ? library.getAlbum(albumId)
    : undefined
  ), [ albumId, library ]);
};

export function useViewedArtist(): Artist | undefined {
  const { pathname } = useLocation();
  if (pathname !== '/artist') return undefined;
  const [ params ] = useSearchParams();
  const artistid = params.get('artistId');
  const library = useLibrary();

  return useMemo(() => (artistid !== null
    ? library.getArtist(artistid)
    : undefined
  ), [ artistid, library ]);
};
