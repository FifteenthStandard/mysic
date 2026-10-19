import { useLibrary, useLibraryInitializer } from '../contexts';
import { Library } from '../views';

export default function HomePage(): React.ReactElement {
  const { status } = useLibrary();

  switch (status) {
    case 'uninitialized':
      return <Initialize />;

    default:
      return <Library />;
  }
};

function Initialize(): React.ReactElement {
  const initializer = useLibraryInitializer();

  function handleClick(): void {
    initializer.initialize(true);
  };

  return (
    <button onClick={handleClick}>
      Initialize
    </button>
  );
};
