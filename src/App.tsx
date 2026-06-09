import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Layout from './components/ui/Layout';
import CookieBanner from './components/ui/CookieBanner';
import HomePage from './pages/HomePage';
import ClassesPage from './pages/ClassesPage';
import TrainersPage from './pages/TrainersPage';
import ContactPage from './pages/ContactPage';
import SchedulePage from './pages/SchedulePage';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'clase', element: <ClassesPage /> },
        { path: 'orar', element: <SchedulePage /> },
        { path: 'traineri', element: <TrainersPage /> },
        { path: 'contact', element: <ContactPage /> },
      ],
    },
  ],
  { basename: '/' },
);

export default function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
      <CookieBanner />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F2C59',
            color: '#F8F0E5',
            border: '1px solid #DAC0A3',
          },
        }}
      />
    </HelmetProvider>
  );
}
