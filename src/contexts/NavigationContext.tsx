import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate as useNavigatePrim, useParams } from 'react-router-dom';
import { useLibrary } from '../contexts';
import type { Album, AlbumSummary, Artist, ArtistSummary } from '../types';

type NavigateFunction = (target: AlbumSummary | ArtistSummary | undefined) => void;

export function useNavigate(): NavigateFunction {
  const navigate = useNavigatePrim();
  return useCallback(function (target: AlbumSummary | ArtistSummary | undefined): void {
    if (target === undefined) {
      navigate('/');
    } else  if ('albumId' in target) {
      navigate(`/album/${target.albumId}`);
    } else if ('artistId' in target) {
      navigate(`/artist/${target.artistId}`);
    }
  }, [ navigate ]);
};

export function useViewedAlbum(): Album | undefined {
  const { pathname } = useLocation();
  if (!pathname.startsWith('/album')) return undefined;
  const { albumId } = useParams();
  const library = useLibrary();

  return useMemo(() => (albumId !== undefined
    ? library.getAlbum(albumId)
    : undefined
  ), [ albumId, library ]);
};

export function useViewedArtist(): Artist | undefined {
  const { pathname } = useLocation();
  if (!pathname.startsWith('/artist')) return undefined;
  const { artistId } = useParams();
  const library = useLibrary();

  return useMemo(() => (artistId !== undefined
    ? library.getArtist(artistId)
    : undefined
  ), [ artistId, library ]);
};
