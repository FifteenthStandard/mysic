import {
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import {
  PlayArrow,
  PlaylistAdd,
} from '@mui/icons-material';
import { defaultCover } from '../assets';
import { useNowPlaying, useNowPlayingDispatch, useViewedAlbum } from '../contexts';
import { formatTime } from '../helpers';
import type { Album } from '../types';

export default function AlbumPage(): React.ReactElement {
  const album = useViewedAlbum();

  if (album === undefined) return <p>Album not found</p>;

  return (
    <Stack
      direction="column"
      sx={{
        alignItems: 'center',
        width: '100%',
      }}
    >
      <AlbumHeader album={album} />
      <Buttons album={album} />
      <TrackList album={album} />
    </Stack>
  );
};

function AlbumHeader({ album }: { album: Album }): React.ReactElement {
  return (
    <>
      <div style={{ position: 'relative', width: 400, height: 400, marginBlock: '32px 64px' }}>
        <img
          src={album.cover ?? defaultCover}
          height={400}
          width={400}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            filter: 'blur(40px) saturate(1.8)',
            scale: 1.1,
          }}
        />
        <img
          src={album.cover ?? defaultCover}
          height={400}
          width={400}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        />
      </div>
      <Typography variant="h1">{album.albumName}</Typography>
      <Typography variant="h2">{album.artistName}</Typography>
      <Typography>{album.releaseYear}</Typography>
    </>
  );
};

function Buttons({ album }: { album: Album }): React.ReactElement {
  const { albums } = useNowPlaying();
  const dispatch = useNowPlayingDispatch();

  function handleClickPlay(): void {
    dispatch.play([ album! ]);
  };

  function handleClickAdd(): void {
    dispatch.add(album!);
  };

  const addDisabled = albums.length === 0 || albums.includes(album);

  return (
    <div>
      <IconButton
        title="Play album"
        onClick={handleClickPlay}
      >
        <PlayArrow />
      </IconButton>
      <IconButton
        title="Add to play queue"
        onClick={handleClickAdd}
        disabled={addDisabled}
      >
        <PlaylistAdd />
      </IconButton>
    </div>
  );
};

function TrackList({ album }: { album : Album}): React.ReactElement {
  return (
    <Table
      sx={{
        '& td, & th': { border: 'none' }
      }}
    >
      <TableBody>
        {album.songs.map(song => (
          <TableRow key={song.songId}>
            <TableCell align="right">
              {song.position}
            </TableCell>
            <TableCell>
              {song.songName}
            </TableCell>
            <TableCell>
              {formatTime(song.durationMs)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
