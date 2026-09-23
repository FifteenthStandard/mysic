import { useState } from 'react';
import {
  styles,
  Grid,
  IconButton,
  ImageButton,
  Surface,
  TextField,
} from '../components';
import { useLibrary, useLibraryInitializer, useNavigate } from '../contexts';
import { Filter, FilterOff } from '../icons';
import type { AlbumSummary } from '../types';

export default function Library(): React.ReactElement {
  const [ filter, setFilter ] = useState('');

  const { initialized, albums } = useLibrary();
  const initializer = useLibraryInitializer();

  function handleClickInitialize(): void {
    initializer.initialize(true);
  };

  function handleClear(): void {
    initializer.reset();
  };

  return (
    <>
      <FilterBar filter={filter} setFilter={setFilter} />
      {!initialized && <button onClick={handleClickInitialize}>Initialize</button>}
      <AlbumGrid albums={albums} />
      <button onClick={handleClear}>Reset</button>
    </>
  )
};

function FilterBar({
  filter,
  setFilter,
}: {
  filter: string,
  setFilter: React.Dispatch<React.SetStateAction<string>>,
}): React.ReactElement {
  function handleFilterInput(event: React.ChangeEvent<HTMLInputElement>): void {
    setFilter(event.target.value);
  };

  function handleClickClear(): void {
    setFilter('');
  };

  return (
    <Surface
      style={{
        left: 0,
        marginInline: 'inherit',
        maxWidth: 'inherit',
        padding: 0,
        position: 'fixed',
        right: 0,
        top: styles.gap.sm,
      }}
    >
      <TextField
        value={filter}
        onChange={handleFilterInput}
        placeholder="Search your library..."
        endButton={
          <IconButton onClick={handleClickClear}>
            {filter ? <FilterOff /> : <Filter />}
          </IconButton>
        }
      />
    </Surface>
  )
};

function AlbumGrid({ albums }: { albums: AlbumSummary[] }): React.ReactElement {
  return (
    <Grid minWidth='20%' style={{ paddingInline: styles.gap.sm}}>
      {albums.map(album => (
        <AlbumItem
          key={album.albumId}
          album={album}
        />
      ))}
    </Grid>
  );
};

function AlbumItem({ album }: {album: AlbumSummary }): React.ReactElement {
  const navigate = useNavigate();

  function handleClick(): void {
    navigate(album);
  };

  return (
    <ImageButton
      onClick={handleClick}
      src={album.cover.thumbnail}
      style={{ aspectRatio: '1 / 1', width: '100%' }}
    />
  );
};
