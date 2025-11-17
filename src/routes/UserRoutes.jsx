import { lazy } from 'react';

// project imports
import MainLayout from 'layouts/MainLayout';
import Loadable from 'components/Loadable';
// pages
const HalamanManajemenPengguna = Loadable(lazy(() => import('views/pages/manajemen-pengguna/manajemen-pengguna')));
// utils

// ==============================|| MAIN ROUTES ||============================== //

const AuthRoutes = {
  path: '/auth',
  element: <MainLayout />,
  children: [
    {
      path: 'manajemen-pengguna',
      element: <HalamanManajemenPengguna />
    },
  ],
};
export default AuthRoutes;
