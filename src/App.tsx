import {
  createHashRouter,
  Outlet,
  ScrollRestoration,
  RouterProvider,
} from 'react-router-dom';
import {
  createTheme,
  Container,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import { LibraryProvider, NowPlayingProvider } from './contexts';
import {
  AlbumPage,
  HomePage,
} from './pages';
import { NowPlaying } from './views';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    h1: { fontSize: '1.5rem' },
    h2: { fontSize: '1.3rem' },
  },
});

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
    <ThemeProvider theme={darkTheme}>
      <LibraryProvider>
        <NowPlayingProvider>
          <CssBaseline />
          <Container
            style={{
              boxSizing: 'border-box',
              maxWidth: '800px',
              minHeight: '100dvh',
            }}
          >
            <Outlet />
            <ScrollRestoration />
            <NowPlaying />
          </Container>
        </NowPlayingProvider>
      </LibraryProvider>
    </ThemeProvider>
  );
};
