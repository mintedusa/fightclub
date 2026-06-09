import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Layout from './components/ui/Layout';
import CookieBanner from './components/ui/CookieBanner';

const HomePage     = lazy(() => import('./pages/HomePage'));
const ClassesPage  = lazy(() => import('./pages/ClassesPage'));
const TrainersPage = lazy(() => import('./pages/TrainersPage'));
const ContactPage  = lazy(() => import('./pages/ContactPage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true,        element: <HomePage />     },
        { path: 'clase',      element: <ClassesPage />  },
        { path: 'orar',       element: <SchedulePage /> },
        { path: 'traineri',   element: <TrainersPage /> },
        { path: 'contact',    element: <ContactPage />  },
      ],
    },
  ],
  { basename: '/' },
);

function PageLoader() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Suspense fallback={<PageLoader />}>
        <RouterProvider router={router} />
      </Suspense>
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
