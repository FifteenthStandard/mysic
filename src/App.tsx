import {
  createHashRouter,
  Outlet,
  ScrollRestoration,
  RouterProvider,
} from 'react-router-dom';
import { styles, Container, CssBaseline } from './components';
import { LibraryProvider, NowPlayingProvider } from './contexts';
import {
  AlbumPage,
  HomePage,
} from './pages';
import { NowPlaying } from './views';

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/album/:albumId',
        element: <AlbumPage />,
      },
      {
        path: '/artist/:artistId',
        element: <HomePage />,
      },
    ],
  },
]);

export default function App(): React.ReactElement {
  return (
    <RouterProvider router={router} />
  );
};

function Layout(): React.ReactElement {
  return (
    <LibraryProvider>
      <NowPlayingProvider>
        <CssBaseline />
        <Container
          style={{
            boxSizing: 'border-box',
            maxWidth: '800px',
            minHeight: '100dvh',
            paddingBlock: `${styles.gap.sm} 71px`,
          }}
        >
          <Outlet />
          <ScrollRestoration />
          <NowPlaying />
        </Container>
      </NowPlayingProvider>
    </LibraryProvider>
  );
};
