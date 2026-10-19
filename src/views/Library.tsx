import {
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import { defaultCover } from '../assets';
import { useLibrary, useNavigate } from '../contexts';
import type { Album } from '../types';

export default function Library(): React.ReactElement {
  const { albums } = useLibrary();

  return (
    <ImageList cols={4}>
      {albums.map(album => (
        <AlbumTile
          key={album.albumId}
          album={album}
        />
      ))}
    </ImageList>
  );
};

function AlbumTile({ album }: { album: Album }): React.ReactElement {
  const navigate = useNavigate();

  function handleClick(): void {
    navigate(album);
  };

  return (
    <ImageListItem
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
      }}
    >
      <img
        src={album.cover ?? defaultCover}
        title={`${album.albumName} - ${album.artistName}`}
      />
      {!album.cover && (
        <ImageListItemBar
          title={album.albumName}
          subtitle={album.artistName}
        />
      )}
    </ImageListItem>
  );
};
