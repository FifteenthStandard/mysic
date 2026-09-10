import {
  createBrowserRouter,
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

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'album',
        element: <AlbumPage />,
      },
      {
        path: 'artist',
        element: <HomePage />,
      },
    ],
  },
], {
  basename: '/mysic/',
});

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
