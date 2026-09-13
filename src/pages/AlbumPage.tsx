import {
  IconButton,
  Stack,
} from '../components';
import {
  PlayArrow,
  PlaylistAdd,
} from '../icons';
import { useNowPlayingDispatch, useViewedAlbum } from '../contexts';

export default function AlbumPage(): React.ReactElement {
  const album = useViewedAlbum();
  const dispatch = useNowPlayingDispatch();

  if (!album) return <></>;

  function handleClickPlay(): void {
    dispatch.play([ album! ]);
  };

  function handleClickAdd(): void {
    dispatch.add(album!);
  };

  return (
    <Stack>
      <img
        src={album?.cover.highdef}
        style={{
          aspectRatio: '1 / 1',
          maxHeight: '40dvh',
          maxWidth: '100dvw',
          objectFit: 'cover',
        }}
      />
      <h1>{album.albumName}</h1>
      <p>{album.artistName}</p>
      <Stack orientation="row" style={{ width: 'fit-content' }}>
        <IconButton onClick={handleClickPlay}>
          <PlayArrow />
        </IconButton>
        <IconButton onClick={handleClickAdd}>
          <PlaylistAdd />
        </IconButton>
      </Stack>
      <ol>
        {album.songs.map(song => (
          <li key={song.songId}>
            {song.songName}
          </li>
        ))}
      </ol>
    </Stack>
  );
};
