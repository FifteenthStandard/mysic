import { useState } from 'react';
import {
  styles,
  BottomPane,
  IconButton,
  Slider,
  Stack,
  StackGap,
} from '../components';
import { useNowPlaying, useNowPlayingDispatch } from '../contexts';
import {
  ExpandMore,
  Pause,
  PlayArrow,
  Replay,
} from '../icons';

export default function NowPlaying(): React.ReactElement {
  const [ open, setOpen ] = useState(false);
  const { status, progress, song } = useNowPlaying();
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

  function handleClickRestart(): void {
    dispatch.restart();
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
          {
            [ 'paused', 'stopped' ].includes(status) ? (
              <IconButton onClick={handleClickResume}>
                <PlayArrow />
              </IconButton>
            ) : (
              <IconButton onClick={handleClickPause}>
                <Pause />
              </IconButton>
            )
          }
            <IconButton onClick={handleClickRestart}>
              <Replay />
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
          style={{
            width: '100%',
          }}
        />
        <Stack style={{ paddingBottom: styles.gap.sm }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, i) => (
            <div key={i} style={{ backgroundColor: styles.color.text.primary, width: '100%', height: '1lh', }}/>
          ))}
        </Stack>
      </Stack>
    </BottomPane>
  );
};
