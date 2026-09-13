import { useEffect, useRef, useState } from 'react';
import {
  styles,
  BottomPane,
  IconButton,
  Slider,
  Stack,
  StackGap,
} from '../components';
import { useNowPlaying, useNowPlayingDispatch } from '../contexts';
import { formatTime } from '../helpers';
import {
  ExpandMore,
  Pause,
  PlayArrow,
  SkipNext,
  SkipPrevious,
} from '../icons';
import type { Album } from '../types';

export default function NowPlaying(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { status, albums, progress, song } = useNowPlaying();
  const dispatch = useNowPlayingDispatch();

  function handleClickToggleOpen(): void {
    setOpen(!open);
  };

  function handleClickPause(): void {
    dispatch.pause();
  };

  function handleClickResume(): void {
    dispatch.resume();
  };

  function handleClickPrevious(): void {
    dispatch.previous();
  };

  function handleClickNext(): void {
    dispatch.next();
  };

  function handleChangePosition(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch.seek(parseInt(event.target.value));
  };

  if (!song || !progress) return <></>;

  return (
    <BottomPane>
      <Stack
        style={{
          height: open ? `calc(100dvh - ${styles.gap.sm})` : '66px',
          transition: 'height 0.2s ease-in-out',
        }}
      >
        <Stack orientation="row">
          <img
            src={song.album.cover.thumbnail}
            style={{ aspectRatio: '1 / 1', width: '32px' }}
          />
          <div>
            <div>{song.songName}</div>
            <div style={{ color: styles.color.text.secondary }}>{song.album.artistName}</div>
          </div>
          <StackGap />
          <IconButton onClick={handleClickPrevious}>
            <SkipPrevious />
          </IconButton>
          {
            ['paused', 'stopped'].includes(status) ? (
              <IconButton onClick={handleClickResume}>
                <PlayArrow />
              </IconButton>
            ) : (
              <IconButton onClick={handleClickPause}>
                <Pause />
              </IconButton>
            )
          }
          <IconButton onClick={handleClickNext}>
            <SkipNext />
          </IconButton>
          <IconButton
            onClick={handleClickToggleOpen}
            style={{
              transform: `rotateZ(${open ? '0deg' : '180deg'})`,
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <ExpandMore />
          </IconButton>
        </Stack>
        <Slider
          value={progress.position}
          max={progress.duration}
          onChange={handleChangePosition}
          style={{ width: '100%' }}
        />
        <div
          style={{
            overflowY: 'scroll',
            width: '100%',
          }}
        >
          <table
            style={{ width: '100%' }}
          >
            <thead>
              <tr>
                <th style={{ width: '1px', whiteSpace: 'nowrap' }} />
                <th />
                <th style={{ width: '1px', whiteSpace: 'nowrap' }} />
              </tr>
            </thead>
            <tbody>
              {albums.map((album, albumPos) => (
                <AlbumEntry
                  key={album.albumId}
                  album={album}
                  albumPos={albumPos}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Stack>
    </BottomPane>
  );
};

function AlbumEntry({
  album,
  albumPos,
}: {
  album: Album,
  albumPos: number,
}): React.ReactElement {
  const { position } = useNowPlaying();
  const positionRef = useRef(position);
  const dispatch = useNowPlayingDispatch();
  const [ open, setOpen ] = useState(position?.[0] === albumPos);

  function createSongClickHandler(position: [number, number]): React.MouseEventHandler {
    return function () {
      dispatch.jumpTo(position);
    };
  };

  function handleClickToggleOpen(): void {
    setOpen(!open);
  };

  useEffect(() => {
    if (positionRef.current !== position) setOpen(position?.[0] === albumPos);
    positionRef.current = position;
  }, [ open, setOpen, position ]);

  return (
    <>
      <tr key={album.albumId}>
        <td align="right">
          <img
            src={album.cover.thumbnail}
            style={{ aspectRatio: '1 / 1', width: '32px' }}
          />
        </td>
        <td style={{ fontWeight: position![0] === albumPos ? 'bold' : 'normal' }}>
          <div>{album.albumName}</div>
          <div style={{ color: styles.color.text.secondary }}>{album.artistName}</div>
        </td>
        <td align="right">
          <IconButton
            onClick={handleClickToggleOpen}
            style={{
              transform: `rotateZ(${open ? '0deg' : '180deg'})`,
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <ExpandMore />
          </IconButton>
        </td>
      </tr>
      {
        open && album.songs.map((song, songPos) => (
          <tr
            key={song.songId}
            onClick={createSongClickHandler([albumPos, songPos])}
            style={{ cursor: 'pointer', fontWeight: position![0] === albumPos && position![1] === songPos ? 'bold' : 'normal' }}
          >
            <td align="right">{song.position}</td>
            <td>{song.songName}</td>
            <td align="right">{formatTime(song.durationMs)}</td>
          </tr>
        ))
      }
    </>
  );
}