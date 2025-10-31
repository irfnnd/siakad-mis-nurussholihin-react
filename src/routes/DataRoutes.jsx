import { lazy } from 'react';

// project imports
import MainLayout from 'layouts/MainLayout';
import Loadable from 'components/Loadable';
// pages
const SiswaCRUD = Loadable(lazy(() => import('views/pages/data-master/data-siswa/data-siswa-crud')));
const DataPegawai = Loadable(lazy(() => import('views/pages/data-master/data-pegawai/data-pegawai-crud')));

// utils

// ==============================|| MAIN ROUTES ||============================== //

const DataRoutes = {
  path: '/data',
  element: <MainLayout />,
  children: [
    {
      path: 'siswa',
      element: <SiswaCRUD />
    },
    {
      path: 'pegawai',
      element: < DataPegawai/>
    },
  ],
};
export default DataRoutes;
