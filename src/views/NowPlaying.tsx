import { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import {
  ExpandMore,
  Pause,
  PlayArrow,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import { defaultCover } from '../assets';
import { useNowPlaying, useNowPlayingDispatch } from '../contexts';
import { formatTime } from '../helpers';
import type { Album, Song } from '../types';

export default function NowPlaying(): React.ReactElement {
  const [ expanded, setExpanded ] = useState(false);
  const { albums, album, song } = useNowPlaying();

  if (!album || !song) return <></>;

  function handleChangeExpanded(): void {
    setExpanded(!expanded);
  };

  return (
    <Accordion
      disableGutters
      expanded={expanded}
      onChange={handleChangeExpanded}
      sx={{
        bottom: 0,
        left: 0,
        marginInline: 'inherit',
        maxWidth: 'inherit',
        position: 'fixed',
        right: 0,
      }}
    >
      {expanded
        ? <ExpandedSummary />
        : <CollapsedSummary />
      }
      <AccordionDetails
        sx={{
          height: 'calc(100dvh - 102px)',
        }}
      >
        <AlbumsTable albums={albums} />
      </AccordionDetails>
    </Accordion>
  );
};

function CollapsedSummary(): React.ReactElement {
  const nowPlaying = useNowPlaying();
  const dispatch = useNowPlayingDispatch();

  if (!nowPlaying.album || !nowPlaying.song) return <></>;

  const { status, album, song } = nowPlaying;

  function handleClickPlay(event: React.MouseEvent): void {
    event.stopPropagation();
    dispatch.resume();
  };

  function handleClickPause(event: React.MouseEvent): void {
    event.stopPropagation();
    dispatch.pause();
  };

  return (
      <AccordionSummary component="div">
        <Stack direction='column' sx={{ width: '100%' }}>
          <Stack
            direction='row'
            spacing={1}
          >
            <img
              src={album.cover ?? defaultCover}
              height={48}
              width={48}
            />
            <Stack direction='column' sx={{ flex: 1 }}>
              <Typography>{song.songName}</Typography>
              <Typography variant='caption'>{album.artistName}</Typography>
            </Stack>
            <div>
              {status === 'playing' ? (
                <IconButton onClick={handleClickPause}>
                  <Pause />
                </IconButton>
              ) : (
                <IconButton onClick={handleClickPlay}>
                  <PlayArrow />
                </IconButton>
              )}
            </div>
          </Stack>
          <ProgressBar />
        </Stack>
      </AccordionSummary>
  );
};

function ExpandedSummary(): React.ReactElement {
  const nowPlaying = useNowPlaying();
  const dispatch = useNowPlayingDispatch();

  if (!nowPlaying.album || !nowPlaying.song) return <></>;

  const { status, album, song, progress } = nowPlaying;

  function handleClickPrevious(event: React.MouseEvent): void {
    event.stopPropagation();
    if ((progress?.position ?? 0) > 5) {
      dispatch.restart();
    } else {
      dispatch.previous();
    }
  };

  function handleClickPlay(event: React.MouseEvent): void {
    event.stopPropagation();
    dispatch.resume();
  };

  function handleClickPause(event: React.MouseEvent): void {
    event.stopPropagation();
    dispatch.pause();
  };

  function handleClickNext(event: React.MouseEvent): void {
    event.stopPropagation();
    dispatch.next();
  };

  return (
      <AccordionSummary component="div">
        <Stack direction='column' sx={{ width: '100%' }}>
          <Stack
            direction='row'
            spacing={1}
          >
            <img
              src={album.cover ?? defaultCover}
              height={48}
              width={48}
            />
            <Stack direction='column' sx={{ flex: 1 }}>
              <Typography>{song.songName}</Typography>
              <Typography variant='caption'>{album.artistName}</Typography>
            </Stack>
            <div>
              <IconButton onClick={handleClickPrevious}>
                <SkipPrevious />
              </IconButton>
              {status === 'playing' ? (
                <IconButton onClick={handleClickPause}>
                  <Pause />
                </IconButton>
              ) : (
                <IconButton onClick={handleClickPlay}>
                  <PlayArrow />
                </IconButton>
              )}
              <IconButton onClick={handleClickNext}>
                <SkipNext />
              </IconButton>
              <IconButton>
                <ExpandMore />
              </IconButton>
            </div>
          </Stack>
          <ProgressBar />
        </Stack>
      </AccordionSummary>
  );
};

function ProgressBar(): React.ReactElement {
  const nowPlaying = useNowPlaying();
  const dispatch = useNowPlayingDispatch();

  const { progress } = nowPlaying;

  function handleChangeProgress(_: Event, position: number): void {
    dispatch.seek(position);
  };

  function handleClickProgress(event: React.MouseEvent): void {
    event.stopPropagation();
  };

  return (progress && progress.position && progress.duration) ? (
    <Slider
      value={progress?.position}
      max={progress?.duration}
      onChange={handleChangeProgress}
      onClick={handleClickProgress}
    />
  ) : (
    <Slider disabled value={0} />
  );
};

function AlbumsTable({ albums }: { albums: Album[] }): React.ReactElement {
  return (
    <TableContainer
      sx={{
        overflowY: 'scroll',
        maxHeight: '100%',
      }}
    >
      <Table>
        <colgroup>
          <col style={{ width: 'auto' }} />
          <col style={{ width: '100%' }} />
          <col style={{ width: 'auto' }} />
        </colgroup>
        <TableBody>
          {albums.map(album => (
            <AlbumRow key={album.albumId} album={album} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function AlbumRow({ album }: { album: Album }): React.ReactElement {
  const { album: nowPlayingAlbum} = useNowPlaying();
  const isPlaying = album === nowPlayingAlbum;
  const [ expanded, setExpanded ] = useState(isPlaying);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    const isPlaying = album === nowPlayingAlbum;
    if (isPlayingRef.current !== isPlaying) setExpanded(isPlaying);
    isPlayingRef.current = isPlaying;
  }, [ isPlayingRef, nowPlayingAlbum, setExpanded ]);

  function handleClickExpand(): void {
    setExpanded(!expanded);
  };

  return (
    <>
      <TableRow hover selected={isPlaying}>
        <TableCell>
          <img
            src={album.cover ?? defaultCover}
            height={48}
            width={48}
          />
        </TableCell>
        <TableCell>
          {album.albumName} - {album.artistName}
        </TableCell>
        <TableCell align="right">
          <IconButton
            onClick={handleClickExpand}
            style={{
              transform: `rotateZ(${expanded ? '180deg' : '0deg'})`,
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <ExpandMore />
          </IconButton>
        </TableCell>
      </TableRow>
      {
        expanded && album.songs.map(song => (
          <SongRow key={song.songId} song={song} />
        ))
      }
    </>
  );
};

function SongRow({ song }: { song: Song }): React.ReactElement {
  const [ hover, setHover ] = useState(false);
  const { song: nowPlayingSong} = useNowPlaying();
  const dispatch = useNowPlayingDispatch();
  const isPlaying = song === nowPlayingSong;

  function handleClick(): void {
    dispatch.jumpTo(song.songId);
  };

  function handleMouseEnter(): void {
    setHover(true);
  };

  function handleMouseLeave(): void {
    setHover(false);
  };

  return (
    <TableRow
      hover
      selected={isPlaying}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ cursor: 'pointer', height: 57 }}
    >
      <TableCell align="center">
        {hover ? (
          <IconButton size="small" sx={{ p: 0 }}>
            <PlayArrow />
          </IconButton>
        ) : song.position}
      </TableCell>
      <TableCell>
        {song.songName}
      </TableCell>
      <TableCell align="right">
        {formatTime(song.durationMs)}
      </TableCell>
    </TableRow>
  );
};
