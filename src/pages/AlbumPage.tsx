import {
  Stack,
} from '../components';
import { useNowPlayingDispatch, useViewedAlbum } from '../contexts';
import type { SongSummary } from '../types';

export default function AlbumPage(): React.ReactElement {
  const album = useViewedAlbum();
  const dispatch = useNowPlayingDispatch();

  if (!album) return <></>;

  function createClickSongHandler(song: SongSummary): (() => void) {
    return function handleClickSong(): void {
      dispatch.play(song.songId);
    };
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
      <ol>
        {album.songs.map(song => (
          <li
            key={song.songId}
            onClick={createClickSongHandler(song)}
            style={{ cursor: 'pointer' }}
          >
            {song.songName}
          </li>
        ))}
      </ol>
    </Stack>
  );
};
