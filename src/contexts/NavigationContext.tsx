import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate as useNavigatePrim, useParams } from 'react-router-dom';
import { useLibrary } from '../contexts';
import type { Album, Artist } from '../types';

type NavigateFunction = (target: Album | Artist | undefined) => void;

export function useNavigate(): NavigateFunction {
  const navigate = useNavigatePrim();
  return useCallback(function (target: Album | Artist | undefined): void {
    if (target === undefined) {
      navigate('/');
    } else  if ('albumId' in target) {
      navigate(`/album/${encodeURIComponent(target.albumId)}`);
    } else if ('artistId' in target) {
      navigate(`/artist/${encodeURIComponent(target.artistId)}`);
    }
  }, [ navigate ]);
};

export function useViewedAlbum(): Album | undefined {
  const { pathname } = useLocation();
  if (!pathname.startsWith('/album')) return undefined;
  const { albumId } = useParams();
  const library = useLibrary();

  return useMemo(() => (albumId !== undefined
    ? library.getAlbum(decodeURIComponent(albumId))
    : undefined
  ), [ albumId, library ]);
};
