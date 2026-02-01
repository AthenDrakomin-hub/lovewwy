import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import MusicPage from '../pages/MusicPage';
import VideosPage from '../pages/VideosPage';
import TreasureBoxPage from '../pages/TreasureBoxPage';
import AdminPage from '../pages/AdminPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/music',
    element: <MusicPage />
  },
  {
    path: '/videos',
    element: <VideosPage />
  },
  {
    path: '/treasure',
    element: <TreasureBoxPage />
  },
  {
    path: '/admin',
    element: <AdminPage />
  }
]);