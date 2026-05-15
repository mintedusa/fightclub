import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Layout from './components/ui/Layout';
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
  { basename: '/fightclub' },
);

export default function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid #F5C518',
          },
        }}
      />
    </HelmetProvider>
  );
}
